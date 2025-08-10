import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import MortgagePreApprovalEstimator from '../components/mortgage/MortgagePreApprovalEstimator';
import Link from 'next/link';
import { 
  DocumentCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const PreApprovalEstimatorPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Mortgage Pre-Approval Estimator - Know Your Home Buying Power | Virginia Hodges Real Estate</title>
        <meta
          name="description"
          content="Estimate your mortgage pre-approval likelihood and buying power in Southern California. Get personalized recommendations and requirements checklist before applying."
        />
        <meta name="keywords" content="mortgage pre-approval, home loan approval, Southern California mortgage, home buying power, mortgage qualification" />
        <link rel="canonical" href="https://askforvirginia.com/pre-approval-estimator" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Mortgage Pre-Approval Estimator - Know Your Home Buying Power" />
        <meta property="og:description" content="Estimate your mortgage pre-approval likelihood and buying power in Southern California." />
        <meta property="og:url" content="https://askforvirginia.com/pre-approval-estimator" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://askforvirginia.com/images/pre-approval-og.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mortgage Pre-Approval Estimator - Virginia Hodges Real Estate" />
        <meta name="twitter:description" content="Estimate your mortgage pre-approval likelihood and buying power in Southern California." />
        <meta name="twitter:image" content="https://askforvirginia.com/images/pre-approval-og.jpg" />
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Mortgage Pre-Approval Estimator",
              "description": "Estimate your mortgage pre-approval likelihood and home buying power",
              "url": "https://askforvirginia.com/pre-approval-estimator",
              "applicationCategory": "FinanceApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "provider": {
                "@type": "RealEstateAgent",
                "name": "Virginia Hodges",
                "url": "https://askforvirginia.com"
              }
            })
          }}
        />
      </Head>

      <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <DocumentCheckIcon className="w-16 h-16" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Pre-Approval Estimator
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-green-100">
                Know your home buying power and approval likelihood before you apply
              </p>
              <div className="flex justify-center">
                <a 
                  href="#estimator"
                  className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200 inline-flex items-center gap-2"
                >
                  Check My Approval Odds
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Why Pre-Approval Matters */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Why Pre-Approval Matters
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                In Southern California's competitive market, pre-approval gives you a critical advantage
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-green-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Competitive Edge</h3>
                <p className="text-secondary-600">
                  Sellers take your offers seriously when you have pre-approval. Often required in multiple-offer situations.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-blue-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <ChartBarIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Know Your Budget</h3>
                <p className="text-secondary-600">
                  Understand exactly how much home you can afford before you start shopping and fall in love.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-primary-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <StarIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Faster Closing</h3>
                <p className="text-secondary-600">
                  Much of the loan processing is already done, leading to quicker closings and fewer delays.
                </p>
              </div>
            </div>

            {/* Market Stats */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-8 border border-primary-200">
              <h3 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
                Southern California Market Reality
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">85%</div>
                  <div className="text-secondary-600">Of sellers prefer pre-approved buyers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">3-7</div>
                  <div className="text-secondary-600">Average days on market for good homes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">72%</div>
                  <div className="text-secondary-600">Of home purchases involve multiple offers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Approval vs Pre-Qualification */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Pre-Approval vs Pre-Qualification
              </h2>
              <p className="text-xl text-secondary-600">
                Understanding the difference can save you time and disappointment
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 mr-3" />
                  <h3 className="text-2xl font-bold text-yellow-800">Pre-Qualification</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-1">•</span>
                    <span className="text-yellow-700">Based on basic information you provide</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-1">•</span>
                    <span className="text-yellow-700">No verification of income, assets, or credit</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-1">•</span>
                    <span className="text-yellow-700">Can be completed in minutes online</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-1">•</span>
                    <span className="text-yellow-700">Not a commitment from the lender</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-1">•</span>
                    <span className="text-yellow-700">Limited value in competitive markets</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <div className="flex items-center mb-6">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-2xl font-bold text-green-800">Pre-Approval</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-green-700">Requires full financial documentation</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-green-700">Lender verifies income, assets, and credit</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-green-700">Takes 1-3 business days to complete</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-green-700">Conditional commitment from lender</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span className="text-green-700">Gives you serious buyer credibility</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estimator Section */}
        <div id="estimator" className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Estimate Your Pre-Approval Likelihood
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Get a personalized assessment of your approval odds and recommendations for improvement
              </p>
            </div>

            <MortgagePreApprovalEstimator />
          </div>
        </div>

        {/* Requirements & Documentation */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  What You'll Need for Pre-Approval
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3 flex items-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-green-600 mr-2" />
                      Income Documentation
                    </h3>
                    <ul className="space-y-2 text-secondary-600">
                      <li>• Pay stubs (last 2 months)</li>
                      <li>• Tax returns (last 2 years)</li>
                      <li>• W-2 forms (last 2 years)</li>
                      <li>• Bank statements (last 2 months)</li>
                      <li>• For self-employed: Profit & loss statements</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3 flex items-center">
                      <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
                      Credit & Debt Information
                    </h3>
                    <ul className="space-y-2 text-secondary-600">
                      <li>• Credit score (can be pulled by lender)</li>
                      <li>• List of all monthly debt payments</li>
                      <li>• Credit card statements</li>
                      <li>• Auto loan information</li>
                      <li>• Student loan documentation</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3 flex items-center">
                      <DocumentCheckIcon className="w-5 h-5 text-primary-600 mr-2" />
                      Assets & Down Payment
                    </h3>
                    <ul className="space-y-2 text-secondary-600">
                      <li>• Savings account statements</li>
                      <li>• Checking account statements</li>
                      <li>• Investment account statements</li>
                      <li>• Retirement account balances</li>
                      <li>• Gift letter if using gift funds</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  Factors That Affect Approval
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-3">Strong Approval Factors</h3>
                    <ul className="space-y-2 text-green-700">
                      <li>• Credit score 740+ (excellent rates)</li>
                      <li>• Debt-to-income ratio under 36%</li>
                      <li>• 20%+ down payment (avoids PMI)</li>
                      <li>• 2+ years steady employment</li>
                      <li>• 3-6 months payment reserves</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <h3 className="text-xl font-bold text-yellow-800 mb-3">Potential Challenges</h3>
                    <ul className="space-y-2 text-yellow-700">
                      <li>• Credit score under 620</li>
                      <li>• Debt-to-income ratio over 43%</li>
                      <li>• Less than 3.5% down payment</li>
                      <li>• Self-employed income</li>
                      <li>• Recent job changes</li>
                      <li>• Limited credit history</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-3">Improvement Tips</h3>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Pay down credit card balances</li>
                      <li>• Don't apply for new credit</li>
                      <li>• Save for a larger down payment</li>
                      <li>• Document all income sources</li>
                      <li>• Consider a co-borrower</li>
                      <li>• Look into first-time buyer programs</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6 border border-primary-200">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-primary-800 mb-2">Virginia's Pro Tip</h3>
                      <p className="text-primary-700 text-sm">
                        "I recommend getting pre-approved with 2-3 lenders to compare terms and find the best deal. 
                        Multiple credit inquiries within 14-45 days for the same purpose count as one inquiry on your credit score."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Ready for Pre-Approval?
              </h2>
              <p className="text-xl text-secondary-600">
                Here's your roadmap to getting pre-approved and starting your home search
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg p-8 text-center shadow-soft relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4 mt-4">
                  Gather Documents
                </h3>
                <p className="text-secondary-600">
                  Collect all required financial documentation and organize your information.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center shadow-soft relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4 mt-4">
                  Shop Lenders
                </h3>
                <p className="text-secondary-600">
                  Compare rates and terms from multiple lenders to find the best deal.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center shadow-soft relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4 mt-4">
                  Start Shopping
                </h3>
                <p className="text-secondary-600">
                  Begin your home search with confidence knowing your buying power.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/contact"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 inline-flex items-center gap-2"
              >
                Get Expert Guidance
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <p className="text-secondary-600 mt-4">
                Virginia can recommend trusted local lenders and guide you through the process
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Additional Mortgage Tools
              </h2>
              <p className="text-xl text-secondary-600">
                Complete your mortgage analysis with our comprehensive calculator suite
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link href="/affordability-calculator" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-primary-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Affordability Calculator
                  </h3>
                  <p className="text-secondary-600">
                    Determine exactly how much home you can afford based on your financial situation.
                  </p>
                </div>
              </Link>

              <Link href="/mortgage-calculator" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Mortgage Calculator
                  </h3>
                  <p className="text-secondary-600">
                    Calculate monthly payments, total interest, and get an amortization schedule.
                  </p>
                </div>
              </Link>

              <Link href="/rent-vs-buy" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-green-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <StarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Rent vs Buy Analysis
                  </h3>
                  <p className="text-secondary-600">
                    Comprehensive analysis to help you decide between renting and buying.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PreApprovalEstimatorPage;