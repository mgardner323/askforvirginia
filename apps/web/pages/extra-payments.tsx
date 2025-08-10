import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import ExtraPaymentsCalculator from '../components/mortgage/ExtraPaymentsCalculator';
import Link from 'next/link';
import { 
  CurrencyDollarIcon,
  ClockIcon,
  TrendingDownIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const ExtraPaymentsPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Extra Payments Calculator - Save Years and Thousands in Interest | Virginia Hodges Real Estate</title>
        <meta
          name="description"
          content="Calculate how extra mortgage payments can save you thousands in interest and years off your loan. See multiple payment scenarios and find the best strategy for your situation in Southern California."
        />
        <meta name="keywords" content="extra mortgage payments, mortgage calculator, pay off mortgage early, interest savings, Southern California mortgage" />
        <link rel="canonical" href="https://askforvirginia.com/extra-payments" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Extra Payments Calculator - Save Years and Thousands in Interest" />
        <meta property="og:description" content="Calculate how extra mortgage payments can save you thousands in interest and years off your loan." />
        <meta property="og:url" content="https://askforvirginia.com/extra-payments" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://askforvirginia.com/images/mortgage-calculator-og.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Extra Payments Calculator - Virginia Hodges Real Estate" />
        <meta name="twitter:description" content="Calculate how extra mortgage payments can save you thousands in interest and years off your loan." />
        <meta name="twitter:image" content="https://askforvirginia.com/images/mortgage-calculator-og.jpg" />
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Extra Payments Calculator",
              "description": "Calculate how extra mortgage payments can save you thousands in interest and years off your loan",
              "url": "https://askforvirginia.com/extra-payments",
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
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <CurrencyDollarIcon className="w-16 h-16" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Extra Payments Calculator
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-100">
                See how extra mortgage payments can save you thousands in interest and years off your loan
              </p>
              <div className="flex justify-center">
                <a 
                  href="#calculator"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200 inline-flex items-center gap-2"
                >
                  Calculate Your Savings
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Why Make Extra Payments?
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Even small extra payments can have a massive impact on your mortgage
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-green-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <TrendingDownIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Massive Interest Savings</h3>
                <p className="text-secondary-600">
                  Save tens of thousands in interest payments over the life of your loan with strategic extra payments.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-blue-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <ClockIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Years Off Your Loan</h3>
                <p className="text-secondary-600">
                  Pay off your mortgage years earlier and achieve financial freedom faster than you thought possible.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-primary-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <ChartBarIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Flexible Strategies</h3>
                <p className="text-secondary-600">
                  Compare monthly, annual, and one-time payment strategies to find what works best for your budget.
                </p>
              </div>
            </div>

            {/* Example Scenario */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">Real Example</h3>
                <p className="text-secondary-600 text-lg">$650,000 home • 20% down • 7.25% interest • 30-year loan</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4 text-red-600">Without Extra Payments</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-semibold">$3,563</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-semibold">$762,680</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payoff Time:</span>
                      <span className="font-semibold">30 years</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4 text-green-600">With $200 Extra Monthly</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-semibold">$3,763</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-semibold">$580,244</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payoff Time:</span>
                      <span className="font-semibold">24.5 years</span>
                    </div>
                    <div className="border-t pt-2 mt-4">
                      <div className="flex justify-between font-bold text-green-600">
                        <span>Savings:</span>
                        <span>$182,436</span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-600">
                        <span>Time Saved:</span>
                        <span>5.5 years</span>
                      </div>
                    </div>
                  </div>
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
                Calculate Your Extra Payment Strategy
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Try different payment scenarios and see exactly how much you can save
              </p>
            </div>

            <ExtraPaymentsCalculator />
          </div>
        </div>

        {/* Educational Content */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  Smart Extra Payment Strategies
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Monthly Extra Payments</h3>
                    <p className="text-secondary-600 mb-3">
                      The most consistent approach. Add a fixed amount to your monthly payment automatically.
                    </p>
                    <ul className="space-y-2 text-secondary-600">
                      <li>• Easiest to budget and maintain</li>
                      <li>• Maximum impact on interest reduction</li>
                      <li>• Can start with any amount ($50-$500+)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Annual Windfalls</h3>
                    <p className="text-secondary-600 mb-3">
                      Use tax refunds, bonuses, or other yearly income for a big principal payment.
                    </p>
                    <ul className="space-y-2 text-secondary-600">
                      <li>• No impact on monthly budget</li>
                      <li>• Perfect for irregular income</li>
                      <li>• Great way to use windfalls wisely</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">One-Time Payments</h3>
                    <p className="text-secondary-600 mb-3">
                      Strategic lump sum payments during specific years of your loan.
                    </p>
                    <ul className="space-y-2 text-secondary-600">
                      <li>• Most impactful in early loan years</li>
                      <li>• Good use of inheritance or savings</li>
                      <li>• Can be combined with other strategies</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-yellow-800 mb-2">Important Considerations</h3>
                      <ul className="space-y-2 text-yellow-700 text-sm">
                        <li>• Make sure you have an emergency fund first</li>
                        <li>• Pay off higher interest debt before extra mortgage payments</li>
                        <li>• Consider your investment opportunities (7%+ returns)</li>
                        <li>• Don't sacrifice retirement savings for mortgage payoff</li>
                        <li>• Ensure payments go toward principal, not escrow</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  When Extra Payments Make Sense
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="text-secondary-600">
                      <strong>High interest rate:</strong> If your mortgage rate is above 6%, extra payments provide guaranteed savings.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="text-secondary-600">
                      <strong>Stable finances:</strong> You have steady income and adequate emergency savings.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="text-secondary-600">
                      <strong>Peace of mind:</strong> You value the security of owning your home outright sooner.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="text-secondary-600">
                      <strong>Approaching retirement:</strong> You want to eliminate mortgage payments before retirement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                More Mortgage Tools
              </h2>
              <p className="text-xl text-secondary-600">
                Explore our complete suite of mortgage calculators
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link href="/mortgage-calculator" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-primary-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Basic Mortgage Calculator
                  </h3>
                  <p className="text-secondary-600">
                    Calculate monthly payments, total interest, and get a complete amortization schedule.
                  </p>
                </div>
              </Link>

              <Link href="/affordability-calculator" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Affordability Calculator
                  </h3>
                  <p className="text-secondary-600">
                    Determine how much home you can afford based on your income and debts.
                  </p>
                </div>
              </Link>

              <Link href="/refinance-calculator" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-green-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <TrendingDownIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Refinance Calculator
                  </h3>
                  <p className="text-secondary-600">
                    See if refinancing could save you money and calculate your break-even point.
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

export default ExtraPaymentsPage;