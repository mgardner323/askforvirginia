import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  HomeIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface AffordabilityInputs {
  monthlyIncome: number;
  monthlyDebts: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertyTaxRate?: number;
  insuranceRate?: number;
  debtToIncomeRatio?: number;
}

interface AffordabilityResults {
  maxHomePrice: number;
  maxMonthlyPayment: number;
  maxLoanAmount: number;
  requiredIncome: number;
  debtToIncomeRatio: number;
  frontEndRatio: number;
  backEndRatio: number;
  recommendation: string;
}

interface AffordabilityCalculatorProps {
  initialValues?: Partial<AffordabilityInputs>;
  onCalculationComplete?: (results: AffordabilityResults) => void;
  className?: string;
}

const AffordabilityCalculator: React.FC<AffordabilityCalculatorProps> = ({
  initialValues = {},
  onCalculationComplete,
  className = '',
}) => {
  const [inputs, setInputs] = useState<AffordabilityInputs>({
    monthlyIncome: 8000,
    monthlyDebts: 800,
    downPayment: 100000,
    interestRate: 7.25,
    loanTerm: 30,
    propertyTaxRate: 0,
    insuranceRate: 0,
    debtToIncomeRatio: 0,
    ...initialValues,
  });

  const [results, setResults] = useState<AffordabilityResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate affordability when inputs change
  useEffect(() => {
    if (inputs.monthlyIncome > 0 && inputs.interestRate > 0) {
      calculateAffordability();
    }
  }, [inputs]);

  const calculateAffordability = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mortgage/affordability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Calculation failed');
      }

      const data = await response.json();
      setResults(data.data.results);
      
      if (onCalculationComplete) {
        onCalculationComplete(data.data.results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      console.error('Affordability calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AffordabilityInputs, value: number) => {
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
    return `${rate.toFixed(1)}%`;
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('strong financial position')) {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else if (recommendation.includes('consider')) {
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
    } else {
      return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('strong financial position')) {
      return 'bg-green-50 border-green-200 text-green-800';
    } else if (recommendation.includes('consider')) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    } else {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <HomeIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Affordability Calculator
          </h2>
        </div>
        <p className="text-secondary-600">
          Determine how much home you can afford based on your income and financial situation
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
            {/* Monthly Income */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                Monthly Gross Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                <input
                  type="number"
                  value={inputs.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="8,000"
                />
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Include salary, bonuses, and other regular income before taxes
              </p>
            </div>

            {/* Monthly Debts */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                <ChartBarIcon className="w-4 h-4 inline mr-2" />
                Monthly Debt Payments
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                <input
                  type="number"
                  value={inputs.monthlyDebts}
                  onChange={(e) => handleInputChange('monthlyDebts', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="800"
                />
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Include credit cards, auto loans, student loans, and other minimum payments
              </p>
            </div>

            {/* Down Payment */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                <HomeIcon className="w-4 h-4 inline mr-2" />
                Available Down Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                <input
                  type="number"
                  value={inputs.downPayment}
                  onChange={(e) => handleInputChange('downPayment', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="100,000"
                />
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Cash available for down payment and closing costs
              </p>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                Expected Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="20"
                  value={inputs.interestRate}
                  onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                  className="w-full pl-4 pr-8 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="7.25"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500">%</span>
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Current market rate for your credit profile
              </p>
            </div>

            {/* Loan Term */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                Loan Term
              </label>
              <select
                value={inputs.loanTerm}
                onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={10}>10 years</option>
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={25}>25 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>

            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2"
            >
              <ChartBarIcon className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>

            {/* Advanced Options */}
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t pt-4"
              >
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Property Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    value={inputs.propertyTaxRate || 0}
                    onChange={(e) => handleInputChange('propertyTaxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="1.21 (CA average)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Insurance Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="2"
                    value={inputs.insuranceRate || 0}
                    onChange={(e) => handleInputChange('insuranceRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.45 (CA average)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Max Debt-to-Income Ratio (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    max="50"
                    value={inputs.debtToIncomeRatio || 0}
                    onChange={(e) => handleInputChange('debtToIncomeRatio', parseFloat(e.target.value) / 100 || 0)}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="28 (conventional)"
                  />
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
                {/* Maximum Home Price */}
                <div className="bg-primary-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Maximum Home Price
                  </h3>
                  
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {formatCurrency(results.maxHomePrice)}
                    </div>
                    <p className="text-secondary-600">
                      Based on your financial profile
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-secondary-900">
                        {formatCurrency(results.maxMonthlyPayment)}
                      </div>
                      <div className="text-secondary-600">Max Monthly Payment</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-secondary-900">
                        {formatCurrency(results.maxLoanAmount)}
                      </div>
                      <div className="text-secondary-600">Max Loan Amount</div>
                    </div>
                  </div>
                </div>

                {/* Debt-to-Income Ratios */}
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Debt-to-Income Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-700">Front-End Ratio</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatPercentage(results.frontEndRatio)}
                        </span>
                        {results.frontEndRatio <= 28 ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-700">Back-End Ratio</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatPercentage(results.backEndRatio)}
                        </span>
                        {results.backEndRatio <= 36 ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded border text-xs">
                    <p className="text-secondary-600">
                      <strong>Front-End:</strong> Housing costs ÷ income (ideal ≤ 28%)<br />
                      <strong>Back-End:</strong> All debts ÷ income (ideal ≤ 36%)
                    </p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`rounded-lg p-6 border ${getRecommendationColor(results.recommendation)}`}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    {getRecommendationIcon(results.recommendation)}
                    Recommendation
                  </h3>
                  <p>{results.recommendation}</p>
                </div>

                {/* Financial Breakdown */}
                <div className="bg-accent-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Financial Breakdown
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Monthly Income</span>
                      <span className="font-medium">{formatCurrency(inputs.monthlyIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Current Debts</span>
                      <span className="font-medium">{formatCurrency(inputs.monthlyDebts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Available for Housing</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(results.maxMonthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-secondary-700">Down Payment Available</span>
                      <span className="font-medium">{formatCurrency(inputs.downPayment)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                <p>Enter your financial details to see affordability analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffordabilityCalculator;