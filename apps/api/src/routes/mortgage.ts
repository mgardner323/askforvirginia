import { Router, Request, Response } from 'express';
import Joi from 'joi';
import {
  calculateMortgage,
  calculateAffordability,
  calculateRefinance,
  calculateARM,
  generateAmortizationSchedule,
  calculatePropertyTax,
  calculateHomeInsurance,
  calculateDetailedPropertyTax,
  calculateRentVsBuyAnalysis,
  MortgageInputs,
  AffordabilityInputs,
  RefinanceInputs,
  ARMInputs,
  PropertyTaxInputs,
  RentVsBuyInputs,
} from '../utils/mortgageCalculations';

const router = Router();

// Validation schemas
const mortgageCalculationSchema = Joi.object({
  homePrice: Joi.number().min(50000).max(10000000).required(),
  downPayment: Joi.number().min(0).max(2000000).required(),
  loanTerm: Joi.number().valid(10, 15, 20, 25, 30).required(),
  interestRate: Joi.number().min(0.1).max(20).required(),
  propertyTax: Joi.number().min(0).optional(),
  homeInsurance: Joi.number().min(0).optional(),
  pmi: Joi.number().min(0).optional(),
  hoaFees: Joi.number().min(0).optional(),
  utilities: Joi.number().min(0).optional(),
  maintenance: Joi.number().min(0).optional(),
});

const affordabilitySchema = Joi.object({
  monthlyIncome: Joi.number().min(1000).max(100000).required(),
  monthlyDebts: Joi.number().min(0).max(50000).required(),
  downPayment: Joi.number().min(0).max(2000000).required(),
  interestRate: Joi.number().min(0.1).max(20).required(),
  loanTerm: Joi.number().valid(10, 15, 20, 25, 30).required(),
  propertyTaxRate: Joi.number().min(0).max(0.05).optional(),
  insuranceRate: Joi.number().min(0).max(0.02).optional(),
  debtToIncomeRatio: Joi.number().min(0.1).max(0.5).optional(),
});

const refinanceSchema = Joi.object({
  currentLoanBalance: Joi.number().min(10000).max(5000000).required(),
  currentInterestRate: Joi.number().min(0.1).max(20).required(),
  currentMonthlyPayment: Joi.number().min(100).max(50000).required(),
  remainingTerm: Joi.number().min(1).max(30).required(),
  newInterestRate: Joi.number().min(0.1).max(20).required(),
  newLoanTerm: Joi.number().valid(10, 15, 20, 25, 30).required(),
  closingCosts: Joi.number().min(0).max(50000).required(),
});

const amortizationSchema = Joi.object({
  loanAmount: Joi.number().min(10000).max(5000000).required(),
  interestRate: Joi.number().min(0.1).max(20).required(),
  loanTerm: Joi.number().valid(10, 15, 20, 25, 30).required(),
  startDate: Joi.date().optional(),
});

const armSchema = Joi.object({
  homePrice: Joi.number().min(50000).max(10000000).required(),
  downPayment: Joi.number().min(0).max(2000000).required(),
  loanTerm: Joi.number().valid(15, 20, 25, 30).required(),
  initialRate: Joi.number().min(0.1).max(20).required(),
  initialPeriod: Joi.number().valid(1, 3, 5, 7, 10).required(),
  adjustmentPeriod: Joi.number().valid(1, 2, 3).required(),
  initialCap: Joi.number().min(0.1).max(5).required(),
  periodicCap: Joi.number().min(0.1).max(5).required(),
  lifetimeCap: Joi.number().min(1).max(10).required(),
  margin: Joi.number().min(1).max(5).required(),
  currentIndex: Joi.number().min(0.1).max(15).required(),
});

/**
 * POST /api/mortgage/calculate
 * Calculate monthly mortgage payment and details
 */
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { error, value } = mortgageCalculationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message,
      });
    }

    const inputs: MortgageInputs = value;
    
    // Validate down payment is not more than home price
    if (inputs.downPayment > inputs.homePrice) {
      return res.status(400).json({
        success: false,
        message: 'Down payment cannot exceed home price',
      });
    }

    // Calculate mortgage details
    const results = calculateMortgage(inputs);

    res.json({
      success: true,
      message: 'Mortgage calculation completed successfully',
      data: {
        inputs,
        results,
      },
    });
  } catch (error) {
    console.error('Mortgage calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during mortgage calculation',
    });
  }
});

/**
 * POST /api/mortgage/affordability
 * Calculate home affordability based on income and debts
 */
router.post('/affordability', async (req: Request, res: Response) => {
  try {
    const { error, value } = affordabilitySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message,
      });
    }

    const inputs: AffordabilityInputs = value;
    const results = calculateAffordability(inputs);

    res.json({
      success: true,
      message: 'Affordability calculation completed successfully',
      data: {
        inputs,
        results,
      },
    });
  } catch (error) {
    console.error('Affordability calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during affordability calculation',
    });
  }
});

/**
 * POST /api/mortgage/refinance
 * Calculate refinancing benefits and break-even analysis
 */
router.post('/refinance', async (req: Request, res: Response) => {
  try {
    const { error, value } = refinanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message,
      });
    }

    const inputs: RefinanceInputs = value;
    const results = calculateRefinance(inputs);

    res.json({
      success: true,
      message: 'Refinance calculation completed successfully',
      data: {
        inputs,
        results,
      },
    });
  } catch (error) {
    console.error('Refinance calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during refinance calculation',
    });
  }
});

/**
 * POST /api/mortgage/amortization
 * Generate detailed amortization schedule
 */
router.post('/amortization', async (req: Request, res: Response) => {
  try {
    const { error, value } = amortizationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message,
      });
    }

    const { loanAmount, interestRate, loanTerm } = value;
    const schedule = generateAmortizationSchedule(loanAmount, interestRate, loanTerm);

    res.json({
      success: true,
      message: 'Amortization schedule generated successfully',
      data: {
        loanAmount,
        interestRate,
        loanTerm,
        totalPayments: schedule.length,
        schedule,
      },
    });
  } catch (error) {
    console.error('Amortization calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during amortization calculation',
    });
  }
});

/**
 * GET /api/mortgage/property-tax/:homePrice/:county?
 * Calculate estimated property tax for Southern California counties
 */
router.get('/property-tax/:homePrice/:county?', async (req: Request, res: Response) => {
  try {
    const homePrice = parseFloat(req.params.homePrice);
    const county = req.params.county || 'riverside';

    if (isNaN(homePrice) || homePrice < 50000 || homePrice > 10000000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid home price. Must be between $50,000 and $10,000,000',
      });
    }

    const annualPropertyTax = calculatePropertyTax(homePrice, county);
    const monthlyPropertyTax = Math.round((annualPropertyTax / 12) * 100) / 100;

    res.json({
      success: true,
      message: 'Property tax calculated successfully',
      data: {
        homePrice,
        county: county.toLowerCase(),
        annualPropertyTax,
        monthlyPropertyTax,
      },
    });
  } catch (error) {
    console.error('Property tax calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during property tax calculation',
    });
  }
});

/**
 * GET /api/mortgage/insurance/:homePrice/:highRisk?
 * Calculate estimated home insurance
 */
router.get('/insurance/:homePrice/:highRisk?', async (req: Request, res: Response) => {
  try {
    const homePrice = parseFloat(req.params.homePrice);
    const highRisk = req.params.highRisk === 'true';

    if (isNaN(homePrice) || homePrice < 50000 || homePrice > 10000000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid home price. Must be between $50,000 and $10,000,000',
      });
    }

    const annualInsurance = calculateHomeInsurance(homePrice, highRisk);
    const monthlyInsurance = Math.round((annualInsurance / 12) * 100) / 100;

    res.json({
      success: true,
      message: 'Home insurance calculated successfully',
      data: {
        homePrice,
        highRisk,
        annualInsurance,
        monthlyInsurance,
      },
    });
  } catch (error) {
    console.error('Insurance calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during insurance calculation',
    });
  }
});

/**
 * GET /api/mortgage/rates
 * Get current interest rate information and trends
 */
