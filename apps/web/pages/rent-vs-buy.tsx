import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import RentVsBuyComparison from '../components/mortgage/RentVsBuyComparison';
import Link from 'next/link';
import { 
  ScaleIcon,
  HomeIcon,
  KeyIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';

const RentVsBuyPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Rent vs Buy Calculator - Should You Rent or Buy in Southern California? | Virginia Hodges Real Estate</title>
        <meta
          name="description"
          content="Calculate whether renting or buying makes more financial sense in Southern California. Comprehensive analysis including opportunity costs, tax benefits, and break-even points."
        />
        <meta name="keywords" content="rent vs buy calculator, Southern California real estate, home buying decision, rental analysis, property investment" />
        <link rel="canonical" href="https://askforvirginia.com/rent-vs-buy" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Rent vs Buy Calculator - Should You Rent or Buy in Southern California?" />
        <meta property="og:description" content="Calculate whether renting or buying makes more financial sense in Southern California." />
        <meta property="og:url" content="https://askforvirginia.com/rent-vs-buy" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://askforvirginia.com/images/rent-vs-buy-og.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rent vs Buy Calculator - Virginia Hodges Real Estate" />
        <meta name="twitter:description" content="Calculate whether renting or buying makes more financial sense in Southern California." />
        <meta name="twitter:image" content="https://askforvirginia.com/images/rent-vs-buy-og.jpg" />
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Rent vs Buy Calculator",
              "description": "Calculate whether renting or buying makes more financial sense for your situation",
              "url": "https://askforvirginia.com/rent-vs-buy",
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <ScaleIcon className="w-16 h-16" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Rent vs Buy Calculator
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
                Make an informed decision with comprehensive financial analysis for Southern California
              </p>
              <div className="flex justify-center">
                <a 
                  href="#calculator"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 inline-flex items-center gap-2"
                >
                  Start Analysis
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Decision Framework */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                The Big Question: Rent or Buy?
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                In Southern California's unique market, the answer isn't always obvious
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 border border-green-200">
                <div className="flex items-center mb-6">
                  <div className="bg-green-200 rounded-lg p-3 mr-4">
                    <HomeIcon className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800">Consider Buying If:</h3>
                </div>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You plan to stay in the area 5+ years
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Your rent is close to a mortgage payment
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You have stable income and emergency savings
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You want to build equity and get tax benefits
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Home appreciation outpaces rent increases
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-200 rounded-lg p-3 mr-4">
                    <KeyIcon className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-800">Consider Renting If:</h3>
                </div>
                <ul className="space-y-3 text-blue-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You might move within 3-5 years
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You can invest the down payment for higher returns
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    You want flexibility and no maintenance costs
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Home prices are significantly overvalued
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Your income is variable or uncertain
                  </li>
                </ul>
              </div>
            </div>

            {/* Market Context */}
            <div className="bg-white rounded-lg p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
                Southern California Market Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">1:24</div>
                  <div className="text-secondary-600">Average price-to-rent ratio</div>
                  <div className="text-sm text-secondary-500 mt-1">Buying may be favorable when &lt; 1:20</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">3.5%</div>
                  <div className="text-secondary-600">Historical home appreciation</div>
                  <div className="text-sm text-secondary-500 mt-1">Long-term average in SoCal</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">$650k</div>
                  <div className="text-secondary-600">Median home price</div>
                  <div className="text-sm text-secondary-500 mt-1">Riverside & San Bernardino counties</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculator Section */}
        <div id="calculator" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Comprehensive Rent vs Buy Analysis
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Get personalized analysis with opportunity costs, tax benefits, and break-even calculations
              </p>
            </div>

            <RentVsBuyComparison />
          </div>
        </div>

        {/* Key Factors Section */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  Key Financial Factors
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Opportunity Cost</h3>
                    <p className="text-secondary-600 mb-3">
                      What could you earn by investing your down payment instead of buying?
                    </p>
                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                      <p className="text-blue-700 text-sm">
                        If you can earn 7%+ returns in the stock market, renting might make more financial sense, especially short-term.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Tax Benefits</h3>
                    <p className="text-secondary-600 mb-3">
                      Homeowners can deduct mortgage interest and property taxes up to certain limits.
                    </p>
                    <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                      <p className="text-green-700 text-sm">
                        For many Southern California homeowners, tax savings can be $5,000-$15,000+ annually.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Transaction Costs</h3>
                    <p className="text-secondary-600 mb-3">
                      Buying and selling homes involves significant costs that impact your break-even timeline.
                    </p>
                    <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                      <p className="text-yellow-700 text-sm">
                        Typical costs: 2-3% to buy, 6-8% to sell. On a $650k home, that's $52k-$70k total.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  Beyond the Numbers
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Lifestyle Considerations</h3>
                    <ul className="space-y-2 text-secondary-600">
                      <li>• <strong>Stability:</strong> Buying provides housing security and predictable payments</li>
                      <li>• <strong>Flexibility:</strong> Renting allows easier relocation for career opportunities</li>
                      <li>• <strong>Control:</strong> Homeowners can renovate and customize their space</li>
                      <li>• <strong>Maintenance:</strong> Renters aren't responsible for major repairs</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Market Timing</h3>
                    <ul className="space-y-2 text-secondary-600">
                      <li>• <strong>Interest rates:</strong> Higher rates favor renting in the short term</li>
                      <li>• <strong>Price cycles:</strong> Markets go through periods of appreciation and correction</li>
                      <li>• <strong>Rental market:</strong> Tight rental markets can make buying more attractive</li>
                      <li>• <strong>Future outlook:</strong> Consider where you see yourself in 5-10 years</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6 border border-primary-200">
                    <div className="flex items-start">
                      <InformationCircleIcon className="w-6 h-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-primary-800 mb-2">Virginia's Expert Insight</h3>
                        <p className="text-primary-700 text-sm">
                          "In my 15+ years serving Southern California, I've seen that the 'right' choice varies greatly by individual situation. 
                          Use the calculator as a starting point, but consider your personal goals, risk tolerance, and life plans. 
                          I'm here to help you think through all the factors."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Steps */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Ready to Make Your Decision?
              </h2>
              <p className="text-xl text-secondary-600">
                Here's your next steps based on the analysis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <div className="text-center mb-6">
                  <div className="bg-green-200 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <HomeIcon className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800">If Buying Makes Sense</h3>
                </div>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">1.</span>
                    Get pre-approved to understand your buying power
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">2.</span>
                    Start exploring neighborhoods and home types
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">3.</span>
                    Connect with a local real estate expert
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">4.</span>
                    Plan for closing costs and moving expenses
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 inline-flex items-center justify-center"
                  >
                    Start Your Home Search
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                <div className="text-center mb-6">
                  <div className="bg-blue-200 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <KeyIcon className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-800">If Renting Makes Sense</h3>
                </div>
                <ul className="space-y-3 text-blue-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">1.</span>
                    Invest your down payment funds wisely
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">2.</span>
                    Continue building your financial foundation
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">3.</span>
                    Monitor market conditions for future opportunities
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">4.</span>
                    Reassess your situation annually
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="/market"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center justify-center"
                  >
                    Stay Market Informed
                    <TrendingUpIcon className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Complete Your Analysis
              </h2>
              <p className="text-xl text-secondary-600">
                Use these additional tools to make a fully informed decision
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
                    Determine exactly how much home you can afford based on your income and debts.
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
                    Calculate exact monthly payments, total interest, and amortization schedule.
                  </p>
                </div>
              </Link>

              <Link href="/pre-approval-estimator" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-green-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <HomeIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Pre-Approval Estimator
                  </h3>
                  <p className="text-secondary-600">
                    Estimate your pre-approval likelihood and get personalized recommendations.
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

export default RentVsBuyPage;