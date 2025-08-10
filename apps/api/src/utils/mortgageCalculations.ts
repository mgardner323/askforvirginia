/**
 * Comprehensive Mortgage Calculator Utilities
 * Designed specifically for Southern California real estate market
 */

export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number; // in years
  interestRate: number; // annual percentage
  propertyTax?: number; // annual amount
  homeInsurance?: number; // annual amount
  pmi?: number; // monthly amount
  hoaFees?: number; // monthly amount
  utilities?: number; // monthly estimate
  maintenance?: number; // monthly estimate
}

export interface MortgageResults {
  monthlyPayment: number;
  principalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  totalMonthlyPayment: number;
  loanAmount: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: Date;
  amortizationSchedule: AmortizationEntry[];
}

export interface AmortizationEntry {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface AffordabilityInputs {
  monthlyIncome: number;
  monthlyDebts: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertyTaxRate?: number;
  insuranceRate?: number;
  debtToIncomeRatio?: number;
}

export interface AffordabilityResults {
  maxHomePrice: number;
  maxMonthlyPayment: number;
  maxLoanAmount: number;
  requiredIncome: number;
  debtToIncomeRatio: number;
  frontEndRatio: number;
  backEndRatio: number;
  recommendation: string;
}

export interface RefinanceInputs {
  currentLoanBalance: number;
  currentInterestRate: number;
  currentMonthlyPayment: number;
  remainingTerm: number;
  newInterestRate: number;
  newLoanTerm: number;
  closingCosts: number;
}

export interface RefinanceResults {
  newMonthlyPayment: number;
  monthlySavings: number;
  totalSavings: number;
  breakEvenMonths: number;
  totalInterestOld: number;
  totalInterestNew: number;
  interestSavings: number;
  recommendation: string;
}

export interface ARMInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  initialRate: number;
  initialPeriod: number; // Years before first adjustment
  adjustmentPeriod: number; // Years between adjustments
  initialCap: number; // Max rate increase on first adjustment
  periodicCap: number; // Max rate increase per adjustment
  lifetimeCap: number; // Max rate over life of loan
  margin: number; // Lender margin added to index
  currentIndex: number; // Current index rate (e.g., SOFR)
}

export interface ARMResults {
  initialMonthlyPayment: number;
  maxPossiblePayment: number;
  worstCaseScenario: {
    year: number;
    rate: number;
    payment: number;
  };
  paymentSchedule: {
    year: number;
    rate: number;
    payment: number;
    scenario: 'current' | 'rising' | 'max';
  }[];
  totalInterestCurrent: number;
  totalInterestWorstCase: number;
  fixedLoanComparison: {
    rate: number;
    payment: number;
    totalInterest: number;
  };
}

export interface PropertyTaxInputs {
  homePrice: number;
  county: string;
  exemptions?: {
    homestead?: boolean;
    senior?: boolean;
    veteran?: boolean;
  };
}

export interface PropertyTaxResults {
  annualTax: number;
  monthlyTax: number;
  effectiveRate: number;
  breakdown: {
    countyRate: number;
    schoolRate: number;
    cityRate: number;
    specialDistricts: number;
  };
  exemptionsApplied: number;
}

export interface RentVsBuyInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent: number;
  propertyTaxRate: number;
  homeInsuranceRate: number;
  hoaFees: number;
  maintenanceRate: number;
  closingCosts: number;
  rentIncrease: number;
  homeAppreciation: number;
  investmentReturn: number;
  marginalTaxRate: number;
  yearsToAnalyze: number;
}

export interface RentVsBuyResults {
  monthlyComparison: {
    buying: {
      total: number;
      afterTax: number;
      breakdown: {
        mortgage: number;
        propertyTax: number;
        insurance: number;
        hoa: number;
        maintenance: number;
      };
    };
    renting: {
      rent: number;
      total: number;
    };
    difference: number;
  };
  breakEvenPoint: number;
  recommendation: {
    choice: 'buy' | 'rent' | 'neutral';
    reasoning: string[];
  };
}

/**
 * Southern California specific property tax rates and insurance estimates
 */
export const CALIFORNIA_DEFAULTS = {
  PROPERTY_TAX_RATE: 0.0121, // 1.21% average for Southern California
  HOME_INSURANCE_RATE: 0.0045, // 0.45% of home value annually
  PMI_RATE: 0.005, // 0.5% annually if down payment < 20%
  DEBT_TO_INCOME_CONVENTIONAL: 0.28, // 28% front-end ratio
  DEBT_TO_INCOME_TOTAL: 0.36, // 36% back-end ratio
  FHA_DEBT_TO_INCOME: 0.31, // 31% front-end for FHA
  FHA_TOTAL_DEBT_TO_INCOME: 0.43, // 43% back-end for FHA
};

/**
 * Calculate monthly mortgage payment (Principal + Interest)
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): number {
  if (interestRate === 0) {
    return loanAmount / (loanTermYears * 12);
  }

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return Math.round(monthlyPayment * 100) / 100;
}

/**
 * Calculate comprehensive mortgage details
 */
export function calculateMortgage(inputs: MortgageInputs): MortgageResults {
  const loanAmount = inputs.homePrice - inputs.downPayment;
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numberOfPayments = inputs.loanTerm * 12;

  // Calculate principal and interest
  const principalAndInterest = calculateMonthlyPayment(
    loanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  // Calculate other monthly costs
  const monthlyPropertyTax = inputs.propertyTax 
    ? inputs.propertyTax / 12 
    : (inputs.homePrice * CALIFORNIA_DEFAULTS.PROPERTY_TAX_RATE) / 12;

  const monthlyInsurance = inputs.homeInsurance 
    ? inputs.homeInsurance / 12 
    : (inputs.homePrice * CALIFORNIA_DEFAULTS.HOME_INSURANCE_RATE) / 12;

  // PMI calculation - required if down payment < 20%
  const downPaymentPercent = inputs.downPayment / inputs.homePrice;
  const monthlyPMI = inputs.pmi || (downPaymentPercent < 0.20 
    ? (loanAmount * CALIFORNIA_DEFAULTS.PMI_RATE) / 12 
    : 0);

  const monthlyHOA = inputs.hoaFees || 0;

  // Total monthly payment
  const totalMonthlyPayment = 
    principalAndInterest + 
    monthlyPropertyTax + 
    monthlyInsurance + 
    monthlyPMI + 
    monthlyHOA;

  // Calculate totals
  const totalInterest = (principalAndInterest * numberOfPayments) - loanAmount;
  const totalCost = inputs.homePrice + totalInterest;

  // Calculate payoff date
  const payoffDate = new Date();
  payoffDate.setFullYear(payoffDate.getFullYear() + inputs.loanTerm);

  // Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  return {
    monthlyPayment: principalAndInterest,
    principalAndInterest,
    monthlyPropertyTax: Math.round(monthlyPropertyTax * 100) / 100,
    monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
    monthlyPMI: Math.round(monthlyPMI * 100) / 100,
    monthlyHOA,
    totalMonthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
    loanAmount,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    payoffDate,
    amortizationSchedule,
  };
}

/**
 * Calculate home affordability based on income and debts
 */
export function calculateAffordability(inputs: AffordabilityInputs): AffordabilityResults {
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numberOfPayments = inputs.loanTerm * 12;
  
  // Use provided ratios or defaults
  const frontEndRatio = inputs.debtToIncomeRatio || CALIFORNIA_DEFAULTS.DEBT_TO_INCOME_CONVENTIONAL;
  const backEndRatio = CALIFORNIA_DEFAULTS.DEBT_TO_INCOME_TOTAL;

  // Calculate maximum monthly housing payment (front-end ratio)
  const maxHousingPayment = inputs.monthlyIncome * frontEndRatio;
  
  // Calculate maximum total monthly payments (back-end ratio)
  const maxTotalPayments = inputs.monthlyIncome * backEndRatio;
  const maxHousingPaymentByBackEnd = maxTotalPayments - inputs.monthlyDebts;

  // Use the more restrictive limit
  const maxMonthlyPayment = Math.min(maxHousingPayment, maxHousingPaymentByBackEnd);

  // Estimate taxes and insurance (using California defaults)
  const propertyTaxRate = inputs.propertyTaxRate || CALIFORNIA_DEFAULTS.PROPERTY_TAX_RATE;
  const insuranceRate = inputs.insuranceRate || CALIFORNIA_DEFAULTS.HOME_INSURANCE_RATE;

  // Calculate maximum home price through iteration
  let maxHomePrice = 0;
  let maxLoanAmount = 0;

  // Estimate the portion available for principal and interest
  // Assume taxes + insurance + PMI = ~1.8% of home value annually (0.15% monthly)
  const estimatedTaxInsuranceRate = (propertyTaxRate + insuranceRate + 0.005) / 12; // Including PMI estimate

  // Iterative calculation to find maximum home price
  for (let homePrice = 100000; homePrice <= 5000000; homePrice += 1000) {
    const loanAmount = homePrice - inputs.downPayment;
    const monthlyTaxInsurance = homePrice * estimatedTaxInsuranceRate;
    const availableForPI = maxMonthlyPayment - monthlyTaxInsurance;

    if (availableForPI <= 0) break;

    const calculatedPI = calculateMonthlyPayment(loanAmount, inputs.interestRate, inputs.loanTerm);
    
    if (calculatedPI <= availableForPI) {
      maxHomePrice = homePrice;
      maxLoanAmount = loanAmount;
    } else {
      break;
    }
  }

  // Calculate actual debt-to-income ratios
  const actualFrontEndRatio = maxMonthlyPayment / inputs.monthlyIncome;
  const actualBackEndRatio = (maxMonthlyPayment + inputs.monthlyDebts) / inputs.monthlyIncome;

  // Generate recommendation
  let recommendation = '';
  if (maxHomePrice === 0) {
    recommendation = 'Consider increasing income, reducing debts, or saving for a larger down payment.';
  } else if (actualBackEndRatio > 0.36) {
    recommendation = 'Consider reducing existing debts before purchasing to improve affordability.';
  } else if (actualFrontEndRatio > 0.28) {
    recommendation = 'You may qualify but consider the higher payment carefully.';
  } else {
    recommendation = 'You appear to be in a strong financial position for this purchase.';
  }

  // Required income calculation
  const requiredIncome = maxMonthlyPayment > 0 ? maxMonthlyPayment / frontEndRatio : 0;

  return {
    maxHomePrice: Math.round(maxHomePrice),
    maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
    maxLoanAmount: Math.round(maxLoanAmount),
    requiredIncome: Math.round(requiredIncome * 100) / 100,
    debtToIncomeRatio: Math.round(actualBackEndRatio * 10000) / 100,
    frontEndRatio: Math.round(actualFrontEndRatio * 10000) / 100,
    backEndRatio: Math.round(actualBackEndRatio * 10000) / 100,
    recommendation,
  };
}

/**
 * Calculate refinancing benefits
 */
