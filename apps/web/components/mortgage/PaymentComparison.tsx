import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScaleIcon,
  PlusIcon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface LoanScenario {
  id: string;
  name: string;
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  monthlyPayment?: number;
  totalInterest?: number;
  totalCost?: number;
}

interface PaymentComparisonProps {
  className?: string;
}

const PaymentComparison: React.FC<PaymentComparisonProps> = ({
  className = '',
}) => {
  const [scenarios, setScenarios] = useState<LoanScenario[]>([
    {
      id: '1',
      name: '30-Year Fixed',
      homePrice: 650000,
      downPayment: 130000,
      loanTerm: 30,
      interestRate: 7.25,
    },
    {
      id: '2',
      name: '15-Year Fixed',
      homePrice: 650000,
      downPayment: 130000,
      loanTerm: 15,
      interestRate: 6.85,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    calculateAllScenarios();
  }, [scenarios]);

  const calculateAllScenarios = async () => {
    setLoading(true);
    const updatedScenarios = await Promise.all(
      scenarios.map(async (scenario) => {
        if (!scenario.monthlyPayment) {
          return await calculateScenario(scenario);
        }
        return scenario;
      })
    );
    setScenarios(updatedScenarios);
    setLoading(false);
  };

  const calculateScenario = async (scenario: LoanScenario): Promise<LoanScenario> => {
    try {
      const response = await fetch('/api/mortgage/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homePrice: scenario.homePrice,
          downPayment: scenario.downPayment,
          loanTerm: scenario.loanTerm,
          interestRate: scenario.interestRate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate');
      }

      const data = await response.json();
      const results = data.data.results;

      return {
        ...scenario,
        monthlyPayment: results.totalMonthlyPayment,
        totalInterest: results.totalInterest,
        totalCost: results.totalCost,
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return scenario;
    }
  };

  const addScenario = (newScenario: Omit<LoanScenario, 'id' | 'monthlyPayment' | 'totalInterest' | 'totalCost'>) => {
    const scenario: LoanScenario = {
      ...newScenario,
      id: Date.now().toString(),
    };
    setScenarios([...scenarios, scenario]);
    setShowAddForm(false);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  const updateScenario = (id: string, updates: Partial<LoanScenario>) => {
    setScenarios(scenarios.map(s => 
      s.id === id 
        ? { ...s, ...updates, monthlyPayment: undefined, totalInterest: undefined, totalCost: undefined }
        : s
    ));
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

  // Find best scenario for each metric
  const bestMonthlyPayment = scenarios.reduce((best, current) => 
    (current.monthlyPayment || Infinity) < (best.monthlyPayment || Infinity) ? current : best
  );
  
  const bestTotalInterest = scenarios.reduce((best, current) => 
    (current.totalInterest || Infinity) < (best.totalInterest || Infinity) ? current : best
  );

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 rounded-lg p-2">
              <ScaleIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary-900">
                Loan Comparison
              </h2>
              <p className="text-sm text-secondary-600">
                Compare different loan scenarios side by side
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            Add Scenario
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-secondary-50 rounded-lg p-6 relative"
            >
              {/* Remove button */}
              {scenarios.length > 1 && (
                <button
                  onClick={() => removeScenario(scenario.id)}
                  className="absolute top-4 right-4 p-1 text-secondary-400 hover:text-red-600 transition-colors duration-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}

              {/* Scenario Header */}
              <div className="mb-4">
                <input
                  type="text"
                  value={scenario.name}
                  onChange={(e) => updateScenario(scenario.id, { name: e.target.value })}
                  className="text-lg font-bold text-secondary-900 bg-transparent border-none p-0 w-full focus:ring-0 focus:border-b focus:border-primary-500"
                  placeholder="Scenario name"
                />
              </div>

              {/* Inputs */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-1">
                    Home Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-secondary-500">$</span>
                    <input
                      type="number"
                      value={scenario.homePrice}
                      onChange={(e) => updateScenario(scenario.id, { homePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-6 pr-2 py-2 text-sm border border-secondary-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-1">
                    Down Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-secondary-500">$</span>
                    <input
                      type="number"
                      value={scenario.downPayment}
                      onChange={(e) => updateScenario(scenario.id, { downPayment: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-6 pr-2 py-2 text-sm border border-secondary-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-secondary-600 mb-1">
                      Term (Years)
                    </label>
                    <select
                      value={scenario.loanTerm}
                      onChange={(e) => updateScenario(scenario.id, { loanTerm: parseInt(e.target.value) })}
                      className="w-full px-2 py-2 text-sm border border-secondary-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                      <option value={25}>25</option>
                      <option value={30}>30</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary-600 mb-1">
                      Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={scenario.interestRate}
                      onChange={(e) => updateScenario(scenario.id, { interestRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-2 text-sm border border-secondary-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              {scenario.monthlyPayment ? (
                <div className="space-y-3">
                  <div className={`p-3 rounded ${
                    scenario.id === bestMonthlyPayment.id ? 'bg-green-50 border border-green-200' : 'bg-white'
                  }`}>
                    <div className="text-xs text-secondary-600">Monthly Payment</div>
                    <div className="text-lg font-bold text-secondary-900">
                      {formatCurrency(scenario.monthlyPayment)}
                      {scenario.id === bestMonthlyPayment.id && (
                        <span className="ml-2 text-xs text-green-600 font-medium">LOWEST</span>
                      )}
                    </div>
                  </div>

                  <div className={`p-3 rounded ${
                    scenario.id === bestTotalInterest.id ? 'bg-green-50 border border-green-200' : 'bg-white'
                  }`}>
                    <div className="text-xs text-secondary-600">Total Interest</div>
                    <div className="text-sm font-semibold text-secondary-900">
                      {formatCurrency(scenario.totalInterest || 0)}
                      {scenario.id === bestTotalInterest.id && (
                        <span className="ml-2 text-xs text-green-600 font-medium">LOWEST</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded">
                    <div className="text-xs text-secondary-600">Total Cost</div>
                    <div className="text-sm font-semibold text-secondary-900">
                      {formatCurrency(scenario.totalCost || 0)}
                    </div>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500 text-sm">
                  Enter loan details to calculate
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Summary Comparison Table */}
        {scenarios.length > 1 && scenarios[0].monthlyPayment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-secondary-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-secondary-900 mb-6">
              Side-by-Side Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-3 px-4 font-medium text-secondary-700">Scenario</th>
                    <th className="text-right py-3 px-4 font-medium text-secondary-700">Loan Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-secondary-700">Monthly Payment</th>
                    <th className="text-right py-3 px-4 font-medium text-secondary-700">Total Interest</th>
                    <th className="text-right py-3 px-4 font-medium text-secondary-700">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario) => (
                    <tr key={scenario.id} className="border-b border-secondary-100">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-secondary-900">{scenario.name}</div>
                          <div className="text-sm text-secondary-600">
                            {formatPercentage(scenario.interestRate)} for {scenario.loanTerm} years
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-secondary-900">
                        {formatCurrency(scenario.homePrice - scenario.downPayment)}
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className={`font-medium ${
                          scenario.id === bestMonthlyPayment.id ? 'text-green-600' : 'text-secondary-900'
                        }`}>
                          {formatCurrency(scenario.monthlyPayment || 0)}
                        </div>
                        {scenario.id === bestMonthlyPayment.id && (
                          <div className="text-xs text-green-600">BEST</div>
                        )}
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className={`font-medium ${
                          scenario.id === bestTotalInterest.id ? 'text-green-600' : 'text-secondary-900'
                        }`}>
                          {formatCurrency(scenario.totalInterest || 0)}
                        </div>
                        {scenario.id === bestTotalInterest.id && (
                          <div className="text-xs text-green-600">BEST</div>
                        )}
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-secondary-900">
                        {formatCurrency(scenario.totalCost || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Scenario Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-secondary-900">Add New Scenario</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 text-secondary-400 hover:text-secondary-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

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
  onAdd: (scenario: Omit<LoanScenario, 'id' | 'monthlyPayment' | 'totalInterest' | 'totalCost'>) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: 'New Scenario',
    homePrice: 650000,
    downPayment: 130000,
    loanTerm: 30,
    interestRate: 7.25,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          Scenario Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          Home Price
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
          <input
            type="number"
            value={formData.homePrice}
            onChange={(e) => setFormData({ ...formData, homePrice: parseFloat(e.target.value) || 0 })}
            className="w-full pl-8 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          Down Payment
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
          <input
            type="number"
            value={formData.downPayment}
            onChange={(e) => setFormData({ ...formData, downPayment: parseFloat(e.target.value) || 0 })}
            className="w-full pl-8 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Loan Term
          </label>
          <select
            value={formData.loanTerm}
            onChange={(e) => setFormData({ ...formData, loanTerm: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={10}>10 years</option>
            <option value={15}>15 years</option>
            <option value={20}>20 years</option>
            <option value={25}>25 years</option>
            <option value={30}>30 years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Interest Rate
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
              className="w-full pl-3 pr-8 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500">%</span>
          </div>
        </div>
      </div>

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

export default PaymentComparison;