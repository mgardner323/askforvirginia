import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  ClockIcon,
  StarIcon,
  InformationCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface PreApprovalInputs {
  annualIncome: number;
  monthlyDebts: number;
  creditScore: number;
  downPayment: number;
  employmentType: 'W2' | 'self-employed' | '1099' | 'contract';
  employmentYears: number;
  assets: number;
  homePrice: number;
  loanType: 'conventional' | 'FHA' | 'VA' | 'jumbo';
}

interface PreApprovalResults {
  approvalLikelihood: number;
  estimatedRate: number;
  maxLoanAmount: number;
  requiredDownPayment: number;
  debtToIncomeRatio: number;
  loanToValueRatio: number;
  recommendations: string[];
  requirements: {
    item: string;
    status: 'met' | 'warning' | 'failed';
    description: string;
  }[];
  timeline: string;
}

interface MortgagePreApprovalEstimatorProps {
  initialInputs?: Partial<PreApprovalInputs>;
  className?: string;
}

const MortgagePreApprovalEstimator: React.FC<MortgagePreApprovalEstimatorProps> = ({
  initialInputs = {},
  className = '',
}) => {
  const [inputs, setInputs] = useState<PreApprovalInputs>({
    annualIncome: 120000,
    monthlyDebts: 800,
    creditScore: 740,
    downPayment: 100000,
    employmentType: 'W2',
    employmentYears: 3,
    assets: 150000,
    homePrice: 650000,
    loanType: 'conventional',
    ...initialInputs,
  });

  const [loading, setLoading] = useState(false);

  const results = useMemo((): PreApprovalResults => {
    return calculatePreApproval(inputs);
  }, [inputs]);

  const calculatePreApproval = (inputs: PreApprovalInputs): PreApprovalResults => {
    const monthlyIncome = inputs.annualIncome / 12;
    const loanAmount = inputs.homePrice - inputs.downPayment;
    const ltvRatio = (loanAmount / inputs.homePrice) * 100;
    const dtiRatio = ((inputs.monthlyDebts / monthlyIncome) * 100);

    // Base approval score
    let approvalScore = 50;

    // Credit score impact (30% weight)
    if (inputs.creditScore >= 760) approvalScore += 30;
    else if (inputs.creditScore >= 700) approvalScore += 25;
    else if (inputs.creditScore >= 660) approvalScore += 15;
    else if (inputs.creditScore >= 620) approvalScore += 5;
    else approvalScore -= 20;

    // DTI impact (25% weight)
    if (dtiRatio <= 28) approvalScore += 25;
    else if (dtiRatio <= 36) approvalScore += 15;
    else if (dtiRatio <= 43) approvalScore += 5;
    else approvalScore -= 15;

    // LTV impact (20% weight)
    if (ltvRatio <= 80) approvalScore += 20;
    else if (ltvRatio <= 90) approvalScore += 10;
    else if (ltvRatio <= 95) approvalScore += 5;
    else approvalScore -= 10;

    // Employment stability (15% weight)
    if (inputs.employmentType === 'W2' && inputs.employmentYears >= 2) approvalScore += 15;
    else if (inputs.employmentType === 'W2' && inputs.employmentYears >= 1) approvalScore += 10;
    else if (inputs.employmentType === 'self-employed' && inputs.employmentYears >= 2) approvalScore += 5;
    else approvalScore -= 10;

    // Assets impact (10% weight)
    const assetsToLoan = inputs.assets / loanAmount;
    if (assetsToLoan >= 0.3) approvalScore += 10;
    else if (assetsToLoan >= 0.1) approvalScore += 5;

    // Loan type adjustments
    if (inputs.loanType === 'FHA' && inputs.creditScore >= 580) approvalScore += 5;
    if (inputs.loanType === 'VA') approvalScore += 10;
    if (inputs.loanType === 'jumbo' && inputs.creditScore < 700) approvalScore -= 10;

    approvalScore = Math.min(Math.max(approvalScore, 0), 100);

    // Estimate interest rate
    let estimatedRate = 7.25; // Base rate
    if (inputs.creditScore >= 760) estimatedRate -= 0.5;
    else if (inputs.creditScore >= 700) estimatedRate -= 0.25;
    else if (inputs.creditScore < 660) estimatedRate += 0.5;

    if (inputs.loanType === 'FHA') estimatedRate -= 0.1;
    if (inputs.loanType === 'jumbo') estimatedRate += 0.2;

    // Calculate max loan amount
    const maxDTI = inputs.loanType === 'FHA' ? 0.43 : 0.36;
    const maxHousingPayment = (monthlyIncome * maxDTI) - inputs.monthlyDebts;
    const maxLoanAmount = calculateMaxLoanFromPayment(maxHousingPayment, estimatedRate, 30);

    // Required down payment
    let minDownPaymentPct = 0.2; // Conventional
    if (inputs.loanType === 'FHA') minDownPaymentPct = 0.035;
    if (inputs.loanType === 'VA') minDownPaymentPct = 0;
    if (inputs.loanType === 'jumbo') minDownPaymentPct = 0.2;

    const requiredDownPayment = inputs.homePrice * minDownPaymentPct;

    // Generate requirements
    const requirements = generateRequirements(inputs, dtiRatio, ltvRatio);

    // Generate recommendations
    const recommendations = generateRecommendations(inputs, approvalScore, dtiRatio, ltvRatio);

    // Timeline estimate
    const timeline = getApprovalTimeline(inputs.loanType, approvalScore);

    return {
      approvalLikelihood: approvalScore,
      estimatedRate,
      maxLoanAmount: Math.max(0, maxLoanAmount),
      requiredDownPayment,
      debtToIncomeRatio: dtiRatio,
      loanToValueRatio: ltvRatio,
      recommendations,
      requirements,
      timeline,
    };
  };

  const calculateMaxLoanFromPayment = (payment: number, rate: number, years: number): number => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    return payment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
  };

  const generateRequirements = (inputs: PreApprovalInputs, dti: number, ltv: number) => {
    const requirements = [];

    // Credit Score
    const minCredit = inputs.loanType === 'FHA' ? 580 : inputs.loanType === 'VA' ? 620 : 620;
    requirements.push({
      item: 'Credit Score',
      status: inputs.creditScore >= minCredit ? 'met' as const : 'failed' as const,
      description: `Minimum ${minCredit} required. Current: ${inputs.creditScore}`,
    });

    // DTI Ratio
    const maxDTI = inputs.loanType === 'FHA' ? 43 : 36;
    requirements.push({
      item: 'Debt-to-Income Ratio',
      status: dti <= maxDTI ? 'met' as const : dti <= maxDTI + 7 ? 'warning' as const : 'failed' as const,
      description: `Maximum ${maxDTI}% required. Current: ${dti.toFixed(1)}%`,
    });

    // Down Payment
    let minDP = inputs.loanType === 'FHA' ? 3.5 : inputs.loanType === 'VA' ? 0 : 20;
    const currentDP = (inputs.downPayment / inputs.homePrice) * 100;
    requirements.push({
      item: 'Down Payment',
      status: currentDP >= minDP ? 'met' as const : 'warning' as const,
      description: `Minimum ${minDP}% required. Current: ${currentDP.toFixed(1)}%`,
    });

    // Employment History
    const minEmployment = inputs.employmentType === 'self-employed' ? 2 : 1;
    requirements.push({
      item: 'Employment History',
      status: inputs.employmentYears >= minEmployment ? 'met' as const : 'warning' as const,
      description: `Minimum ${minEmployment} year(s) required. Current: ${inputs.employmentYears} years`,
    });

    // Assets
    const monthsReserves = (inputs.assets / (inputs.homePrice * 0.008)); // Rough monthly payment estimate
    requirements.push({
      item: 'Asset Reserves',
      status: monthsReserves >= 2 ? 'met' as const : monthsReserves >= 1 ? 'warning' as const : 'failed' as const,
      description: `Recommended 2+ months reserves. Current: ~${monthsReserves.toFixed(1)} months`,
    });

    return requirements;
  };

  const generateRecommendations = (inputs: PreApprovalInputs, score: number, dti: number, ltv: number): string[] => {
    const recommendations = [];

    if (score < 70) {
      if (inputs.creditScore < 700) {
        recommendations.push('Focus on improving your credit score before applying');
      }
      if (dti > 36) {
        recommendations.push('Consider paying down debts to improve your debt-to-income ratio');
      }
      if (ltv > 90) {
        recommendations.push('Increase your down payment to improve loan-to-value ratio');
      }
    }

    if (inputs.employmentType === 'self-employed' && inputs.employmentYears < 2) {
      recommendations.push('Build more employment history documentation for stronger application');
    }

    if (inputs.loanType === 'conventional' && inputs.creditScore < 620) {
      recommendations.push('Consider FHA loan for more flexible credit requirements');
    }

    if (ltv > 80 && inputs.loanType === 'conventional') {
      recommendations.push('Consider 20% down payment to avoid PMI');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your profile looks strong for mortgage pre-approval');
      recommendations.push('Consider getting pre-approved before house hunting');
    }

    return recommendations;
  };

  const getApprovalTimeline = (loanType: string, score: number): string => {
    if (score >= 80) return '1-3 business days';
    if (score >= 60) return '3-7 business days';
    return '1-2 weeks (may require additional documentation)';
  };

  const handleInputChange = (field: keyof PreApprovalInputs, value: any) => {
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

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
    if (score >= 60) return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
    return <XCircleIcon className="w-6 h-6 text-red-600" />;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'met') return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    if (status === 'warning') return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
    return <XCircleIcon className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <DocumentCheckIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Mortgage Pre-Approval Estimator
          </h2>
        </div>
        <p className="text-secondary-600">
          Estimate your pre-approval likelihood and get personalized recommendations
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Personal Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Annual Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.annualIncome}
                      onChange={(e) => handleInputChange('annualIncome', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Monthly Debts
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.monthlyDebts}
                      onChange={(e) => handleInputChange('monthlyDebts', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Credit Score
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={inputs.creditScore}
                    onChange={(e) => handleInputChange('creditScore', parseInt(e.target.value) || 700)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Available Assets
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.assets}
                      onChange={(e) => handleInputChange('assets', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <p className="text-xs text-secondary-600 mt-1">
                    Cash, savings, investments available for purchase
                  </p>
                </div>
              </div>
            </div>

            {/* Employment */}
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Employment Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={inputs.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="W2">W2 Employee</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="1099">1099 Contractor</option>
                    <option value="contract">Contract Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Years at Current Job
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={inputs.employmentYears}
                    onChange={(e) => handleInputChange('employmentYears', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-accent-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Loan Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Target Home Price
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
                  <p className="text-xs text-secondary-600 mt-1">
                    {((inputs.downPayment / inputs.homePrice) * 100 || 0).toFixed(1)}% of home price
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Loan Type
                  </label>
                  <select
                    value={inputs.loanType}
                    onChange={(e) => handleInputChange('loanType', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="conventional">Conventional</option>
                    <option value="FHA">FHA</option>
                    <option value="VA">VA</option>
                    <option value="jumbo">Jumbo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Approval Likelihood */}
              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-secondary-900">
                    Pre-Approval Likelihood
                  </h3>
                  {getScoreIcon(results.approvalLikelihood)}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-secondary-900">
                    {results.approvalLikelihood}%
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-secondary-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          results.approvalLikelihood >= 80 ? 'bg-green-500' :
                          results.approvalLikelihood >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${results.approvalLikelihood}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-secondary-600 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-primary-600">
                      {results.estimatedRate.toFixed(2)}%
                    </div>
                    <div className="text-xs text-secondary-600">Estimated Rate</div>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-secondary-900">
                      {formatCurrency(results.maxLoanAmount)}
                    </div>
                    <div className="text-xs text-secondary-600">Max Loan Amount</div>
                  </div>
                  <div className="bg-accent-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-accent-600">
                      {results.timeline}
                    </div>
                    <div className="text-xs text-secondary-600">Expected Timeline</div>
                  </div>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-primary-600" />
                  Pre-Approval Requirements
                </h3>
                
                <div className="space-y-3">
                  {results.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                      {getStatusIcon(req.status)}
                      <div className="flex-1">
                        <div className="font-medium text-secondary-900">{req.item}</div>
                        <div className="text-sm text-secondary-600">{req.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-bold text-secondary-900 mb-3">Debt-to-Income Ratio</h4>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {results.debtToIncomeRatio.toFixed(1)}%
                  </div>
                  <div className="text-sm text-secondary-600">
                    {results.debtToIncomeRatio <= 36 ? 'Excellent' : 
                     results.debtToIncomeRatio <= 43 ? 'Good' : 'High'}
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(results.debtToIncomeRatio, 50)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-bold text-secondary-900 mb-3">Loan-to-Value Ratio</h4>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {results.loanToValueRatio.toFixed(1)}%
                  </div>
                  <div className="text-sm text-secondary-600">
                    {results.loanToValueRatio <= 80 ? 'Excellent' : 
                     results.loanToValueRatio <= 90 ? 'Good' : 'High'}
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(results.loanToValueRatio, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {results.recommendations.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span className="text-secondary-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-primary-600" />
                  Next Steps
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Gather required documents (pay stubs, tax returns, bank statements)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Shop with multiple lenders for best rates and terms</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Consider getting pre-approved before house hunting</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Work with a real estate agent familiar with your price range</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgagePreApprovalEstimator;