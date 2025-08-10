import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import InteractiveAmortizationCharts from '../components/mortgage/InteractiveAmortizationCharts';
import Link from 'next/link';
import { 
  ChartBarIcon,
  TrendingUpIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const AmortizationChartsPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Interactive Amortization Charts - Visualize Your Loan Payoff | Virginia Hodges Real Estate</title>
        <meta
          name="description"
          content="Interactive mortgage amortization charts showing loan payoff progress, principal vs interest breakdown, and equity building over time in Southern California."
        />
        <meta name="keywords" content="amortization chart, mortgage visualization, loan payoff, principal interest breakdown, equity building, Southern California mortgage" />
        <link rel="canonical" href="https://askforvirginia.com/amortization-charts" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Interactive Amortization Charts - Visualize Your Loan Payoff" />
        <meta property="og:description" content="Interactive mortgage amortization charts showing loan payoff progress, principal vs interest breakdown, and equity building." />
        <meta property="og:url" content="https://askforvirginia.com/amortization-charts" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://askforvirginia.com/images/amortization-charts-og.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Interactive Amortization Charts - Virginia Hodges Real Estate" />
        <meta name="twitter:description" content="Interactive mortgage amortization charts showing loan payoff progress and equity building." />
        <meta name="twitter:image" content="https://askforvirginia.com/images/amortization-charts-og.jpg" />
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Interactive Amortization Charts",
              "description": "Visualize your mortgage loan payoff progress with interactive charts and analysis",
              "url": "https://askforvirginia.com/amortization-charts",
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
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <ChartBarIcon className="w-16 h-16" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Interactive Amortization Charts
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-purple-100">
                Visualize your loan payoff, equity building, and payment breakdown with dynamic charts
              </p>
              <div className="flex justify-center">
                <a 
                  href="#charts"
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors duration-200 inline-flex items-center gap-2"
                >
                  Explore Your Loan Visually
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Why Visualize Your Mortgage */}
        <div className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Why Visualize Your Mortgage?
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Understanding your loan structure helps you make smarter financial decisions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-blue-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <EyeIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">See the Big Picture</h3>
                <p className="text-secondary-600">
                  Understand how your payments are split between principal and interest over time.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-green-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <TrendingUpIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Track Equity Growth</h3>
                <p className="text-secondary-600">
                  Watch your home equity build over time and plan your financial future.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 text-center shadow-soft">
                <div className="bg-primary-100 rounded-lg p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <CalendarDaysIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Plan Strategically</h3>
                <p className="text-secondary-600">
                  See the impact of extra payments and different loan scenarios visually.
                </p>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
                Key Mortgage Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-secondary-900 mb-4">Early Years Reality</h4>
                  <ul className="space-y-2 text-secondary-600">
                    <li>• Most of your payment goes to interest initially</li>
                    <li>• Very little principal is paid down in first 5 years</li>
                    <li>• Extra payments have maximum impact early</li>
                    <li>• Refinancing makes most sense in first 10 years</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-secondary-900 mb-4">Later Years Benefits</h4>
                  <ul className="space-y-2 text-secondary-600">
                    <li>• Principal payments accelerate over time</li>
                    <li>• Interest portion decreases significantly</li>
                    <li>• Equity building picks up momentum</li>
                    <li>• Tax benefits may decrease as interest drops</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Types Preview */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Multiple Chart Views
              </h2>
              <p className="text-xl text-secondary-600">
                Explore your mortgage from different perspectives
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-lg p-8 shadow-soft border border-secondary-200">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <TrendingUpIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">Loan Payoff Progress</h3>
                </div>
                <p className="text-secondary-600 mb-4">
                  Watch your remaining loan balance decrease over time. Click on any year to see detailed breakdown.
                </p>
                <ul className="space-y-2 text-secondary-600 text-sm">
                  <li>• Visual representation of balance reduction</li>
                  <li>• Interactive year selection</li>
                  <li>• Clear payoff trajectory</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-soft border border-secondary-200">
                <div className="flex items-center mb-6">
                  <div className="bg-red-100 rounded-lg p-3 mr-4">
                    <ChartPieIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">Principal vs Interest</h3>
                </div>
                <p className="text-secondary-600 mb-4">
                  See the changing ratio of principal to interest payments each year throughout your loan.
                </p>
                <ul className="space-y-2 text-secondary-600 text-sm">
                  <li>• Color-coded payment breakdown</li>
                  <li>• Year-by-year comparison</li>
                  <li>• Total payment amounts</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-soft border border-secondary-200">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 rounded-lg p-3 mr-4">
                    <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">Equity Building</h3>
                </div>
                <p className="text-secondary-600 mb-4">
                  Track your home equity growth including both principal paydown and your initial down payment.
                </p>
                <ul className="space-y-2 text-secondary-600 text-sm">
                  <li>• Cumulative equity visualization</li>
                  <li>• Percentage of home value</li>
                  <li>• Equity growth acceleration</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-soft border border-secondary-200">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 rounded-lg p-3 mr-4">
                    <ChartBarIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">Payment Comparison</h3>
                </div>
                <p className="text-secondary-600 mb-4">
                  Compare standard payments vs. extra payment scenarios to see time and interest savings.
                </p>
                <ul className="space-y-2 text-secondary-600 text-sm">
                  <li>• Side-by-side scenario comparison</li>
                  <li>• Savings calculations</li>
                  <li>• Time reduction analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Charts Section */}
        <div id="charts" className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Your Interactive Loan Analysis
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Enter your loan details and explore different visual representations of your mortgage
              </p>
            </div>

            <InteractiveAmortizationCharts />
          </div>
        </div>

        {/* Understanding Your Charts */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  Reading Your Charts
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">The Payoff Chart</h3>
                    <p className="text-secondary-600 mb-3">
                      Shows your remaining loan balance declining over time. The steeper the decline, the faster you're paying off principal.
                    </p>
                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                      <p className="text-blue-700 text-sm">
                        <strong>Tip:</strong> Notice how the curve gets steeper in later years as more of your payment goes to principal.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Principal vs Interest</h3>
                    <p className="text-secondary-600 mb-3">
                      The colored bars show what portion of each year's payments go to principal (blue) vs interest (red).
                    </p>
                    <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                      <p className="text-yellow-700 text-sm">
                        <strong>Reality Check:</strong> In year 1, about 80% of your payment typically goes to interest!
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Equity Growth</h3>
                    <p className="text-secondary-600 mb-3">
                      Green bars represent your growing ownership stake in your home as a percentage of its value.
                    </p>
                    <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                      <p className="text-green-700 text-sm">
                        <strong>Wealth Building:</strong> This chart shows how your mortgage is building long-term wealth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  Strategic Insights
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6 border border-primary-200">
                    <div className="flex items-start">
                      <InformationCircleIcon className="w-6 h-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-primary-800 mb-2">30-Year Mortgage Reality</h3>
                        <p className="text-primary-700 text-sm mb-3">
                          On a typical 30-year loan, you'll pay more in interest than the original loan amount. 
                          The charts help you see exactly when the balance tips toward building equity.
                        </p>
                        <div className="bg-white/50 rounded p-3 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-semibold">Year 1-10:</span>
                              <div>Mostly interest</div>
                            </div>
                            <div>
                              <span className="font-semibold">Year 11-20:</span>
                              <div>Gradual shift</div>
                            </div>
                            <div>
                              <span className="font-semibold">Year 21-30:</span>
                              <div>Mostly principal</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">When to Refinance</h3>
                    <p className="text-secondary-600 mb-3">
                      Use the charts to identify the best timing for refinancing decisions.
                    </p>
                    <ul className="space-y-2 text-secondary-600 text-sm">
                      <li>• Early years: Maximum refinance benefit potential</li>
                      <li>• Mid-loan: Consider if rates drop significantly</li>
                      <li>• Final years: Usually not worth the costs</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Extra Payment Strategy</h3>
                    <p className="text-secondary-600 mb-3">
                      The comparison chart shows you exactly how extra payments reshape your loan.
                    </p>
                    <ul className="space-y-2 text-secondary-600 text-sm">
                      <li>• See years saved with different extra payment amounts</li>
                      <li>• Calculate total interest savings visually</li>
                      <li>• Compare multiple payment scenarios</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold text-secondary-900 mb-3">Equity Planning</h3>
                    <p className="text-secondary-600 mb-3">
                      Use equity projections for financial planning decisions.
                    </p>
                    <ul className="space-y-2 text-secondary-600 text-sm">
                      <li>• Plan for home equity loans or lines of credit</li>
                      <li>• Determine when you'll reach 20% equity (remove PMI)</li>
                      <li>• Project wealth building over time</li>
                    </ul>
                  </div>
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
                Complete Your Mortgage Analysis
              </h2>
              <p className="text-xl text-secondary-600">
                Use these additional tools for comprehensive mortgage planning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link href="/extra-payments" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-primary-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Extra Payments Calculator
                  </h3>
                  <p className="text-secondary-600">
                    Calculate exactly how much you can save with different extra payment strategies.
                  </p>
                </div>
              </Link>

              <Link href="/mortgage-calculator" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Basic Mortgage Calculator
                  </h3>
                  <p className="text-secondary-600">
                    Get monthly payment calculations and detailed amortization schedules.
                  </p>
                </div>
              </Link>

              <Link href="/refinance-calculator" className="group">
                <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className="bg-green-100 rounded-lg p-3 w-12 h-12 mb-4">
                    <TrendingUpIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    Refinance Calculator
                  </h3>
                  <p className="text-secondary-600">
                    Determine if refinancing could save you money and calculate break-even points.
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

export default AmortizationChartsPage;