router.get('/rates', async (req: Request, res: Response) => {
  try {
    // In a real application, this would fetch from an external API
    // For now, return sample rates
    const rates = {
      conventional: {
        '30-year': 7.25,
        '15-year': 6.85,
        '10-year': 6.65,
      },
      fha: {
        '30-year': 7.15,
        '15-year': 6.75,
      },
      va: {
        '30-year': 7.05,
        '15-year': 6.65,
      },
      jumbo: {
        '30-year': 7.45,
        '15-year': 7.05,
      },
      lastUpdated: new Date().toISOString(),
      source: 'Market average for Southern California',
      disclaimer: 'Rates shown are estimates and may vary based on credit score, loan amount, and other factors.',
    };

    res.json({
      success: true,
      message: 'Interest rates retrieved successfully',
      data: rates,
    });
  } catch (error) {
    console.error('Interest rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving interest rates',
    });
  }
});

/**
 * POST /api/mortgage/arm
 * Calculate Adjustable Rate Mortgage scenarios and analysis
 */
router.post('/arm', async (req: Request, res: Response) => {
  try {
    const { error, value } = armSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message,
      });
    }

    const inputs: ARMInputs = value;
    
    // Validate down payment is not more than home price
    if (inputs.downPayment > inputs.homePrice) {
      return res.status(400).json({
        success: false,
        message: 'Down payment cannot exceed home price',
      });
    }

    // Calculate ARM scenarios
    const results = calculateARM(inputs);

    res.json({
      success: true,
      message: 'ARM calculation completed successfully',
      data: {
        inputs,
        results,
      },
    });
  } catch (error) {
    console.error('ARM calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during ARM calculation',
    });
  }
});

/**
 * GET /api/mortgage/county-data
 * Get Southern California county information for calculations
 */
router.get('/county-data', async (req: Request, res: Response) => {
  try {
    const countyData = {
      counties: [
        {
          name: 'Riverside County',
          code: 'riverside',
          propertyTaxRate: 0.0121,
          averageInsuranceRate: 0.0045,
          medianHomePrice: 650000,
          highRiskAreas: ['Desert areas', 'Mountain communities'],
        },
        {
          name: 'San Bernardino County',
          code: 'san-bernardino',
          propertyTaxRate: 0.0118,
          averageInsuranceRate: 0.0048,
          medianHomePrice: 550000,
          highRiskAreas: ['Mountain areas', 'Desert regions'],
        },
        {
          name: 'Orange County',
          code: 'orange',
          propertyTaxRate: 0.0073,
          averageInsuranceRate: 0.0042,
          medianHomePrice: 1200000,
          highRiskAreas: ['Canyon areas', 'Hillside communities'],
        },
        {
          name: 'Los Angeles County',
          code: 'los-angeles',
          propertyTaxRate: 0.0072,
          averageInsuranceRate: 0.0045,
          medianHomePrice: 950000,
          highRiskAreas: ['Hillside areas', 'Canyon regions'],
        },
        {
          name: 'Ventura County',
          code: 'ventura',
          propertyTaxRate: 0.0074,
          averageInsuranceRate: 0.0047,
          medianHomePrice: 850000,
          highRiskAreas: ['Mountain areas', 'Coastal canyons'],
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'County data retrieved successfully',
      data: countyData,
    });
  } catch (error) {
    console.error('County data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving county data',
    });
  }
});

// Phase 3 API Endpoints

// Validation schemas for Phase 3
const propertyTaxSchema = Joi.object({
  homePrice: Joi.number().min(50000).max(10000000).required(),
  county: Joi.string().valid(
    'riverside', 'san-bernardino', 'orange', 'los-angeles', 
    'ventura', 'imperial', 'kern', 'santa-barbara'
  ).required(),
  exemptions: Joi.object({
    homestead: Joi.boolean().optional(),
    senior: Joi.boolean().optional(),
    veteran: Joi.boolean().optional(),
  }).optional(),
});

const rentVsBuySchema = Joi.object({
  homePrice: Joi.number().min(50000).max(10000000).required(),
  downPayment: Joi.number().min(0).max(2000000).required(),
  interestRate: Joi.number().min(0.1).max(20).required(),
  loanTerm: Joi.number().valid(15, 20, 25, 30).required(),
  monthlyRent: Joi.number().min(500).max(20000).required(),
  propertyTaxRate: Joi.number().min(0).max(5).required(),
  homeInsuranceRate: Joi.number().min(0).max(2).required(),
  hoaFees: Joi.number().min(0).max(2000).required(),
  maintenanceRate: Joi.number().min(0).max(3).required(),
  closingCosts: Joi.number().min(0).max(100000).required(),
  rentIncrease: Joi.number().min(0).max(10).required(),
  homeAppreciation: Joi.number().min(-5).max(15).required(),
  investmentReturn: Joi.number().min(0).max(20).required(),
  marginalTaxRate: Joi.number().min(0).max(50).required(),
  yearsToAnalyze: Joi.number().valid(5, 10, 15, 20).required(),
});

/**
 * POST /api/mortgage/property-tax-detailed
 * Calculate detailed property tax with exemptions and breakdown
 */
router.post('/property-tax-detailed', async (req: Request, res: Response) => {
  try {
    const { error, value } = propertyTaxSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message,
      });
    }

    const inputs: PropertyTaxInputs = value;
    const results = calculateDetailedPropertyTax(inputs);

    res.json({
      success: true,
      message: 'Detailed property tax calculation completed successfully',
      data: {
        inputs,
        results,
      },
    });
  } catch (error) {
    console.error('Property tax detailed calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during detailed property tax calculation',
    });
  }
});

/**
 * POST /api/mortgage/rent-vs-buy
 * Compare renting vs buying with comprehensive financial analysis
 */
router.post('/rent-vs-buy', async (req: Request, res: Response) => {
  try {
    const { error, value } = rentVsBuySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message,
      });
    }

    const inputs: RentVsBuyInputs = value;
    
    // Validate down payment is not more than home price
    if (inputs.downPayment > inputs.homePrice) {
      return res.status(400).json({
        success: false,
        message: 'Down payment cannot exceed home price',
      });
    }

    const results = calculateRentVsBuyAnalysis(inputs);

    res.json({
      success: true,
      message: 'Rent vs buy analysis completed successfully',
      data: {
        inputs,
        results,
      },
    });
  } catch (error) {
    console.error('Rent vs buy calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during rent vs buy analysis',
    });
  }
});

/**
 * GET /api/mortgage/pre-approval-estimate
 * Get pre-approval likelihood estimate based on basic parameters
 */
router.get('/pre-approval-estimate', async (req: Request, res: Response) => {
  try {
    const {
      annualIncome,
      monthlyDebts,
      creditScore,
      downPayment,
      homePrice,
      loanType = 'conventional'
    } = req.query;

    // Basic validation
    if (!annualIncome || !monthlyDebts || !creditScore || !downPayment || !homePrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: annualIncome, monthlyDebts, creditScore, downPayment, homePrice',
      });
    }

    const income = parseFloat(annualIncome as string);
    const debts = parseFloat(monthlyDebts as string);
    const credit = parseInt(creditScore as string);
    const down = parseFloat(downPayment as string);
    const price = parseFloat(homePrice as string);

    // Simple pre-approval calculation
    const monthlyIncome = income / 12;
    const dtiRatio = (debts / monthlyIncome) * 100;
    const ltvRatio = ((price - down) / price) * 100;

    let approvalLikelihood = 50;
    let estimatedRate = 7.25;

    // Credit score impact
    if (credit >= 760) {
      approvalLikelihood += 30;
      estimatedRate -= 0.5;
    } else if (credit >= 700) {
      approvalLikelihood += 20;
      estimatedRate -= 0.25;
    } else if (credit >= 660) {
      approvalLikelihood += 10;
    } else if (credit < 620) {
      approvalLikelihood -= 20;
      estimatedRate += 0.5;
    }

    // DTI impact
    if (dtiRatio <= 28) approvalLikelihood += 20;
    else if (dtiRatio <= 36) approvalLikelihood += 10;
    else if (dtiRatio > 43) approvalLikelihood -= 20;

    // LTV impact
    if (ltvRatio <= 80) approvalLikelihood += 15;
    else if (ltvRatio > 95) approvalLikelihood -= 15;

    approvalLikelihood = Math.min(Math.max(approvalLikelihood, 0), 100);

    const results = {
      approvalLikelihood,
      estimatedRate,
      dtiRatio: parseFloat(dtiRatio.toFixed(1)),
      ltvRatio: parseFloat(ltvRatio.toFixed(1)),
      recommendations: [] as string[],
    };

    // Add recommendations
    if (credit < 700) {
      results.recommendations.push('Consider improving your credit score for better rates');
    }
    if (dtiRatio > 36) {
      results.recommendations.push('Pay down existing debts to improve debt-to-income ratio');
    }
    if (ltvRatio > 80) {
      results.recommendations.push('Consider increasing down payment to avoid PMI');
    }

    res.json({
      success: true,
      message: 'Pre-approval estimate completed successfully',
      data: results,
    });
  } catch (error) {
    console.error('Pre-approval estimate error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during pre-approval estimate',
    });
  }
});

/**
 * GET /api/mortgage/calculator-options
 * Get configuration options for all mortgage calculators
 */
router.get('/calculator-options', async (req: Request, res: Response) => {
  try {
    const options = {
      loanTerms: [
        { value: 15, label: '15 years', description: 'Higher payments, less interest' },
        { value: 20, label: '20 years', description: 'Moderate payments and interest' },
        { value: 25, label: '25 years', description: 'Lower payments, more interest' },
        { value: 30, label: '30 years', description: 'Lowest payments, most interest' },
      ],
      loanTypes: [
        { 
          value: 'conventional', 
          label: 'Conventional', 
          description: 'Standard loan, 20% down recommended',
          minDownPayment: 20,
          maxDTI: 36,
        },
        { 
          value: 'FHA', 
          label: 'FHA', 
          description: 'Government-backed, 3.5% down minimum',
          minDownPayment: 3.5,
          maxDTI: 43,
        },
        { 
          value: 'VA', 
          label: 'VA', 
          description: 'Veterans only, no down payment required',
          minDownPayment: 0,
          maxDTI: 41,
        },
        { 
          value: 'jumbo', 
          label: 'Jumbo', 
          description: 'High-value loans, strict requirements',
          minDownPayment: 20,
          maxDTI: 36,
        },
      ],
      counties: [
        { code: 'riverside', name: 'Riverside County', taxRate: 1.21 },
        { code: 'san-bernardino', name: 'San Bernardino County', taxRate: 1.18 },
        { code: 'orange', name: 'Orange County', taxRate: 0.73 },
        { code: 'los-angeles', name: 'Los Angeles County', taxRate: 0.72 },
        { code: 'ventura', name: 'Ventura County', taxRate: 0.74 },
        { code: 'imperial', name: 'Imperial County', taxRate: 0.69 },
        { code: 'kern', name: 'Kern County', taxRate: 0.84 },
        { code: 'santa-barbara', name: 'Santa Barbara County', taxRate: 0.74 },
      ],
      defaultRates: {
        interest: 7.25,
        propertyTax: 1.21,
        homeInsurance: 0.45,
        pmi: 0.5,
        hoa: 150,
        maintenance: 1.0,
      },
      calculatorFeatures: {
        basic: ['Monthly payment', 'Total interest', 'Amortization schedule'],
        affordability: ['Maximum home price', 'DTI analysis', 'Income requirements'],
        refinance: ['Monthly savings', 'Break-even analysis', 'Interest savings'],
        arm: ['Rate adjustment scenarios', 'Payment schedules', 'Risk analysis'],
        extraPayments: ['Interest savings', 'Time reduction', 'Multiple scenarios'],
        rentVsBuy: ['Break-even analysis', 'Opportunity cost', 'Tax benefits'],
        preApproval: ['Likelihood score', 'Requirements check', 'Recommendations'],
      },
    };

    res.json({
      success: true,
      message: 'Calculator options retrieved successfully',
      data: options,
    });
  } catch (error) {
    console.error('Calculator options error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving calculator options',
    });
  }
});

export default router;