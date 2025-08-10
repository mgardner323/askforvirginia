import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  PercentIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface RefinanceInputs {
  currentLoanBalance: number;
  currentInterestRate: number;
  currentMonthlyPayment: number;
  remainingTerm: number;
  newInterestRate: number;
  newLoanTerm: number;
  closingCosts: number;
}

interface RefinanceResults {
  newMonthlyPayment: number;
  monthlySavings: number;
  totalSavings: number;
  breakEvenMonths: number;
  totalInterestOld: number;
  totalInterestNew: number;
  interestSavings: number;
  recommendation: string;
}

interface RefinanceCalculatorProps {
  initialValues?: Partial<RefinanceInputs>;
  onCalculationComplete?: (results: RefinanceResults) => void;
  className?: string;
}

const RefinanceCalculator: React.FC<RefinanceCalculatorProps> = ({
  initialValues = {},
  onCalculationComplete,
  className = '',
}) => {
  const [inputs, setInputs] = useState<RefinanceInputs>({
    currentLoanBalance: 400000,
    currentInterestRate: 8.5,
    currentMonthlyPayment: 3076,
    remainingTerm: 25,
    newInterestRate: 7.25,
    newLoanTerm: 30,
    closingCosts: 6000,
    ...initialValues,
  });

  const [results, setResults] = useState<RefinanceResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate refinance when inputs change
  useEffect(() => {
    if (inputs.currentLoanBalance > 0 && inputs.currentInterestRate > 0 && inputs.newInterestRate > 0) {
      calculateRefinance();
    }
  }, [inputs]);

  const calculateRefinance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mortgage/refinance', {
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
      console.error('Refinance calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RefinanceInputs, value: number) => {
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

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('Excellent')) {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else if (recommendation.includes('Good') || recommendation.includes('opportunity')) {
      return <CheckCircleIcon className="w-5 h-5 text-blue-600" />;
    } else if (recommendation.includes('Consider')) {
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
    } else {
      return <InformationCircleIcon className="w-5 h-5 text-red-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Excellent')) {
      return 'bg-green-50 border-green-200 text-green-800';
    } else if (recommendation.includes('Good') || recommendation.includes('opportunity')) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    } else if (recommendation.includes('Consider')) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    } else {
      return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <ChartBarIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Refinance Calculator
          </h2>
        </div>
        <p className="text-secondary-600">
          Calculate potential savings from refinancing your current mortgage
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
            {/* Current Loan Section */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Current Loan Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Current Loan Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.currentLoanBalance}
                      onChange={(e) => handleInputChange('currentLoanBalance', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="400,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Current Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="20"
                      value={inputs.currentInterestRate}
                      onChange={(e) => handleInputChange('currentInterestRate', parseFloat(e.target.value) || 0)}
                      className="w-full pl-4 pr-8 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="8.50"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Current Monthly Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.currentMonthlyPayment}
                      onChange={(e) => handleInputChange('currentMonthlyPayment', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="3,076"
                    />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Principal & interest only (not including taxes/insurance)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Remaining Term (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={inputs.remainingTerm}
                    onChange={(e) => handleInputChange('remainingTerm', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="25"
                  />
                </div>
              </div>
            </div>

            {/* New Loan Section */}
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                New Loan Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    New Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="20"
                      value={inputs.newInterestRate}
                      onChange={(e) => handleInputChange('newInterestRate', parseFloat(e.target.value) || 0)}
                      className="w-full pl-4 pr-8 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="7.25"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    New Loan Term
                  </label>
                  <select
                    value={inputs.newLoanTerm}
                    onChange={(e) => handleInputChange('newLoanTerm', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={10}>10 years</option>
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                    <option value={25}>25 years</option>
                    <option value={30}>30 years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Estimated Closing Costs
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.closingCosts}
                      onChange={(e) => handleInputChange('closingCosts', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="6,000"
                    />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Typically 2-5% of loan amount for refinancing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : results ? (
              <>
                {/* Monthly Savings */}
                <div className="bg-accent-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Monthly Payment Comparison
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-accent-200">
                      <span className="text-secondary-700">Current Payment</span>
                      <span className="font-semibold text-secondary-900">
                        {formatCurrency(inputs.currentMonthlyPayment)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b border-accent-200">
                      <span className="text-secondary-700">New Payment</span>
                      <span className="font-semibold text-secondary-900">
                        {formatCurrency(results.newMonthlyPayment)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-secondary-900">Monthly Savings</span>
                      <span className={`font-bold text-xl ${results.monthlySavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.monthlySavings > 0 ? '+' : ''}{formatCurrency(results.monthlySavings)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Break-Even Analysis */}
                <div className="bg-primary-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Break-Even Analysis
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary-600">
                        {results.breakEvenMonths.toFixed(1)}
                      </div>
                      <div className="text-sm text-secondary-600">Months to Break Even</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600">
                        {formatCurrency(inputs.closingCosts)}
                      </div>
                      <div className="text-sm text-secondary-600">Closing Costs</div>
                    </div>
                  </div>
                  
                  {results.breakEvenMonths > 0 && results.monthlySavings > 0 && (
                    <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                      You'll recover closing costs in {Math.ceil(results.breakEvenMonths)} months 
                      ({(results.breakEvenMonths / 12).toFixed(1)} years)
                    </div>
                  )}
                </div>

                {/* Total Interest Savings */}
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Interest Comparison
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Current Loan Interest</span>
                      <span className="font-medium">{formatCurrency(results.totalInterestOld)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-700">New Loan Interest</span>
                      <span className="font-medium">{formatCurrency(results.totalInterestNew)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span className="text-secondary-900">Interest Savings</span>
                      <span className={`${results.interestSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.interestSavings > 0 ? '+' : ''}{formatCurrency(results.interestSavings)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Savings Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Total Savings Summary
                  </h3>
                  
                  <div className="text-center mb-4">
                    <div className={`text-3xl font-bold ${results.totalSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.totalSavings > 0 ? '+' : ''}{formatCurrency(results.totalSavings)}
                    </div>
                    <p className="text-sm text-secondary-600">
                      Total savings after closing costs
                    </p>
                  </div>

                  <div className="text-xs text-secondary-600">
                    <p>
                      Interest savings: {formatCurrency(results.interestSavings)}<br />
                      Less closing costs: {formatCurrency(-inputs.closingCosts)}<br />
                      <strong>Net savings: {formatCurrency(results.totalSavings)}</strong>
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
                  
                  {results.monthlySavings > 0 && (
                    <div className="mt-4 text-sm">
                      <p className="mb-2"><strong>Key Benefits:</strong></p>
                      <ul className="space-y-1 text-xs">
                        <li>• Save {formatCurrency(results.monthlySavings)} per month</li>
                        <li>• Save {formatCurrency(results.interestSavings)} in interest over loan life</li>
                        <li>• Break even in {Math.ceil(results.breakEvenMonths)} months</li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                <p>Enter your current loan details to see refinancing analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefinanceCalculator;