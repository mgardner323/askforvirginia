import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  TrendingDownIcon,
  PlusIcon,
  XMarkIcon,
  ClockIcon,
  ChartBarIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ExtraPaymentScenario {
  id: string;
  name: string;
  type: 'monthly' | 'yearly' | 'one-time';
  amount: number;
  frequency: number; // For yearly: which month, for one-time: which year
  startYear?: number;
}

interface LoanInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
}

interface PaymentResults {
  standardLoan: {
    monthlyPayment: number;
    totalInterest: number;
    totalPaid: number;
    payoffTime: number; // in months
  };
  withExtraPayments: {
    totalInterest: number;
    totalPaid: number;
    payoffTime: number; // in months
    savings: {
      interestSaved: number;
      timeSaved: number; // in months
      totalSaved: number;
    };
  };
}

interface ExtraPaymentsCalculatorProps {
  initialInputs?: Partial<LoanInputs>;
  className?: string;
}

const ExtraPaymentsCalculator: React.FC<ExtraPaymentsCalculatorProps> = ({
  initialInputs = {},
  className = '',
}) => {
  const [inputs, setInputs] = useState<LoanInputs>({
    homePrice: 650000,
    downPayment: 130000,
    interestRate: 7.25,
    loanTerm: 30,
    ...initialInputs,
  });

  const [scenarios, setScenarios] = useState<ExtraPaymentScenario[]>([
    {
      id: '1',
      name: 'Extra $200/month',
      type: 'monthly',
      amount: 200,
      frequency: 0,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string>('1');

  const loanAmount = inputs.homePrice - inputs.downPayment;

  // Calculate results for all scenarios
  const results = useMemo(() => {
    return scenarios.map(scenario => ({
      scenario,
      results: calculateExtraPaymentResults(inputs, [scenario]),
    }));
  }, [inputs, scenarios]);

  const calculateExtraPaymentResults = (
    loanInputs: LoanInputs,
    extraScenarios: ExtraPaymentScenario[]
  ): PaymentResults => {
    const loanAmount = loanInputs.homePrice - loanInputs.downPayment;
    const monthlyRate = loanInputs.interestRate / 100 / 12;
    const totalPayments = loanInputs.loanTerm * 12;

    // Calculate standard monthly payment
    const standardMonthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    // Standard loan calculations
    const standardTotalInterest = (standardMonthlyPayment * totalPayments) - loanAmount;
    const standardTotalPaid = loanAmount + standardTotalInterest;

    // Calculate with extra payments
    let remainingBalance = loanAmount;
    let totalInterest = 0;
    let monthsPaid = 0;

    for (let month = 1; month <= totalPayments && remainingBalance > 0; month++) {
      const year = Math.ceil(month / 12);
      const monthInYear = ((month - 1) % 12) + 1;

      // Calculate interest for this month
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = standardMonthlyPayment - interestPayment;

      // Add extra payments
      let extraPayment = 0;
      extraScenarios.forEach(scenario => {
        if (scenario.type === 'monthly') {
          extraPayment += scenario.amount;
        } else if (scenario.type === 'yearly' && monthInYear === scenario.frequency) {
          extraPayment += scenario.amount;
        } else if (scenario.type === 'one-time' && year === scenario.frequency) {
          extraPayment += scenario.amount;
        }
      });

      principalPayment += extraPayment;

      // Don't overpay
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }

      remainingBalance -= principalPayment;
      totalInterest += interestPayment;
      monthsPaid = month;

      if (remainingBalance <= 0) break;
    }

    const totalPaidWithExtra = loanAmount + totalInterest;

    return {
      standardLoan: {
        monthlyPayment: standardMonthlyPayment,
        totalInterest: standardTotalInterest,
        totalPaid: standardTotalPaid,
        payoffTime: totalPayments,
      },
      withExtraPayments: {
        totalInterest,
        totalPaid: totalPaidWithExtra,
        payoffTime: monthsPaid,
        savings: {
          interestSaved: standardTotalInterest - totalInterest,
          timeSaved: totalPayments - monthsPaid,
          totalSaved: standardTotalPaid - totalPaidWithExtra,
        },
      },
    };
  };

  const handleInputChange = (field: keyof LoanInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addScenario = (scenario: Omit<ExtraPaymentScenario, 'id'>) => {
    const newScenario: ExtraPaymentScenario = {
      ...scenario,
      id: Date.now().toString(),
    };
    setScenarios([...scenarios, newScenario]);
    setActiveScenario(newScenario.id);
    setShowAddForm(false);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter(s => s.id !== id));
      if (activeScenario === id) {
        setActiveScenario(scenarios.find(s => s.id !== id)?.id || '');
      }
    }
  };

  const updateScenario = (id: string, updates: Partial<ExtraPaymentScenario>) => {
    setScenarios(scenarios.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} years`;
    return `${years} years ${remainingMonths} months`;
  };

  const activeResults = results.find(r => r.scenario.id === activeScenario)?.results;

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Extra Payments Calculator
          </h2>
        </div>
        <p className="text-secondary-600">
          See how extra payments can save you thousands in interest and years off your loan
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            {/* Loan Details */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Loan Details
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
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Interest Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={inputs.interestRate}
                        onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                        className="w-full pl-3 pr-8 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Loan Term
                    </label>
                    <select
                      value={inputs.loanTerm}
                      onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value))}
                      className="w-full px-3 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={15}>15 years</option>
                      <option value={20}>20 years</option>
                      <option value={25}>25 years</option>
                      <option value={30}>30 years</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-secondary-200">
                  <div className="text-sm text-secondary-600">Loan Amount</div>
                  <div className="text-lg font-bold text-secondary-900">
                    {formatCurrency(loanAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Extra Payment Scenarios */}
            <div className="bg-primary-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900">
                  Extra Payment Scenarios
                </h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Scenario
                </button>
              </div>

              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      activeScenario === scenario.id
                        ? 'border-primary-300 bg-white'
                        : 'border-transparent bg-white/50 hover:bg-white'
                    }`}
                    onClick={() => setActiveScenario(scenario.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-secondary-900">{scenario.name}</div>
                        <div className="text-sm text-secondary-600">
                          {scenario.type === 'monthly' && `${formatCurrency(scenario.amount)}/month`}
                          {scenario.type === 'yearly' && `${formatCurrency(scenario.amount)} in month ${scenario.frequency}`}
                          {scenario.type === 'one-time' && `${formatCurrency(scenario.amount)} in year ${scenario.frequency}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activeScenario === scenario.id && (
                          <CheckCircleIcon className="w-4 h-4 text-primary-600" />
                        )}
                        {scenarios.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeScenario(scenario.id);
                            }}
                            className="p-1 text-secondary-400 hover:text-red-600 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Scenarios */}
            <div className="bg-accent-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Quick Add Scenarios
              </h3>
              
              <div className="space-y-2">
                {[
                  { name: 'Extra $100/month', amount: 100 },
                  { name: 'Extra $300/month', amount: 300 },
                  { name: 'Extra $500/month', amount: 500 },
                  { name: 'Annual tax refund $2,500', amount: 2500, type: 'yearly' as const, frequency: 2 },
                ].map((quickScenario, index) => (
                  <button
                    key={index}
                    onClick={() => addScenario({
                      name: quickScenario.name,
                      type: quickScenario.type || 'monthly',
                      amount: quickScenario.amount,
                      frequency: quickScenario.frequency || 0,
                    })}
                    className="w-full text-left px-3 py-2 text-sm bg-white rounded-lg hover:bg-accent-100 transition-colors"
                  >
                    + {quickScenario.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2">
            {activeResults ? (
              <div className="space-y-6">
                {/* Savings Summary */}
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                    <TrendingDownIcon className="w-5 h-5 text-green-600" />
                    Savings Summary
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(activeResults.withExtraPayments.savings.interestSaved)}
                      </div>
                      <div className="text-sm text-secondary-600 mt-1">Interest Saved</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatTime(activeResults.withExtraPayments.savings.timeSaved)}
                      </div>
                      <div className="text-sm text-secondary-600 mt-1">Time Saved</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-600">
                        {formatCurrency(activeResults.withExtraPayments.savings.totalSaved)}
                      </div>
                      <div className="text-sm text-secondary-600 mt-1">Total Saved</div>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-lg border border-secondary-200">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                      <ChartBarIcon className="w-5 h-5 text-primary-600" />
                      Standard vs Extra Payments
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-secondary-200">
                            <th className="text-left py-3 px-4 font-medium text-secondary-700">Metric</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Standard Loan</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">With Extra Payments</th>
                            <th className="text-right py-3 px-4 font-medium text-secondary-700">Difference</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-secondary-100">
                            <td className="py-3 px-4 font-medium text-secondary-900">Monthly Payment</td>
                            <td className="text-right py-3 px-4 text-secondary-900">
                              {formatCurrency(activeResults.standardLoan.monthlyPayment)}
                            </td>
                            <td className="text-right py-3 px-4 text-secondary-900">
                              {formatCurrency(activeResults.standardLoan.monthlyPayment + (
                                scenarios.find(s => s.id === activeScenario)?.type === 'monthly' 
                                  ? scenarios.find(s => s.id === activeScenario)?.amount || 0 
                                  : 0
                              ))}
                            </td>
                            <td className="text-right py-3 px-4 text-red-600">
                              +{formatCurrency(
                                scenarios.find(s => s.id === activeScenario)?.type === 'monthly' 
                                  ? scenarios.find(s => s.id === activeScenario)?.amount || 0 
                                  : 0
                              )}
                            </td>
                          </tr>
                          
                          <tr className="border-b border-secondary-100">
                            <td className="py-3 px-4 font-medium text-secondary-900">Payoff Time</td>
                            <td className="text-right py-3 px-4 text-secondary-900">
                              {formatTime(activeResults.standardLoan.payoffTime)}
                            </td>
                            <td className="text-right py-3 px-4 text-secondary-900">
                              {formatTime(activeResults.withExtraPayments.payoffTime)}
                            </td>
                            <td className="text-right py-3 px-4 text-green-600">
                              -{formatTime(activeResults.withExtraPayments.savings.timeSaved)}
                            </td>
                          </tr>
                          
                          <tr className="border-b border-secondary-100">
                            <td className="py-3 px-4 font-medium text-secondary-900">Total Interest</td>
                            <td className="text-right py-3 px-4 text-secondary-900">
                              {formatCurrency(activeResults.standardLoan.totalInterest)}
                            </td>
                            <td className="text-right py-3 px-4 text-secondary-900">
                              {formatCurrency(activeResults.withExtraPayments.totalInterest)}
                            </td>
                            <td className="text-right py-3 px-4 text-green-600">
                              -{formatCurrency(activeResults.withExtraPayments.savings.interestSaved)}
                            </td>
                          </tr>
                          
                          <tr className="bg-secondary-50">
                            <td className="py-3 px-4 font-bold text-secondary-900">Total Paid</td>
                            <td className="text-right py-3 px-4 font-bold text-secondary-900">
                              {formatCurrency(activeResults.standardLoan.totalPaid)}
                            </td>
                            <td className="text-right py-3 px-4 font-bold text-secondary-900">
                              {formatCurrency(activeResults.withExtraPayments.totalPaid)}
                            </td>
                            <td className="text-right py-3 px-4 font-bold text-green-600">
                              -{formatCurrency(activeResults.withExtraPayments.savings.totalSaved)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Scenario Details */}
                {scenarios.find(s => s.id === activeScenario) && (
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                      <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                      Scenario Analysis
                    </h3>
                    
                    <div className="text-sm space-y-2">
                      <p>
                        <strong>Strategy:</strong> {scenarios.find(s => s.id === activeScenario)?.name}
                      </p>
                      
                      {activeResults.withExtraPayments.savings.interestSaved > 10000 && (
                        <div className="bg-green-100 p-3 rounded border">
                          <strong className="text-green-800">Excellent Strategy!</strong>
                          <p className="text-green-700 mt-1">
                            This extra payment plan will save you over {formatCurrency(activeResults.withExtraPayments.savings.interestSaved)} in interest 
                            and allow you to pay off your home {formatTime(activeResults.withExtraPayments.savings.timeSaved)} earlier.
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="font-medium text-secondary-800">Return on Investment</div>
                          <div className="text-secondary-600">
                            Effective return: ~{inputs.interestRate.toFixed(2)}% (tax-free)
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-secondary-800">Break-even Time</div>
                          <div className="text-secondary-600">
                            Immediate (guaranteed interest savings)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Scenarios Comparison */}
                {scenarios.length > 1 && (
                  <div className="bg-white rounded-lg border border-secondary-200">
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-secondary-900 mb-4">
                        All Scenarios Comparison
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-secondary-200">
                              <th className="text-left py-2 px-3 font-medium text-secondary-700">Scenario</th>
                              <th className="text-right py-2 px-3 font-medium text-secondary-700">Interest Saved</th>
                              <th className="text-right py-2 px-3 font-medium text-secondary-700">Time Saved</th>
                              <th className="text-right py-2 px-3 font-medium text-secondary-700">Total Saved</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.map((result) => (
                              <tr 
                                key={result.scenario.id}
                                className={`border-b border-secondary-100 cursor-pointer hover:bg-secondary-50 ${
                                  activeScenario === result.scenario.id ? 'bg-primary-50' : ''
                                }`}
                                onClick={() => setActiveScenario(result.scenario.id)}
                              >
                                <td className="py-2 px-3 font-medium text-secondary-900">
                                  {result.scenario.name}
                                </td>
                                <td className="text-right py-2 px-3 text-green-600">
                                  {formatCurrency(result.results.withExtraPayments.savings.interestSaved)}
                                </td>
                                <td className="text-right py-2 px-3 text-blue-600">
                                  {formatTime(result.results.withExtraPayments.savings.timeSaved)}
                                </td>
                                <td className="text-right py-2 px-3 text-primary-600">
                                  {formatCurrency(result.results.withExtraPayments.savings.totalSaved)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                <p>Select a scenario to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Scenario Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <AddScenarioForm
              onAdd={addScenario}
              onCancel={() => setShowAddForm(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Add Scenario Form Component
const AddScenarioForm: React.FC<{
  onAdd: (scenario: Omit<ExtraPaymentScenario, 'id'>) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly' as 'monthly' | 'yearly' | 'one-time',
    amount: 0,
    frequency: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.amount > 0) {
      onAdd(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-secondary-900">Add Extra Payment Scenario</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-secondary-400 hover:text-secondary-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Scenario Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Bonus payment plan"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Payment Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="monthly">Monthly Extra Payment</option>
          <option value="yearly">Annual Extra Payment</option>
          <option value="one-time">One-Time Extra Payment</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Payment Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            min="1"
          />
        </div>
      </div>

      {formData.type === 'yearly' && (
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Payment Month (1-12)
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-secondary-600 mt-1">
            Which month of the year to make this payment (e.g., 2 for February)
          </p>
        </div>
      )}

      {formData.type === 'one-time' && (
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Payment Year
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-secondary-600 mt-1">
            Which year of the loan to make this payment
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Add Scenario
        </button>
      </div>
    </form>
  );
};

export default ExtraPaymentsCalculator;