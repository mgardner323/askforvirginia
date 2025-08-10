import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalculatorIcon,
  HomeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlusIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  propertyTax?: number;
  homeInsurance?: number;
  pmi?: number;
  hoaFees?: number;
}

interface MortgageResults {
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
}

interface MortgageCalculatorProps {
  initialValues?: Partial<MortgageInputs>;
  onCalculationComplete?: (results: MortgageResults) => void;
  className?: string;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  initialValues = {},
  onCalculationComplete,
  className = '',
}) => {
  const [inputs, setInputs] = useState<MortgageInputs>({
    homePrice: 650000,
    downPayment: 130000,
    loanTerm: 30,
    interestRate: 7.25,
    propertyTax: 0,
    homeInsurance: 0,
    pmi: 0,
    hoaFees: 0,
    ...initialValues,
  });

  const [results, setResults] = useState<MortgageResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate mortgage when inputs change
  useEffect(() => {
    if (inputs.homePrice > 0 && inputs.downPayment >= 0 && inputs.interestRate > 0) {
      calculateMortgage();
    }
  }, [inputs]);

  const calculateMortgage = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mortgage/calculate', {
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
      console.error('Mortgage calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof MortgageInputs, value: number) => {
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

  const downPaymentPercentage = inputs.homePrice > 0 
    ? (inputs.downPayment / inputs.homePrice) * 100 
    : 0;

  const loanToValue = inputs.homePrice > 0 
    ? ((inputs.homePrice - inputs.downPayment) / inputs.homePrice) * 100 
    : 0;

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <CalculatorIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Mortgage Calculator
          </h2>
        </div>
        <p className="text-secondary-600">
          Calculate your monthly mortgage payment for Southern California properties
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
            {/* Home Price */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                <HomeIcon className="w-4 h-4 inline mr-2" />
                Home Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                <input
                  type="number"
                  value={inputs.homePrice}
                  onChange={(e) => handleInputChange('homePrice', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="650,000"
                />
              </div>
            </div>

            {/* Down Payment */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                Down Payment
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                  <input
                    type="number"
                    value={inputs.downPayment}
                    onChange={(e) => handleInputChange('downPayment', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="130,000"
                  />
                </div>
                <div className="flex items-center justify-center bg-secondary-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-secondary-700">
                    {downPaymentPercentage.toFixed(1)}% down
                  </span>
                </div>
              </div>
            </div>

            {/* Loan Term */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
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

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                <PlusIcon className="w-4 h-4 inline mr-2" />
                Interest Rate
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
                {/* Property Tax */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Annual Property Tax
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.propertyTax || 0}
                      onChange={(e) => handleInputChange('propertyTax', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>

                {/* Home Insurance */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Annual Home Insurance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.homeInsurance || 0}
                      onChange={(e) => handleInputChange('homeInsurance', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>

                {/* PMI */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Monthly PMI
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.pmi || 0}
                      onChange={(e) => handleInputChange('pmi', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Auto-calculated if < 20% down"
                    />
                  </div>
                </div>

                {/* HOA Fees */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Monthly HOA Fees
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.hoaFees || 0}
                      onChange={(e) => handleInputChange('hoaFees', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
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
                {/* Monthly Payment Breakdown */}
                <div className="bg-primary-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Monthly Payment Breakdown
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-primary-200">
                      <span className="font-semibold text-secondary-900">Principal & Interest</span>
                      <span className="font-bold text-lg text-primary-600">
                        {formatCurrency(results.principalAndInterest)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-700">Property Tax</span>
                      <span className="font-medium">
                        {formatCurrency(results.monthlyPropertyTax)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-700">Home Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(results.monthlyInsurance)}
                      </span>
                    </div>
                    
                    {results.monthlyPMI > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-700">PMI</span>
                        <span className="font-medium">
                          {formatCurrency(results.monthlyPMI)}
                        </span>
                      </div>
                    )}
                    
                    {results.monthlyHOA > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-secondary-700">HOA Fees</span>
                        <span className="font-medium">
                          {formatCurrency(results.monthlyHOA)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-3 border-t border-primary-200">
                      <span className="font-bold text-secondary-900">Total Monthly Payment</span>
                      <span className="font-bold text-xl text-secondary-900">
                        {formatCurrency(results.totalMonthlyPayment)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Loan Summary */}
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Loan Summary
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-600 block">Loan Amount</span>
                      <span className="font-semibold text-secondary-900">
                        {formatCurrency(results.loanAmount)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-secondary-600 block">Loan-to-Value</span>
                      <span className="font-semibold text-secondary-900">
                        {loanToValue.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-secondary-600 block">Total Interest</span>
                      <span className="font-semibold text-secondary-900">
                        {formatCurrency(results.totalInterest)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-secondary-600 block">Total Cost</span>
                      <span className="font-semibold text-secondary-900">
                        {formatCurrency(results.totalCost)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Insights */}
                <div className="bg-accent-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Quick Insights
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    {downPaymentPercentage < 20 && (
                      <div className="flex items-start gap-2">
                        <InformationCircleIcon className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" />
                        <p className="text-secondary-700">
                          With less than 20% down, PMI is required, adding{' '}
                          <span className="font-semibold">
                            {formatCurrency(results.monthlyPMI)}
                          </span>{' '}
                          monthly.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <InformationCircleIcon className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" />
                      <p className="text-secondary-700">
                        Property tax estimate based on Southern California rates.
                        Actual taxes may vary by location.
                      </p>
                    </div>
                    
                    {results.totalInterest > results.loanAmount && (
                      <div className="flex items-start gap-2">
                        <InformationCircleIcon className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" />
                        <p className="text-secondary-700">
                          You'll pay{' '}
                          <span className="font-semibold">
                            {formatCurrency(results.totalInterest)}
                          </span>{' '}
                          in interest over the life of the loan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                <p>Enter loan details to see payment calculation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;