export function calculateRefinance(inputs: RefinanceInputs): RefinanceResults {
  // Calculate new monthly payment
  const newMonthlyPayment = calculateMonthlyPayment(
    inputs.currentLoanBalance,
    inputs.newInterestRate,
    inputs.newLoanTerm
  );

  // Calculate savings
  const monthlySavings = inputs.currentMonthlyPayment - newMonthlyPayment;
  
  // Calculate break-even point
  const breakEvenMonths = inputs.closingCosts / (monthlySavings > 0 ? monthlySavings : 1);

  // Calculate total interest for both scenarios
  const totalInterestOld = (inputs.currentMonthlyPayment * inputs.remainingTerm * 12) - inputs.currentLoanBalance;
  const totalInterestNew = (newMonthlyPayment * inputs.newLoanTerm * 12) - inputs.currentLoanBalance;
  const interestSavings = totalInterestOld - totalInterestNew;

  // Total savings over life of new loan
  const totalSavings = interestSavings - inputs.closingCosts;

  // Generate recommendation
  let recommendation = '';
  if (monthlySavings <= 0) {
    recommendation = 'Refinancing may not provide savings at this time.';
  } else if (breakEvenMonths > 60) {
    recommendation = 'Consider if you plan to stay in the home long enough to break even.';
  } else if (breakEvenMonths <= 24) {
    recommendation = 'Excellent opportunity to save with refinancing.';
  } else {
    recommendation = 'Good refinancing opportunity if you plan to stay in the home.';
  }

  return {
    newMonthlyPayment: Math.round(newMonthlyPayment * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
    totalInterestOld: Math.round(totalInterestOld * 100) / 100,
    totalInterestNew: Math.round(totalInterestNew * 100) / 100,
    interestSavings: Math.round(interestSavings * 100) / 100,
    recommendation,
  };
}

/**
 * Generate detailed amortization schedule
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = [];
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTermYears);

  let remainingBalance = loanAmount;
  const startDate = new Date();

  for (let paymentNumber = 1; paymentNumber <= numberOfPayments; paymentNumber++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + paymentNumber);

    schedule.push({
      paymentNumber,
      date: paymentDate,
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
    });

    if (remainingBalance === 0) break;
  }

  return schedule;
}

/**
 * Calculate property tax estimate for Southern California counties
 */
export function calculatePropertyTax(homePrice: number, county: string = 'riverside'): number {
  const countyRates: { [key: string]: number } = {
    'riverside': 0.0121,
    'san-bernardino': 0.0118,
    'orange': 0.0073,
    'los-angeles': 0.0072,
    'ventura': 0.0074,
    'imperial': 0.0069,
    'kern': 0.0084,
    'santa-barbara': 0.0074,
  };

  const rate = countyRates[county.toLowerCase()] || CALIFORNIA_DEFAULTS.PROPERTY_TAX_RATE;
  return Math.round(homePrice * rate * 100) / 100;
}

/**
 * Calculate insurance estimate based on home value and location
 */
export function calculateHomeInsurance(homePrice: number, highRiskArea: boolean = false): number {
  let rate = CALIFORNIA_DEFAULTS.HOME_INSURANCE_RATE;
  
  // Adjust for high-risk areas (wildfire, earthquake zones)
  if (highRiskArea) {
    rate *= 1.5;
  }

  return Math.round(homePrice * rate * 100) / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number, decimals: number = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Calculate ARM loan scenarios and payment schedules
 */
export function calculateARM(inputs: ARMInputs): ARMResults {
  const loanAmount = inputs.homePrice - inputs.downPayment;
  const monthlyRate = inputs.initialRate / 100 / 12;
  const totalPayments = inputs.loanTerm * 12;

  // Calculate initial monthly payment
  const initialMonthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  // Calculate maximum possible rate
  const maxRate = Math.min(
    inputs.initialRate + inputs.lifetimeCap,
    inputs.currentIndex + inputs.margin + inputs.lifetimeCap
  );

  // Calculate payment schedule scenarios
  const paymentSchedule = generateARMPaymentSchedule(inputs, loanAmount);
  
  // Find worst case scenario
  const worstCase = paymentSchedule.reduce((worst, current) => 
    current.payment > worst.payment ? current : worst
  );

  // Calculate max possible payment
  const maxMonthlyRate = maxRate / 100 / 12;
  const maxPossiblePayment = loanAmount * 
    (maxMonthlyRate * Math.pow(1 + maxMonthlyRate, totalPayments)) /
    (Math.pow(1 + maxMonthlyRate, totalPayments) - 1);

  // Calculate total interest scenarios (simplified)
  const totalInterestCurrent = (initialMonthlyPayment * totalPayments) - loanAmount;
  const totalInterestWorstCase = (maxPossiblePayment * totalPayments) - loanAmount;

  // Fixed loan comparison (typically 0.25-0.75% higher than ARM initial rate)
  const fixedRate = inputs.initialRate + 0.75;
  const fixedMonthlyRate = fixedRate / 100 / 12;
  const fixedPayment = loanAmount * 
    (fixedMonthlyRate * Math.pow(1 + fixedMonthlyRate, totalPayments)) /
    (Math.pow(1 + fixedMonthlyRate, totalPayments) - 1);
  const fixedTotalInterest = (fixedPayment * totalPayments) - loanAmount;

  return {
    initialMonthlyPayment,
    maxPossiblePayment,
    worstCaseScenario: {
      year: worstCase.year,
      rate: worstCase.rate,
      payment: worstCase.payment,
    },
    paymentSchedule,
    totalInterestCurrent,
    totalInterestWorstCase,
    fixedLoanComparison: {
      rate: fixedRate,
      payment: fixedPayment,
      totalInterest: fixedTotalInterest,
    },
  };
}

/**
 * Generate ARM payment schedule with rate adjustments
 */
function generateARMPaymentSchedule(inputs: ARMInputs, loanAmount: number) {
  const schedule = [];
  let currentRate = inputs.initialRate;
  
  for (let year = 1; year <= inputs.loanTerm; year++) {
    // Determine if this is an adjustment year
    const isAdjustmentYear = year > inputs.initialPeriod && 
      (year - inputs.initialPeriod - 1) % inputs.adjustmentPeriod === 0;

    if (isAdjustmentYear && year > inputs.initialPeriod) {
      // Apply caps to rate adjustments
      if (year === inputs.initialPeriod + 1) {
        // First adjustment - use initial cap
        currentRate = Math.min(
          currentRate + inputs.initialCap,
          inputs.initialRate + inputs.lifetimeCap
        );
      } else {
        // Subsequent adjustments - use periodic cap
        currentRate = Math.min(
          currentRate + inputs.periodicCap,
          inputs.initialRate + inputs.lifetimeCap
        );
      }
    }

    // Calculate payment for current year
    const remainingYears = inputs.loanTerm - year + 1;
    const monthlyRate = currentRate / 100 / 12;
    const remainingPayments = remainingYears * 12;
    
    const payment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, remainingPayments)) /
      (Math.pow(1 + monthlyRate, remainingPayments) - 1);

    schedule.push({
      year,
      rate: currentRate,
      payment,
      scenario: year <= inputs.initialPeriod ? 'current' as const : 
               currentRate === inputs.initialRate + inputs.lifetimeCap ? 'max' as const : 'rising' as const,
    });
  }

  return schedule;
}

/**
 * Calculate detailed property tax with county-specific rates and exemptions
 */
export function calculateDetailedPropertyTax(inputs: PropertyTaxInputs): PropertyTaxResults {
  const { homePrice, county, exemptions = {} } = inputs;
  
  // Southern California county tax rate data
  const countyData: { [key: string]: { 
    county: number; 
    school: number; 
    city: number; 
    special: number; 
  } } = {
    'riverside': { county: 0.0073, school: 0.0032, city: 0.0008, special: 0.0008 },
    'san-bernardino': { county: 0.0071, school: 0.0031, city: 0.0008, special: 0.0008 },
    'orange': { county: 0.0041, school: 0.0025, city: 0.0004, special: 0.0003 },
    'los-angeles': { county: 0.0040, school: 0.0025, city: 0.0004, special: 0.0003 },
    'ventura': { county: 0.0042, school: 0.0025, city: 0.0004, special: 0.0003 },
    'imperial': { county: 0.0039, school: 0.0023, city: 0.0004, special: 0.0003 },
    'kern': { county: 0.0048, school: 0.0028, city: 0.0005, special: 0.0003 },
    'santa-barbara': { county: 0.0042, school: 0.0025, city: 0.0004, special: 0.0003 },
  };

  const rates = countyData[county.toLowerCase()] || countyData['riverside'];
  
  // Calculate base tax
  const baseTax = homePrice * (rates.county + rates.school + rates.city + rates.special);
  
  // Apply exemptions
  let exemptionAmount = 0;
  if (exemptions.homestead) {
    exemptionAmount += Math.min(homePrice * 0.02, 7000); // 2% or $7,000 max
  }
  if (exemptions.senior && homePrice < 400000) {
    exemptionAmount += Math.min(homePrice * 0.04, 5000); // Additional senior exemption
  }
  if (exemptions.veteran) {
    exemptionAmount += Math.min(homePrice * 0.01, 4000); // Veteran exemption
  }

  const finalTax = Math.max(0, baseTax - exemptionAmount);
  const effectiveRate = (finalTax / homePrice) * 100;

  return {
    annualTax: Math.round(finalTax * 100) / 100,
    monthlyTax: Math.round((finalTax / 12) * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    breakdown: {
      countyRate: rates.county * 100,
      schoolRate: rates.school * 100,
      cityRate: rates.city * 100,
      specialDistricts: rates.special * 100,
    },
    exemptionsApplied: Math.round(exemptionAmount * 100) / 100,
  };
}

/**
 * Calculate comprehensive rent vs buy analysis
 */
export function calculateRentVsBuyAnalysis(inputs: RentVsBuyInputs): RentVsBuyResults {
  const loanAmount = inputs.homePrice - inputs.downPayment;
  const monthlyRate = inputs.interestRate / 100 / 12;
  const totalPayments = inputs.loanTerm * 12;

  // Monthly mortgage payment (P&I only)
  const monthlyMortgage = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  // Monthly housing costs
  const monthlyPropertyTax = (inputs.homePrice * inputs.propertyTaxRate / 100) / 12;
  const monthlyInsurance = (inputs.homePrice * inputs.homeInsuranceRate / 100) / 12;
  const monthlyMaintenance = (inputs.homePrice * inputs.maintenanceRate / 100) / 12;

  const totalMonthlyCost = monthlyMortgage + monthlyPropertyTax + monthlyInsurance + 
                          inputs.hoaFees + monthlyMaintenance;

  // Tax benefits (mortgage interest + property tax deduction)
  const averageInterestPayment = (loanAmount * inputs.interestRate / 100) / 12 * 0.8; // Rough average
  const monthlyTaxSavings = (averageInterestPayment + monthlyPropertyTax) * (inputs.marginalTaxRate / 100);
  const afterTaxMonthlyCost = totalMonthlyCost - monthlyTaxSavings;

  // Monthly comparison
  const monthlyComparison = {
    buying: {
      total: totalMonthlyCost,
      afterTax: afterTaxMonthlyCost,
      breakdown: {
        mortgage: monthlyMortgage,
        propertyTax: monthlyPropertyTax,
        insurance: monthlyInsurance,
        hoa: inputs.hoaFees,
        maintenance: monthlyMaintenance,
      },
    },
    renting: {
      rent: inputs.monthlyRent,
      total: inputs.monthlyRent,
    },
    difference: afterTaxMonthlyCost - inputs.monthlyRent,
  };

  // Find break-even point through simple analysis
  let breakEvenPoint = inputs.yearsToAnalyze + 1;
  
  // Simplified break-even calculation
  const initialCostDifference = inputs.downPayment + inputs.closingCosts;
  const monthlySavings = Math.max(0, inputs.monthlyRent - afterTaxMonthlyCost);
  
  if (monthlySavings > 0) {
    breakEvenPoint = Math.ceil(initialCostDifference / (monthlySavings * 12));
  }

  // Generate recommendation based on financial analysis
  let choice: 'buy' | 'rent' | 'neutral' = 'neutral';
  const reasoning: string[] = [];
  
  if (breakEvenPoint <= 5 && monthlyComparison.difference < 0) {
    choice = 'buy';
    reasoning.push(`Buying becomes financially advantageous after ${breakEvenPoint} years`);
    reasoning.push('Monthly costs favor buying with tax benefits');
  } else if (breakEvenPoint > inputs.yearsToAnalyze || monthlyComparison.difference > 500) {
    choice = 'rent';
    reasoning.push('Renting provides better short-term financial flexibility');
    reasoning.push('High upfront costs make buying less attractive');
  } else {
    choice = 'neutral';
    reasoning.push('Financial benefits are relatively balanced');
    reasoning.push('Decision should prioritize lifestyle and long-term plans');
  }

  return {
    monthlyComparison,
    breakEvenPoint,
    recommendation: {
      choice,
      reasoning,
    },
  };
}