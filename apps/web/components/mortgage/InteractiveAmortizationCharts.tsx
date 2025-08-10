import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ChartPieIcon,
  TrendingUpIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface AmortizationData {
  paymentNumber: number;
  year: number;
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
  equityBuilt: number;
}

interface ChartInputs {
  homePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  extraPayment: number;
}

interface InteractiveAmortizationChartsProps {
  initialInputs?: Partial<ChartInputs>;
  className?: string;
}

const InteractiveAmortizationCharts: React.FC<InteractiveAmortizationChartsProps> = ({
  initialInputs = {},
  className = '',
}) => {
  const [inputs, setInputs] = useState<ChartInputs>({
    homePrice: 650000,
    downPayment: 130000,
    loanAmount: 520000,
    interestRate: 7.25,
    loanTerm: 30,
    extraPayment: 0,
    ...initialInputs,
  });

  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [activeChart, setActiveChart] = useState<'payoff' | 'breakdown' | 'equity' | 'comparison'>('payoff');
  const [showExtraPayment, setShowExtraPayment] = useState<boolean>(false);

  // Calculate amortization data
  const amortizationData = useMemo(() => {
    return calculateAmortizationData(inputs);
  }, [inputs]);

  const extraPaymentData = useMemo(() => {
    if (inputs.extraPayment <= 0) return null;
    return calculateAmortizationData({
      ...inputs,
      extraPayment: inputs.extraPayment,
    });
  }, [inputs]);

  useEffect(() => {
    setInputs(prev => ({
      ...prev,
      loanAmount: prev.homePrice - prev.downPayment,
    }));
  }, []);

  const calculateAmortizationData = (params: ChartInputs): AmortizationData[] => {
    const { loanAmount, interestRate, loanTerm, extraPayment } = params;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTerm * 12;
    
    // Base monthly payment (P&I)
    const basePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                       (Math.pow(1 + monthlyRate, totalPayments) - 1);

    const data: AmortizationData[] = [];
    let remainingBalance = loanAmount;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;

    for (let i = 1; i <= totalPayments && remainingBalance > 0; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = basePayment - interestPayment + extraPayment;
      
      // Don't overpay the remaining balance
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }

      const totalPayment = interestPayment + principalPayment;
      remainingBalance -= principalPayment;
      cumulativePrincipal += principalPayment;
      cumulativeInterest += interestPayment;

      data.push({
        paymentNumber: i,
        year: Math.ceil(i / 12),
        month: ((i - 1) % 12) + 1,
        payment: totalPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance),
        cumulativePrincipal,
        cumulativeInterest,
        equityBuilt: params.downPayment + cumulativePrincipal,
      });

      if (remainingBalance <= 0) break;
    }

    return data;
  };

  const handleInputChange = (field: keyof ChartInputs, value: number) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };
      if (field === 'homePrice' || field === 'downPayment') {
        newInputs.loanAmount = newInputs.homePrice - newInputs.downPayment;
      }
      return newInputs;
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const yearlyData = useMemo(() => {
    const yearly = amortizationData.reduce((acc, payment) => {
      if (!acc[payment.year]) {
        acc[payment.year] = {
          year: payment.year,
          totalPayments: 0,
          totalPrincipal: 0,
          totalInterest: 0,
          endingBalance: 0,
          equityBuilt: 0,
        };
      }
      acc[payment.year].totalPayments += payment.payment;
      acc[payment.year].totalPrincipal += payment.principal;
      acc[payment.year].totalInterest += payment.interest;
      acc[payment.year].endingBalance = payment.remainingBalance;
      acc[payment.year].equityBuilt = payment.equityBuilt;
      return acc;
    }, {} as any);

    return Object.values(yearly) as any[];
  }, [amortizationData]);

  const totalStats = useMemo(() => {
    if (amortizationData.length === 0) return null;
    
    const lastPayment = amortizationData[amortizationData.length - 1];
    const totalInterest = lastPayment.cumulativeInterest;
    const totalPaid = inputs.loanAmount + totalInterest;
    const payoffTime = amortizationData.length;
    
    let comparison = null;
    if (extraPaymentData) {
      const extraLastPayment = extraPaymentData[extraPaymentData.length - 1];
      comparison = {
        interestSaved: totalInterest - extraLastPayment.cumulativeInterest,
        timeSaved: payoffTime - extraPaymentData.length,
        totalSaved: (inputs.loanAmount + totalInterest) - (inputs.loanAmount + extraLastPayment.cumulativeInterest),
      };
    }

    return {
      totalInterest,
      totalPaid,
      payoffTime,
      comparison,
    };
  }, [amortizationData, extraPaymentData, inputs.loanAmount]);

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <ChartBarIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Interactive Amortization Charts
          </h2>
        </div>
        <p className="text-secondary-600">
          Visual analysis of your loan payoff, principal vs interest breakdown, and equity building
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Controls */}
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
                    Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.loanAmount}
                      readOnly
                      className="w-full pl-8 pr-4 py-2 bg-secondary-100 border border-secondary-300 rounded-lg text-secondary-600"
                    />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">Calculated automatically</p>
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
                        className="w-full pl-3 pr-8 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

            {/* Extra Payment */}
            <div className="bg-accent-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900">
                  Extra Payment Analysis
                </h3>
                <button
                  onClick={() => setShowExtraPayment(!showExtraPayment)}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  {showExtraPayment ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  {showExtraPayment ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showExtraPayment && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Extra Monthly Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.extraPayment}
                      onChange={(e) => handleInputChange('extraPayment', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-secondary-600 mt-1">
                    Additional principal payment each month
                  </p>
                </div>
              )}

              {totalStats?.comparison && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Interest Saved:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(totalStats.comparison.interestSaved)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Time Saved:</span>
                    <span className="font-semibold text-green-600">
                      {Math.floor(totalStats.comparison.timeSaved / 12)} years {totalStats.comparison.timeSaved % 12} months
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Selection */}
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Chart Views
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setActiveChart('payoff')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeChart === 'payoff' ? 'bg-primary-100 text-primary-700' : 'hover:bg-white'
                  }`}
                >
                  📈 Loan Payoff Progress
                </button>
                <button
                  onClick={() => setActiveChart('breakdown')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeChart === 'breakdown' ? 'bg-primary-100 text-primary-700' : 'hover:bg-white'
                  }`}
                >
                  🥧 Principal vs Interest
                </button>
                <button
                  onClick={() => setActiveChart('equity')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeChart === 'equity' ? 'bg-primary-100 text-primary-700' : 'hover:bg-white'
                  }`}
                >
                  📊 Equity Building
                </button>
                <button
                  onClick={() => setActiveChart('comparison')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeChart === 'comparison' ? 'bg-primary-100 text-primary-700' : 'hover:bg-white'
                  }`}
                >
                  ⚖️ Payment Comparison
                </button>
              </div>
            </div>
          </div>

          {/* Charts Display */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Summary Stats */}
              {totalStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {formatCurrency(totalStats.totalInterest)}
                    </div>
                    <div className="text-sm text-secondary-600">Total Interest</div>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-secondary-900">
                      {Math.floor(totalStats.payoffTime / 12)} years
                    </div>
                    <div className="text-sm text-secondary-600">Payoff Time</div>
                  </div>
                  <div className="bg-accent-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-accent-600">
                      {formatCurrency(totalStats.totalPaid)}
                    </div>
                    <div className="text-sm text-secondary-600">Total Paid</div>
                  </div>
                </div>
              )}

              {/* Active Chart */}
              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                {activeChart === 'payoff' && (
                  <LoanPayoffChart 
                    data={yearlyData} 
                    selectedYear={selectedYear} 
                    onYearChange={setSelectedYear}
                  />
                )}
                
                {activeChart === 'breakdown' && (
                  <PrincipalInterestBreakdown 
                    data={yearlyData} 
                    loanAmount={inputs.loanAmount}
                  />
                )}
                
                {activeChart === 'equity' && (
                  <EquityBuildingChart 
                    data={yearlyData} 
                    homePrice={inputs.homePrice}
                  />
                )}
                
                {activeChart === 'comparison' && extraPaymentData && (
                  <PaymentComparisonChart 
                    standardData={amortizationData}
                    extraData={extraPaymentData}
                    extraAmount={inputs.extraPayment}
                  />
                )}
              </div>

              {/* Year Selector for detailed view */}
              {(activeChart === 'payoff' || activeChart === 'breakdown') && (
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-secondary-900 mb-3">
                    Year {selectedYear} Details
                  </h4>
                  {yearlyData[selectedYear - 1] && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-secondary-600">Principal Paid</div>
                        <div className="font-semibold text-blue-600">
                          {formatCurrency(yearlyData[selectedYear - 1].totalPrincipal)}
                        </div>
                      </div>
                      <div>
                        <div className="text-secondary-600">Interest Paid</div>
                        <div className="font-semibold text-red-600">
                          {formatCurrency(yearlyData[selectedYear - 1].totalInterest)}
                        </div>
                      </div>
                      <div>
                        <div className="text-secondary-600">Remaining Balance</div>
                        <div className="font-semibold text-secondary-900">
                          {formatCurrency(yearlyData[selectedYear - 1].endingBalance)}
                        </div>
                      </div>
                      <div>
                        <div className="text-secondary-600">Equity Built</div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(yearlyData[selectedYear - 1].equityBuilt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chart Components
const LoanPayoffChart: React.FC<{
  data: any[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}> = ({ data, selectedYear, onYearChange }) => {
  const maxBalance = Math.max(...data.map(d => d.endingBalance));

  return (
    <div>
      <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
        <TrendingUpIcon className="w-5 h-5 text-primary-600" />
        Loan Balance Over Time
      </h3>
      
      <div className="h-64 relative bg-secondary-50 rounded-lg p-4">
        <div className="flex items-end h-full space-x-1">
          {data.slice(0, 15).map((yearData, index) => (
            <div
              key={yearData.year}
              className="flex-1 flex flex-col items-center cursor-pointer group"
              onClick={() => onYearChange(yearData.year)}
            >
              <div
                className={`w-full rounded-t transition-colors duration-200 ${
                  selectedYear === yearData.year
                    ? 'bg-primary-600'
                    : 'bg-primary-300 group-hover:bg-primary-400'
                }`}
                style={{
                  height: `${(yearData.endingBalance / maxBalance) * 100}%`,
                  minHeight: '4px',
                }}
              />
              <div className="text-xs text-secondary-600 mt-1 transform -rotate-45 origin-left">
                Y{yearData.year}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-sm text-secondary-600 mt-2">
        Click on a year to see detailed breakdown. Chart shows loan balance declining over time.
      </p>
    </div>
  );
};

const PrincipalInterestBreakdown: React.FC<{
  data: any[];
  loanAmount: number;
}> = ({ data, loanAmount }) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
        <ChartPieIcon className="w-5 h-5 text-primary-600" />
        Principal vs Interest Breakdown by Year
      </h3>
      
      <div className="space-y-2">
        {data.slice(0, 10).map((yearData) => {
          const total = yearData.totalPrincipal + yearData.totalInterest;
          const principalPct = (yearData.totalPrincipal / total) * 100;
          const interestPct = (yearData.totalInterest / total) * 100;
          
          return (
            <div key={yearData.year} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-secondary-700">
                Year {yearData.year}
              </div>
              <div className="flex-1 bg-secondary-200 rounded-lg overflow-hidden">
                <div className="flex h-6">
                  <div
                    className="bg-blue-400"
                    style={{ width: `${principalPct}%` }}
                    title={`Principal: ${principalPct.toFixed(1)}%`}
                  />
                  <div
                    className="bg-red-400"
                    style={{ width: `${interestPct}%` }}
                    title={`Interest: ${interestPct.toFixed(1)}%`}
                  />
                </div>
              </div>
              <div className="w-24 text-sm text-secondary-600 text-right">
                ${Math.round(total).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded" />
          <span className="text-secondary-600">Principal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded" />
          <span className="text-secondary-600">Interest</span>
        </div>
      </div>
    </div>
  );
};

const EquityBuildingChart: React.FC<{
  data: any[];
  homePrice: number;
}> = ({ data, homePrice }) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
        <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
        Home Equity Growth
      </h3>
      
      <div className="h-64 relative bg-secondary-50 rounded-lg p-4">
        <div className="flex items-end h-full space-x-1">
          {data.slice(0, 15).map((yearData) => (
            <div key={yearData.year} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-green-400 rounded-t"
                style={{
                  height: `${(yearData.equityBuilt / homePrice) * 100}%`,
                  minHeight: '8px',
                }}
              />
              <div className="text-xs text-secondary-600 mt-1 transform -rotate-45 origin-left">
                Y{yearData.year}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-sm text-secondary-600 mt-2">
        Shows equity as percentage of home value. Includes down payment plus principal payments.
      </p>
    </div>
  );
};

const PaymentComparisonChart: React.FC<{
  standardData: AmortizationData[];
  extraData: AmortizationData[];
  extraAmount: number;
}> = ({ standardData, extraData, extraAmount }) => {
  const formatCurrency = (amount: number) => `$${Math.round(amount).toLocaleString()}`;

  return (
    <div>
      <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
        <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
        Standard vs Extra Payment Comparison
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Standard Payment</h4>
          <div className="space-y-1 text-sm">
            <div>Duration: {Math.floor(standardData.length / 12)} years {standardData.length % 12} months</div>
            <div>Total Interest: {formatCurrency(standardData[standardData.length - 1]?.cumulativeInterest || 0)}</div>
            <div>Total Paid: {formatCurrency((standardData[standardData.length - 1]?.cumulativeInterest || 0) + (standardData[0]?.remainingBalance || 0))}</div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">With {formatCurrency(extraAmount)} Extra</h4>
          <div className="space-y-1 text-sm">
            <div>Duration: {Math.floor(extraData.length / 12)} years {extraData.length % 12} months</div>
            <div>Total Interest: {formatCurrency(extraData[extraData.length - 1]?.cumulativeInterest || 0)}</div>
            <div>Total Paid: {formatCurrency((extraData[extraData.length - 1]?.cumulativeInterest || 0) + (extraData[0]?.remainingBalance || 0))}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveAmortizationCharts;