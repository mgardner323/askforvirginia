import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalculatorIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@heroicons/react/24/outline';

interface ARMInputs {
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

interface ARMResults {
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

interface ARMCalculatorProps {
  initialValues?: Partial<ARMInputs>;
  onCalculationComplete?: (results: ARMResults) => void;
  className?: string;
}

const ARMCalculator: React.FC<ARMCalculatorProps> = ({
  initialValues = {},
  onCalculationComplete,
  className = '',
}) => {
  const [inputs, setInputs] = useState<ARMInputs>({
    homePrice: 650000,
    downPayment: 130000,
    loanTerm: 30,
    initialRate: 6.5, // Typically lower than fixed
    initialPeriod: 5, // 5/1 ARM
    adjustmentPeriod: 1,
    initialCap: 2.0, // 2% max increase on first adjustment
    periodicCap: 2.0, // 2% max increase per adjustment
    lifetimeCap: 5.0, // 5% max over initial rate
    margin: 2.5, // Typical margin
    currentIndex: 4.0, // Current SOFR or similar
    ...initialValues,
  });

  const [results, setResults] = useState<ARMResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (inputs.homePrice > 0 && inputs.downPayment >= 0 && inputs.initialRate > 0) {
      calculateARM();
    }
  }, [inputs]);

  const calculateARM = () => {
    try {
      setLoading(true);
      setError(null);

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
      const paymentSchedule = generatePaymentSchedule(inputs, loanAmount);
      
      // Find worst case scenario
      const worstCase = paymentSchedule.reduce((worst, current) => 
        current.payment > worst.payment ? current : worst
      );

      // Calculate max possible payment
      const maxMonthlyRate = maxRate / 100 / 12;
      const maxPossiblePayment = loanAmount * 
        (maxMonthlyRate * Math.pow(1 + maxMonthlyRate, totalPayments)) /
        (Math.pow(1 + maxMonthlyRate, totalPayments) - 1);

      // Calculate total interest scenarios
      const totalInterestCurrent = calculateTotalInterest(paymentSchedule, 'current');
      const totalInterestWorstCase = calculateTotalInterest(paymentSchedule, 'max');

      // Fixed loan comparison (typically 0.25-0.5% higher than ARM initial rate)
      const fixedRate = inputs.initialRate + 0.75;
      const fixedMonthlyRate = fixedRate / 100 / 12;
      const fixedPayment = loanAmount * 
        (fixedMonthlyRate * Math.pow(1 + fixedMonthlyRate, totalPayments)) /
        (Math.pow(1 + fixedMonthlyRate, totalPayments) - 1);
      const fixedTotalInterest = (fixedPayment * totalPayments) - loanAmount;

      const calculatedResults: ARMResults = {
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

      setResults(calculatedResults);
      
      if (onCalculationComplete) {
        onCalculationComplete(calculatedResults);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      console.error('ARM calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentSchedule = (inputs: ARMInputs, loanAmount: number) => {
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

      // Calculate payment for different scenarios
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
  };

  const calculateTotalInterest = (schedule: any[], scenario: string): number => {
    // Simplified calculation - would need more complex amortization in real implementation
    const avgPayment = schedule.reduce((sum, entry) => sum + entry.payment, 0) / schedule.length;
    return (avgPayment * inputs.loanTerm * 12) - (inputs.homePrice - inputs.downPayment);
  };

  const handleInputChange = (field: keyof ARMInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(2)}%`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <ChartBarIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            ARM Calculator
          </h2>
        </div>
        <p className="text-secondary-600">
          Calculate Adjustable Rate Mortgage payments and compare scenarios
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <InformationCircleIcon className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            {/* Basic Loan Info */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Loan Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Home Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.homePrice}
                      onChange={(e) => handleInputChange('homePrice', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Down Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.downPayment}
                      onChange={(e) => handleInputChange('downPayment', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Loan Term (Years)
                  </label>
                  <select
                    value={inputs.loanTerm}
                    onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                    <option value={25}>25 years</option>
                    <option value={30}>30 years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ARM Details */}
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                ARM Terms
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Initial Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.initialRate}
                      onChange={(e) => handleInputChange('initialRate', parseFloat(e.target.value) || 0)}
                      className="w-full pl-4 pr-8 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500">%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-900 mb-2">
                      Initial Period
                    </label>
                    <select
                      value={inputs.initialPeriod}
                      onChange={(e) => handleInputChange('initialPeriod', parseInt(e.target.value))}
                      className="w-full px-3 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={1}>1 year</option>
                      <option value={3}>3 years</option>
                      <option value={5}>5 years</option>
                      <option value={7}>7 years</option>
                      <option value={10}>10 years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-900 mb-2">
                      Adjustment Period
                    </label>
                    <select
                      value={inputs.adjustmentPeriod}
                      onChange={(e) => handleInputChange('adjustmentPeriod', parseInt(e.target.value))}
                      className="w-full px-3 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={1}>1 year</option>
                      <option value={2}>2 years</option>
                      <option value={3}>3 years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2"
            >
              <CalculatorIcon className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced ARM Terms
            </button>

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-accent-50 rounded-lg p-6 space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Initial Cap (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.initialCap}
                      onChange={(e) => handleInputChange('initialCap', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Periodic Cap (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.periodicCap}
                      onChange={(e) => handleInputChange('periodicCap', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Lifetime Cap (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.lifetimeCap}
                      onChange={(e) => handleInputChange('lifetimeCap', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Margin (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.margin}
                      onChange={(e) => handleInputChange('margin', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Current Index (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.currentIndex}
                      onChange={(e) => handleInputChange('currentIndex', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : results ? (
              <>
                {/* Payment Range */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-bold text-secondary-900">
                      Payment Range
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingDownIcon className="w-4 h-4 text-green-600" />
                        <div className="text-sm text-secondary-600">Initial Payment</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(results.initialMonthlyPayment)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUpIcon className="w-4 h-4 text-red-600" />
                        <div className="text-sm text-secondary-600">Maximum Payment</div>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(results.maxPossiblePayment)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                    <strong>Payment Increase Risk:</strong> Your payment could increase by{' '}
                    <span className="font-semibold text-red-600">
                      {formatCurrency(results.maxPossiblePayment - results.initialMonthlyPayment)}
                    </span>{' '}
                    over the life of the loan.
                  </div>
                </div>

                {/* ARM vs Fixed Comparison */}
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    ARM vs Fixed Rate Comparison
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-900">ARM Initial Payment</span>
                        <span className="font-bold text-blue-900">
                          {formatCurrency(results.initialMonthlyPayment)}
                        </span>
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        Rate: {formatPercentage(inputs.initialRate)} (adjustable)
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-900">30-Year Fixed Payment</span>
                        <span className="font-bold text-green-900">
                          {formatCurrency(results.fixedLoanComparison.payment)}
                        </span>
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        Rate: {formatPercentage(results.fixedLoanComparison.rate)} (fixed)
                      </div>
                    </div>

                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-sm text-secondary-600">Initial Monthly Savings with ARM</div>
                      <div className="text-lg font-bold text-primary-600">
                        {formatCurrency(results.fixedLoanComparison.payment - results.initialMonthlyPayment)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Analysis */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Risk Analysis
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-red-800">Rate Increase Risk</div>
                        <div className="text-red-700">
                          Rates can increase up to {formatPercentage(inputs.initialRate + inputs.lifetimeCap)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-red-800">Payment Shock</div>
                        <div className="text-red-700">
                          First adjustment in year {inputs.initialPeriod + 1} could increase payment by{' '}
                          {formatCurrency(results.initialMonthlyPayment * (inputs.initialCap / 100))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-red-800">Budget Impact</div>
                        <div className="text-red-700">
                          Ensure you can afford the maximum possible payment
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ARM Recommendation */}
                <div className="bg-primary-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    ARM Considerations
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-white rounded">
                      <div className="font-semibold text-secondary-800 mb-1">Good for ARM:</div>
                      <div className="text-secondary-600">
                        • Planning to sell/refinance within {inputs.initialPeriod} years<br />
                        • Rates expected to decrease<br />
                        • Need lower initial payment<br />
                        • Income expected to increase significantly
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white rounded">
                      <div className="font-semibold text-secondary-800 mb-1">Consider Fixed Instead:</div>
                      <div className="text-secondary-600">
                        • Planning to stay long-term<br />
                        • Prefer payment certainty<br />
                        • Rates expected to rise<br />
                        • Tight monthly budget
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                <p>Enter ARM details to see payment analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARMCalculator;