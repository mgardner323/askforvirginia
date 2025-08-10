import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  MapPinIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface PropertyAffordabilityInputs {
  annualIncome: number;
  monthlyDebts: number;
  downPayment: number;
  creditScore: number;
  employmentType: 'W2' | 'self-employed' | '1099' | 'retired';
  targetCounty: string;
  firstTimeBuyer: boolean;
  includeHOA: boolean;
  targetPropertyType: 'single-family' | 'condo' | 'townhouse';
}

interface AffordabilityAnalysis {
  maxHomePrice: number;
  comfortableHomePrice: number;
  maxMonthlyPayment: number;
  comfortableMonthlyPayment: number;
  requiredDownPayment: number;
  totalMonthlyHousing: number;
  debtToIncomeRatio: number;
  housingToIncomeRatio: number;
  countyData: {
    medianHomePrice: number;
    propertyTaxRate: number;
    insuranceRate: number;
    hoaAverage: number;
  };
  affordabilityScore: number;
  recommendations: string[];
  warnings: string[];
}

interface PropertyAffordabilityAnalysisProps {
  initialValues?: Partial<PropertyAffordabilityInputs>;
  onAnalysisComplete?: (analysis: AffordabilityAnalysis) => void;
  className?: string;
}

const PropertyAffordabilityAnalysis: React.FC<PropertyAffordabilityAnalysisProps> = ({
  initialValues = {},
  onAnalysisComplete,
  className = '',
}) => {
  const [inputs, setInputs] = useState<PropertyAffordabilityInputs>({
    annualIncome: 120000,
    monthlyDebts: 800,
    downPayment: 100000,
    creditScore: 740,
    employmentType: 'W2',
    targetCounty: 'riverside',
    firstTimeBuyer: false,
    includeHOA: true,
    targetPropertyType: 'single-family',
    ...initialValues,
  });

  const [analysis, setAnalysis] = useState<AffordabilityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countyOptions = [
    { value: 'riverside', name: 'Riverside County', median: 650000, taxRate: 0.0121, insurance: 0.0045, hoa: 150 },
    { value: 'san-bernardino', name: 'San Bernardino County', median: 550000, taxRate: 0.0118, insurance: 0.0048, hoa: 120 },
    { value: 'orange', name: 'Orange County', median: 1200000, taxRate: 0.0073, insurance: 0.0042, hoa: 300 },
    { value: 'los-angeles', name: 'Los Angeles County', median: 950000, taxRate: 0.0072, insurance: 0.0045, hoa: 280 },
    { value: 'ventura', name: 'Ventura County', median: 850000, taxRate: 0.0074, insurance: 0.0047, hoa: 200 },
  ];

  useEffect(() => {
    if (inputs.annualIncome > 0) {
      calculateAffordability();
    }
  }, [inputs]);

  const calculateAffordability = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get county data
      const county = countyOptions.find(c => c.value === inputs.targetCounty) || countyOptions[0];
      
      // Calculate basic affordability
      const monthlyIncome = inputs.annualIncome / 12;
      const maxHousingPayment = monthlyIncome * getMaxHousingRatio();
      const comfortableHousingPayment = monthlyIncome * 0.25; // More conservative
      
      // Account for existing debts
      const availableForHousing = maxHousingPayment - inputs.monthlyDebts;
      const comfortableAvailableForHousing = comfortableHousingPayment - inputs.monthlyDebts;

      // Calculate property costs
      const propertyTaxMultiplier = county.taxRate / 12;
      const insuranceMultiplier = county.insurance / 12;
      const hoaFees = inputs.includeHOA ? county.hoa : 0;

      // Interest rate based on credit score
      const interestRate = getInterestRateByCredit(inputs.creditScore);
      const monthlyRate = interestRate / 100 / 12;

      // Calculate max home price (working backwards from payment)
      const maxHomePrice = calculateMaxHomePriceFromPayment(
        availableForHousing - hoaFees,
        interestRate,
        propertyTaxMultiplier,
        insuranceMultiplier,
        inputs.downPayment
      );

      const comfortableHomePrice = calculateMaxHomePriceFromPayment(
        comfortableAvailableForHousing - hoaFees,
        interestRate,
        propertyTaxMultiplier,
        insuranceMultiplier,
        inputs.downPayment
      );

      // Calculate affordability score
      const affordabilityScore = calculateAffordabilityScore(maxHomePrice, county.median, inputs);

      // Generate recommendations and warnings
      const { recommendations, warnings } = generateRecommendationsAndWarnings(
        maxHomePrice,
        comfortableHomePrice,
        county,
        inputs
      );

      const calculatedAnalysis: AffordabilityAnalysis = {
        maxHomePrice: Math.max(0, maxHomePrice),
        comfortableHomePrice: Math.max(0, comfortableHomePrice),
        maxMonthlyPayment: availableForHousing,
        comfortableMonthlyPayment: comfortableAvailableForHousing,
        requiredDownPayment: Math.max(maxHomePrice * 0.03, 10000), // Minimum 3% or $10K
        totalMonthlyHousing: availableForHousing,
        debtToIncomeRatio: ((inputs.monthlyDebts + availableForHousing) / monthlyIncome) * 100,
        housingToIncomeRatio: (availableForHousing / monthlyIncome) * 100,
        countyData: {
          medianHomePrice: county.median,
          propertyTaxRate: county.taxRate * 100,
          insuranceRate: county.insurance * 100,
          hoaAverage: county.hoa,
        },
        affordabilityScore,
        recommendations,
        warnings,
      };

      setAnalysis(calculatedAnalysis);

      if (onAnalysisComplete) {
        onAnalysisComplete(calculatedAnalysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      console.error('Affordability analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMaxHousingRatio = (): number => {
    // Adjust ratio based on employment type and credit score
    let baseRatio = 0.28; // Standard 28% rule
    
    if (inputs.employmentType === 'self-employed') baseRatio -= 0.03;
    if (inputs.creditScore >= 760) baseRatio += 0.03;
    else if (inputs.creditScore < 640) baseRatio -= 0.05;
    
    return Math.min(Math.max(baseRatio, 0.20), 0.35);
  };

  const getInterestRateByCredit = (creditScore: number): number => {
    if (creditScore >= 760) return 6.75;
    if (creditScore >= 700) return 7.00;
    if (creditScore >= 660) return 7.25;
    if (creditScore >= 620) return 7.75;
    return 8.25;
  };

  const calculateMaxHomePriceFromPayment = (
    maxPayment: number,
    interestRate: number,
    taxRate: number,
    insuranceRate: number,
    downPayment: number
  ): number => {
    const monthlyRate = interestRate / 100 / 12;
    const loanTermMonths = 30 * 12;
    
    // Iterative approach to find max home price
    let homePrice = 100000;
    const step = 10000;
    let bestPrice = 0;

    for (let price = 100000; price <= 2000000; price += step) {
      const loanAmount = price - downPayment;
      if (loanAmount <= 0) continue;

      const piPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
                       (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
      const taxPayment = price * taxRate;
      const insurancePayment = price * insuranceRate;
      const totalPayment = piPayment + taxPayment + insurancePayment;

      if (totalPayment <= maxPayment) {
        bestPrice = price;
      } else {
        break;
      }
    }

    return bestPrice;
  };

  const calculateAffordabilityScore = (
    maxPrice: number,
    medianPrice: number,
    inputs: PropertyAffordabilityInputs
  ): number => {
    let score = 50; // Base score

    // Price vs median
    const priceRatio = maxPrice / medianPrice;
    if (priceRatio >= 1.2) score += 25;
    else if (priceRatio >= 1.0) score += 15;
    else if (priceRatio >= 0.8) score += 5;
    else score -= 10;

    // Credit score impact
    if (inputs.creditScore >= 760) score += 15;
    else if (inputs.creditScore >= 700) score += 10;
    else if (inputs.creditScore < 640) score -= 15;

    // Down payment impact
    const downPaymentRatio = inputs.downPayment / maxPrice;
    if (downPaymentRatio >= 0.2) score += 10;
    else if (downPaymentRatio >= 0.1) score += 5;

    // Employment stability
    if (inputs.employmentType === 'W2') score += 5;
    else if (inputs.employmentType === 'self-employed') score -= 5;

    return Math.min(Math.max(score, 0), 100);
  };

  const generateRecommendationsAndWarnings = (
    maxPrice: number,
    comfortablePrice: number,
    county: any,
    inputs: PropertyAffordabilityInputs
  ) => {
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Price recommendations
    if (maxPrice < county.median * 0.8) {
      recommendations.push('Consider areas with lower median home prices or increase your income/down payment');
    }
    
    if (comfortablePrice < maxPrice * 0.8) {
      recommendations.push('Your comfortable price range is significantly lower than maximum - consider the lower amount for better financial security');
    }

    // Credit score recommendations
    if (inputs.creditScore < 700) {
      recommendations.push('Improving your credit score could lower your interest rate and increase buying power');
    }

    // Down payment recommendations
    const downPaymentRatio = inputs.downPayment / maxPrice;
    if (downPaymentRatio < 0.2) {
      recommendations.push('Consider saving for a 20% down payment to avoid PMI and reduce monthly payments');
    }

    // Employment warnings
    if (inputs.employmentType === 'self-employed') {
      warnings.push('Self-employed borrowers may face stricter lending requirements and need additional documentation');
    }

    // Market warnings
    if (maxPrice > county.median * 1.2) {
      warnings.push('Your budget exceeds the local median - ensure you\'re comfortable with higher property taxes and costs');
    }

    return { recommendations, warnings };
  };

  const handleInputChange = (field: keyof PropertyAffordabilityInputs, value: any) => {
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
    if (score >= 80) return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
    return <XCircleIcon className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-secondary-200 ${className}`}>
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-100 rounded-lg p-2">
            <HomeIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Property Affordability Analysis
          </h2>
        </div>
        <p className="text-secondary-600">
          Advanced affordability analysis with location-specific factors and personalized insights
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
            {/* Personal Information */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Personal Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Annual Gross Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.annualIncome}
                      onChange={(e) => handleInputChange('annualIncome', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Monthly Debt Payments
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">$</span>
                    <input
                      type="number"
                      value={inputs.monthlyDebts}
                      onChange={(e) => handleInputChange('monthlyDebts', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <p className="text-xs text-secondary-600 mt-1">
                    Include car loans, credit cards, student loans, etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Available Down Payment
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
                    Credit Score
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={inputs.creditScore}
                    onChange={(e) => handleInputChange('creditScore', parseInt(e.target.value) || 700)}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={inputs.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="W2">W2 Employee</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="1099">1099 Contractor</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Property Preferences */}
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Property Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Target County
                  </label>
                  <select
                    value={inputs.targetCounty}
                    onChange={(e) => handleInputChange('targetCounty', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {countyOptions.map(county => (
                      <option key={county.value} value={county.value}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Property Type
                  </label>
                  <select
                    value={inputs.targetPropertyType}
                    onChange={(e) => handleInputChange('targetPropertyType', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="single-family">Single Family Home</option>
                    <option value="condo">Condominium</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={inputs.firstTimeBuyer}
                      onChange={(e) => handleInputChange('firstTimeBuyer', e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700">First-time home buyer</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={inputs.includeHOA}
                      onChange={(e) => handleInputChange('includeHOA', e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Include average HOA fees</span>
                  </label>
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
            ) : analysis ? (
              <>
                {/* Affordability Score */}
                <div className="bg-white rounded-lg border border-secondary-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-secondary-900">
                      Affordability Score
                    </h3>
                    {getScoreIcon(analysis.affordabilityScore)}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-secondary-900">
                      {analysis.affordabilityScore}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-secondary-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            analysis.affordabilityScore >= 80 ? 'bg-green-500' :
                            analysis.affordabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${analysis.affordabilityScore}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-secondary-600 mt-1">
                        <span>Poor</span>
                        <span>Good</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm mt-3 font-medium ${getScoreColor(analysis.affordabilityScore)}`}>
                    {analysis.affordabilityScore >= 80 ? 'Excellent affordability in this market' :
                     analysis.affordabilityScore >= 60 ? 'Good affordability with some considerations' :
                     'Limited affordability - consider adjustments'}
                  </p>
                </div>

                {/* Price Ranges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary-50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
                      <h4 className="font-bold text-secondary-900">Maximum Price</h4>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {formatCurrency(analysis.maxHomePrice)}
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">
                      Based on 28% housing ratio
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <StarIcon className="w-5 h-5 text-green-600" />
                      <h4 className="font-bold text-secondary-900">Comfortable Price</h4>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(analysis.comfortableHomePrice)}
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">
                      Recommended for financial security
                    </p>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="bg-secondary-50 rounded-lg p-6">
                  <h4 className="font-bold text-secondary-900 mb-4">Monthly Housing Budget</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Maximum Monthly Payment:</span>
                      <span className="font-semibold">{formatCurrency(analysis.maxMonthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Comfortable Monthly Payment:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(analysis.comfortableMonthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Debt-to-Income Ratio:</span>
                      <span className={`font-semibold ${
                        analysis.debtToIncomeRatio <= 36 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysis.debtToIncomeRatio.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* County Market Data */}
                <div className="bg-accent-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPinIcon className="w-5 h-5 text-accent-600" />
                    <h4 className="font-bold text-secondary-900">Local Market Data</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Median Home Price:</span>
                      <span className="font-semibold">{formatCurrency(analysis.countyData.medianHomePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Property Tax Rate:</span>
                      <span className="font-semibold">{analysis.countyData.propertyTaxRate.toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Average Insurance Rate:</span>
                      <span className="font-semibold">{analysis.countyData.insuranceRate.toFixed(3)}%</span>
                    </div>
                    {inputs.includeHOA && (
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Average HOA Fees:</span>
                        <span className="font-semibold">{formatCurrency(analysis.countyData.hoaAverage)}/mo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-bold text-secondary-900 mb-3 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-secondary-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {analysis.warnings.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h4 className="font-bold text-secondary-900 mb-3 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                      Important Considerations
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {analysis.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">⚠</span>
                          <span className="text-secondary-700">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-secondary-500">
                <p>Enter your information to see affordability analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAffordabilityAnalysis;