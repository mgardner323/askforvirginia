import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface AmortizationEntry {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface AmortizationScheduleProps {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate?: Date;
  className?: string;
}

const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  loanAmount,
  interestRate,
  loanTerm,
  startDate = new Date(),
  className = '',
}) => {
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && loanTerm > 0) {
      fetchAmortizationSchedule();
    }
  }, [loanAmount, interestRate, loanTerm, startDate]);

  const fetchAmortizationSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mortgage/amortization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanAmount,
          interestRate,
          loanTerm,
          startDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate schedule');
      }

      const data = await response.json();
      setSchedule(data.data.schedule);
      setSelectedYear(startDate.getFullYear());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate schedule');
      console.error('Amortization schedule error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
    }).format(new Date(date));
  };

  // Get yearly summary data
  const getYearlySummary = () => {
    const yearlyData: { [year: number]: {
      totalPayments: number;
      totalPrincipal: number;
      totalInterest: number;
      endingBalance: number;
      payments: AmortizationEntry[];
    } } = {};

    schedule.forEach((entry) => {
      const year = new Date(entry.date).getFullYear();
      if (!yearlyData[year]) {
        yearlyData[year] = {
          totalPayments: 0,
          totalPrincipal: 0,
          totalInterest: 0,
          endingBalance: 0,
          payments: [],
        };
      }
      yearlyData[year].totalPayments += entry.payment;
      yearlyData[year].totalPrincipal += entry.principal;
      yearlyData[year].totalInterest += entry.interest;
      yearlyData[year].endingBalance = entry.remainingBalance;
      yearlyData[year].payments.push(entry);
    });

    return yearlyData;
  };

  const downloadCSV = () => {
    const headers = ['Payment #', 'Date', 'Payment', 'Principal', 'Interest', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...schedule.map(entry => [
        entry.paymentNumber,
        formatDate(entry.date),
        entry.payment.toFixed(2),
        entry.principal.toFixed(2),
        entry.interest.toFixed(2),
        entry.remainingBalance.toFixed(2),
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amortization-schedule-${loanAmount}-${interestRate}-${loanTerm}year.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const yearlyData = schedule.length > 0 ? getYearlySummary() : {};
  const availableYears = Object.keys(yearlyData).map(Number).sort();
  const selectedYearData = yearlyData[selectedYear];

  // Calculate totals
  const totalInterest = schedule.reduce((sum, entry) => sum + entry.interest, 0);
  const totalPayments = schedule.reduce((sum, entry) => sum + entry.payment, 0);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-secondary-600">Generating amortization schedule...</p>
        </div>
      </div>
    );
  }

  if (error || schedule.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
        <div className="p-6 text-center">
          <InformationCircleIcon className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-600">
            {error || 'Enter loan details to generate amortization schedule'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 rounded-lg p-2">
              <TableCellsIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary-900">
                Amortization Schedule
              </h2>
              <p className="text-sm text-secondary-600">
                {formatCurrency(loanAmount)} loan at {interestRate}% for {loanTerm} years
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : 'summary')}
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              {viewMode === 'summary' ? 'View Details' : 'View Summary'}
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors duration-200"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-primary-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{schedule.length}</div>
            <div className="text-sm text-secondary-600">Total Payments</div>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-secondary-900">{formatCurrency(totalPayments)}</div>
            <div className="text-sm text-secondary-600">Total Paid</div>
          </div>
          <div className="bg-accent-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent-600">{formatCurrency(totalInterest)}</div>
            <div className="text-sm text-secondary-600">Total Interest</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {((totalInterest / loanAmount) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-secondary-600">Interest/Principal</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors duration-200"
          >
            <ChartBarIcon className="w-4 h-4" />
            {showChart ? 'Hide Chart' : 'Show Chart'}
          </button>
        </div>

        {/* Chart Visualization */}
        {showChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Principal vs Interest Over Time
              </h3>
              <div className="space-y-2">
                {availableYears.slice(0, 10).map((year) => {
                  const data = yearlyData[year];
                  const principalPct = (data.totalPrincipal / (data.totalPrincipal + data.totalInterest)) * 100;
                  const interestPct = (data.totalInterest / (data.totalPrincipal + data.totalInterest)) * 100;
                  
                  return (
                    <div key={year} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium text-secondary-700">{year}</div>
                      <div className="flex-1 bg-white rounded-lg overflow-hidden border">
                        <div className="flex h-6">
                          <div
                            className="bg-red-400"
                            style={{ width: `${interestPct}%` }}
                            title={`Interest: ${formatCurrency(data.totalInterest)}`}
                          ></div>
                          <div
                            className="bg-blue-400"
                            style={{ width: `${principalPct}%` }}
                            title={`Principal: ${formatCurrency(data.totalPrincipal)}`}
                          ></div>
                        </div>
                      </div>
                      <div className="w-24 text-sm text-secondary-600 text-right">
                        {formatCurrency(data.totalPayments)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span className="text-secondary-600">Interest</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  <span className="text-secondary-600">Principal</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Schedule Content */}
        {viewMode === 'summary' ? (
          <>
            {/* Year Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Yearly Summary Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Interest
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {selectedYearData?.payments.slice(0, 12).map((entry, index) => (
                    <tr key={entry.paymentNumber} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                        {entry.paymentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 text-right">
                        {formatCurrency(entry.payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right font-medium">
                        {formatCurrency(entry.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                        {formatCurrency(entry.interest)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 text-right font-medium">
                        {formatCurrency(entry.remainingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Year Summary */}
            {selectedYearData && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="text-sm text-secondary-600">Year Total Payments</div>
                  <div className="text-lg font-bold text-primary-600">
                    {formatCurrency(selectedYearData.totalPayments)}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-secondary-600">Principal Paid</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(selectedYearData.totalPrincipal)}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-secondary-600">Interest Paid</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(selectedYearData.totalInterest)}
                  </div>
                </div>
                <div className="bg-secondary-50 rounded-lg p-4">
                  <div className="text-sm text-secondary-600">Ending Balance</div>
                  <div className="text-lg font-bold text-secondary-900">
                    {formatCurrency(selectedYearData.endingBalance)}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Detailed View - All Payments */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {schedule.slice(0, 100).map((entry, index) => (
                  <tr key={entry.paymentNumber} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                      {entry.paymentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 text-right">
                      {formatCurrency(entry.payment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right font-medium">
                      {formatCurrency(entry.principal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                      {formatCurrency(entry.interest)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 text-right font-medium">
                      {formatCurrency(entry.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {schedule.length > 100 && (
              <div className="p-4 text-center text-secondary-600 text-sm">
                Showing first 100 payments of {schedule.length} total payments.
                <br />
                <span className="font-medium">Download CSV</span> to view complete schedule.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AmortizationSchedule;