import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  KeyIcon,
  ScaleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface RentVsBuyInputs {
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

interface RentVsBuyResults {
  monthlyComparison: {
    buying: {
      mortgage: number;
      propertyTax: number;
      insurance: number;
      hoa: number;
      maintenance: number;
      total: number;
      afterTax: number;
    };
    renting: {
      rent: number;
      total: number;
    };
    difference: number;
  };
  longTermAnalysis: {
    year: number;
    buyingCosts: {
      totalMortgagePayments: number;
      totalPropertyTax: number;
      totalInsurance: number;
      totalHOA: number;
      totalMaintenance: number;
      closingCosts: number;
      total: number;
      homeValue: number;
      equity: number;
      netCost: number;
    };
    rentingCosts: {
      totalRent: number;
      opportunityCost: number;
      investmentValue: number;
      netCost: number;
    };
  }[];
  breakEvenPoint: number; // Years until buying becomes cheaper
  recommendation: {
    choice: 'buy' | 'rent' | 'neutral';
    reasoning: string[];
    considerations: string[];
  };
}

interface RentVsBuyComparisonProps {
  initialInputs?: Partial<RentVsBuyInputs>;
  className?: string;
}

const RentVsBuyComparison: React.FC<RentVsBuyComparisonProps> = ({
  initialInputs = {},
  className = '',
}) => {
  const [inputs, setInputs] = useState<RentVsBuyInputs>({
    homePrice: 650000,
    downPayment: 130000,
    interestRate: 7.25,
    loanTerm: 30,
    monthlyRent: 3200,
    propertyTaxRate: 1.21,
    homeInsuranceRate: 0.45,
    hoaFees: 150,
    maintenanceRate: 1.0,
    closingCosts: 15000,
    rentIncrease: 3.0,
    homeAppreciation: 3.5,
    investmentReturn: 7.0,
    marginalTaxRate: 24.0,
    yearsToAnalyze: 10,
    ...initialInputs,
  });

  const [selectedYear, setSelectedYear] = useState(5);

  const results = useMemo((): RentVsBuyResults => {
    return calculateRentVsBuy(inputs);
  }, [inputs]);

  const calculateRentVsBuy = (inputs: RentVsBuyInputs): RentVsBuyResults => {
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
        mortgage: monthlyMortgage,
        propertyTax: monthlyPropertyTax,
        insurance: monthlyInsurance,
        hoa: inputs.hoaFees,
        maintenance: monthlyMaintenance,
        total: totalMonthlyCost,
        afterTax: afterTaxMonthlyCost,
      },
      renting: {
        rent: inputs.monthlyRent,
        total: inputs.monthlyRent,
      },
      difference: afterTaxMonthlyCost - inputs.monthlyRent,
    };

    // Long-term analysis
    const longTermAnalysis = [];
    let breakEvenPoint = inputs.yearsToAnalyze + 1;

    for (let year = 1; year <= inputs.yearsToAnalyze; year++) {
      // Buying costs
      let totalMortgagePayments = monthlyMortgage * 12 * year;
      let totalPropertyTax = monthlyPropertyTax * 12 * year;
      let totalInsurance = monthlyInsurance * 12 * year;
      let totalHOA = inputs.hoaFees * 12 * year;
      let totalMaintenance = monthlyMaintenance * 12 * year;

      // Calculate remaining balance and equity
      const remainingBalance = calculateRemainingBalance(loanAmount, monthlyRate, totalPayments, year * 12);
      const principalPaid = loanAmount - remainingBalance;
      const homeValue = inputs.homePrice * Math.pow(1 + inputs.homeAppreciation / 100, year);
      const equity = homeValue - remainingBalance;

      const totalBuyingCosts = totalMortgagePayments + totalPropertyTax + totalInsurance + 
                              totalHOA + totalMaintenance + inputs.closingCosts;
      const netBuyingCost = totalBuyingCosts - equity;

      // Renting costs
      let totalRent = 0;
      let currentRent = inputs.monthlyRent;
      for (let y = 1; y <= year; y++) {
        totalRent += currentRent * 12;
        currentRent *= (1 + inputs.rentIncrease / 100);
      }

      // Opportunity cost of down payment + monthly difference invested
      const downPaymentInvested = inputs.downPayment * Math.pow(1 + inputs.investmentReturn / 100, year);
      let monthlyDifferenceInvested = 0;
      if (inputs.monthlyRent < afterTaxMonthlyCost) {
        const monthlyDifference = afterTaxMonthlyCost - inputs.monthlyRent;
        // Future value of annuity
        monthlyDifferenceInvested = monthlyDifference * 12 * 
          ((Math.pow(1 + inputs.investmentReturn / 100, year) - 1) / (inputs.investmentReturn / 100));
      }

      const investmentValue = downPaymentInvested + monthlyDifferenceInvested;
      const opportunityCost = investmentValue - inputs.downPayment;
      const netRentingCost = totalRent + opportunityCost;

      longTermAnalysis.push({
        year,
        buyingCosts: {
          totalMortgagePayments,
          totalPropertyTax,
          totalInsurance,
          totalHOA,
          totalMaintenance,
          closingCosts: inputs.closingCosts,
          total: totalBuyingCosts,
          homeValue,
          equity,
          netCost: netBuyingCost,
        },
        rentingCosts: {
          totalRent,
          opportunityCost,
          investmentValue,
          netCost: netRentingCost,
        },
      });

      // Check for break-even point
      if (netBuyingCost < netRentingCost && breakEvenPoint > inputs.yearsToAnalyze) {
        breakEvenPoint = year;
      }
    }

    // Generate recommendation
    const recommendation = generateRecommendation(inputs, longTermAnalysis, breakEvenPoint);

    return {
      monthlyComparison,
      longTermAnalysis,
      breakEvenPoint,
      recommendation,
    };
  };

  const calculateRemainingBalance = (principal: number, monthlyRate: number, totalPayments: number, paymentsMade: number): number => {
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                          (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    let balance = principal;
    for (let i = 0; i < paymentsMade; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
    }
    return Math.max(0, balance);
  };

  const generateRecommendation = (inputs: RentVsBuyInputs, analysis: any[], breakEven: number) => {
    const lastYear = analysis[analysis.length - 1];
    const netDifference = lastYear.buyingCosts.netCost - lastYear.rentingCosts.netCost;
    
    let choice: 'buy' | 'rent' | 'neutral' = 'neutral';
    const reasoning: string[] = [];
    const considerations: string[] = [];

    if (breakEven <= 5 && netDifference < -50000) {
      choice = 'buy';
      reasoning.push(`Buying becomes cheaper after ${breakEven} years`);
      reasoning.push(`${inputs.yearsToAnalyze}-year savings of ${Math.abs(netDifference).toLocaleString()}`);
    } else if (breakEven > inputs.yearsToAnalyze || netDifference > 50000) {
      choice = 'rent';
      reasoning.push(`Renting remains cheaper over ${inputs.yearsToAnalyze} years`);
      if (breakEven > inputs.yearsToAnalyze) {
        reasoning.push('Break-even point beyond analysis period');
      }
    } else {
      choice = 'neutral';
      reasoning.push('Financial impact is relatively neutral');
      reasoning.push('Decision should be based on lifestyle factors');
    }

    // Add considerations
    if (inputs.monthlyRent < inputs.homePrice * 0.005) {
      considerations.push('Rent-to-price ratio is favorable for buying');
    }
    
    if (inputs.homeAppreciation > inputs.rentIncrease + 1) {
      considerations.push('Home appreciation significantly exceeds rent increases');
    }

    considerations.push('Consider job stability and mobility needs');
    considerations.push('Factor in maintenance responsibilities and time commitment');
    considerations.push('Evaluate local market conditions and trends');

    return {
      choice,
      reasoning,
      considerations,
    };
  };

  const handleInputChange = (field: keyof RentVsBuyInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRecommendationColor = (choice: string) => {
    if (choice === 'buy') return 'text-green-600 bg-green-50 border-green-200';
    if (choice === 'rent') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getRecommendationIcon = (choice: string) => {
    if (choice === 'buy') return <HomeIcon className="w-6 h-6" />;
    if (choice === 'rent') return <KeyIcon className="w-6 h-6" />;
    return <ScaleIcon className="w-6 h-6" />;
  };

  const selectedYearData = results.longTermAnalysis.find(d => d.year === selectedYear);

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <ScaleIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Rent vs Buy Comparison
          </h2>
        </div>
        <p className="text-secondary-600">
          Complete financial analysis comparing renting vs buying for your situation
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Controls */}
          <div className="space-y-6">
            {/* Property Details */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Property Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Home Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.homePrice}
                      onChange={(e) => handleInputChange('homePrice', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Down Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.downPayment}
                      onChange={(e) => handleInputChange('downPayment', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Monthly Rent
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.monthlyRent}
                      onChange={(e) => handleInputChange('monthlyRent', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.interestRate}
                      onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Loan Term
                    </label>
                    <select
                      value={inputs.loanTerm}
                      onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={15}>15 years</option>
                      <option value={20}>20 years</option>
                      <option value={25}>25 years</option>
                      <option value={30}>30 years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Annual Rates */}
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Annual Rates & Costs
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Property Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.propertyTaxRate}
                    onChange={(e) => handleInputChange('propertyTaxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Home Insurance Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.homeInsuranceRate}
                    onChange={(e) => handleInputChange('homeInsuranceRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Monthly HOA Fees
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.hoaFees}
                      onChange={(e) => handleInputChange('hoaFees', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Maintenance Rate (% of home value)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.maintenanceRate}
                    onChange={(e) => handleInputChange('maintenanceRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Closing Costs
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.closingCosts}
                      onChange={(e) => handleInputChange('closingCosts', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            <div className="bg-accent-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Economic Assumptions
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Annual Rent Increase (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.rentIncrease}
                    onChange={(e) => handleInputChange('rentIncrease', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Home Appreciation (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.homeAppreciation}
                    onChange={(e) => handleInputChange('homeAppreciation', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Investment Return (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.investmentReturn}
                    onChange={(e) => handleInputChange('investmentReturn', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Marginal Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.marginalTaxRate}
                    onChange={(e) => handleInputChange('marginalTaxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Years to Analyze
                  </label>
                  <select
                    value={inputs.yearsToAnalyze}
                    onChange={(e) => handleInputChange('yearsToAnalyze', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={5}>5 years</option>
                    <option value={10}>10 years</option>
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Recommendation */}
              <div className={`rounded-lg p-6 border ${getRecommendationColor(results.recommendation.choice)}`}>
                <div className="flex items-center gap-3 mb-4">
                  {getRecommendationIcon(results.recommendation.choice)}
                  <h3 className="text-xl font-bold">
                    Recommendation: {results.recommendation.choice === 'buy' ? 'Buy' : 
                                   results.recommendation.choice === 'rent' ? 'Rent' : 'Consider Both Options'}
                  </h3>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  {results.recommendation.reasoning.map((reason, index) => (
                    <p key={index}>• {reason}</p>
                  ))}
                </div>

                {results.breakEvenPoint <= inputs.yearsToAnalyze && (
                  <div className="bg-white/50 rounded p-3 text-sm">
                    <strong>Break-even point:</strong> {results.breakEvenPoint} years
                  </div>
                )}
              </div>

              {/* Monthly Comparison */}
              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
                  Monthly Cost Breakdown
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Buying</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Mortgage Payment:</span>
                        <span>{formatCurrency(results.monthlyComparison.buying.mortgage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property Tax:</span>
                        <span>{formatCurrency(results.monthlyComparison.buying.propertyTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance:</span>
                        <span>{formatCurrency(results.monthlyComparison.buying.insurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HOA:</span>
                        <span>{formatCurrency(results.monthlyComparison.buying.hoa)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance:</span>
                        <span>{formatCurrency(results.monthlyComparison.buying.maintenance)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total (Before Tax):</span>
                        <span>{formatCurrency(results.monthlyComparison.buying.total)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-800">
                        <span>After Tax Benefits:</span>
                        <span>{formatCurrency(results.monthlyComparison.buying.afterTax)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Renting</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly Rent:</span>
                        <span>{formatCurrency(results.monthlyComparison.renting.rent)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-green-800 pt-4 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(results.monthlyComparison.renting.total)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className={`text-center font-bold ${
                        results.monthlyComparison.difference > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {results.monthlyComparison.difference > 0 
                          ? `${formatCurrency(Math.abs(results.monthlyComparison.difference))} more to buy`
                          : `${formatCurrency(Math.abs(results.monthlyComparison.difference))} less to buy`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year Selector */}
              <div className="bg-secondary-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-secondary-900">Select Year for Analysis</h4>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {results.longTermAnalysis.map(data => (
                      <option key={data.year} value={data.year}>Year {data.year}</option>
                    ))}
                  </select>
                </div>

                {selectedYearData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded p-3">
                      <div className="font-semibold text-blue-800 mb-2">Buying (Year {selectedYear})</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Total Costs:</span>
                          <span>{formatCurrency(selectedYearData.buyingCosts.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Home Value:</span>
                          <span>{formatCurrency(selectedYearData.buyingCosts.homeValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equity Built:</span>
                          <span>{formatCurrency(selectedYearData.buyingCosts.equity)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Net Cost:</span>
                          <span>{formatCurrency(selectedYearData.buyingCosts.netCost)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded p-3">
                      <div className="font-semibold text-green-800 mb-2">Renting (Year {selectedYear})</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Total Rent Paid:</span>
                          <span>{formatCurrency(selectedYearData.rentingCosts.totalRent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Investment Value:</span>
                          <span>{formatCurrency(selectedYearData.rentingCosts.investmentValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Opportunity Cost:</span>
                          <span>{formatCurrency(selectedYearData.rentingCosts.opportunityCost)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Net Cost:</span>
                          <span>{formatCurrency(selectedYearData.rentingCosts.netCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Considerations */}
              {results.recommendation.considerations.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600" />
                    Additional Considerations
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {results.recommendation.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span className="text-secondary-700">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentVsBuyComparison;