import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import RefinanceCalculator from '@/components/mortgage/RefinanceCalculator';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  LightBulbIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function RefinanceCalculatorPage() {
  const [calculationResults, setCalculationResults] = useState(null);

  const handleCalculationComplete = (results: any) => {
    setCalculationResults(results);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Layout
      title="Mortgage Refinance Calculator - Should I Refinance My Home?"
      description="Calculate potential savings from refinancing your mortgage in Southern California. Analyze break-even points, monthly savings, and total interest savings with current rates."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 rounded-full p-4">
                <ChartBarIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Refinance Calculator
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Determine if refinancing your mortgage could save you money with today's 
              interest rates in Southern California.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>Monthly Savings</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <ClockIcon className="w-4 h-4" />
                <span>Break-Even Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <LightBulbIcon className="w-4 h-4" />
                <span>Expert Recommendations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Calculator */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <RefinanceCalculator
            onCalculationComplete={handleCalculationComplete}
            className="max-w-7xl mx-auto"
          />
        </div>
      </section>

      {/* Educational Content */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                When Should You Consider Refinancing?
              </h2>
              <p className="text-lg text-secondary-600">
                Understanding the right time to refinance can save you thousands 
                of dollars over the life of your loan.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Rate Drop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-green-50 rounded-lg p-6"
              >
                <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Interest Rate Drop
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Rates dropped 0.5% or more</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Credit score improved significantly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Plan to stay 2+ years</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                  <strong>Rule of thumb:</strong> If you can reduce your rate by 0.5-0.75%, 
                  refinancing may be worth it.
                </div>
              </motion.div>

              {/* Change Loan Term */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-blue-50 rounded-lg p-6"
              >
                <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Change Loan Term
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Shorten Term</div>
                    <p className="text-secondary-600">
                      Switch from 30-year to 15-year to pay off faster and save interest
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Extend Term</div>
                    <p className="text-secondary-600">
                      Lower monthly payments but pay more interest over time
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                  <strong>Consider:</strong> How long you plan to stay in the home 
                  affects which term makes sense.
                </div>
              </motion.div>

              {/* Cash-Out Refinance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-purple-50 rounded-lg p-6"
              >
                <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Access Home Equity
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                    <span>Home improvements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                    <span>Debt consolidation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                    <span>Investment opportunities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                    <span>Education expenses</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                  <strong>Note:</strong> Use home equity responsibly - your home 
                  is collateral for the loan.
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Refinance Process */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                The Refinancing Process
              </h2>
              <p className="text-lg text-secondary-600">
                Understanding the refinancing timeline and requirements
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Timeline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <h3 className="text-xl font-bold text-secondary-900 mb-6">
                  Refinance Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-primary-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-primary-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-secondary-800">Application (1-2 days)</div>
                      <p className="text-sm text-secondary-600">Submit application and initial documents</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-primary-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-primary-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-secondary-800">Processing (2-3 weeks)</div>
                      <p className="text-sm text-secondary-600">Underwriting, appraisal, income verification</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-primary-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-primary-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-secondary-800">Closing (1 week)</div>
                      <p className="text-sm text-secondary-600">Final approval, closing documents, funding</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary-50 rounded border">
                  <p className="text-sm text-primary-700">
                    <strong>Total time:</strong> Typically 30-45 days from application to closing
                  </p>
                </div>
              </motion.div>

              {/* Requirements */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <h3 className="text-xl font-bold text-secondary-900 mb-6">
                  What You'll Need
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-2">Financial Documents</div>
                    <ul className="space-y-1 text-secondary-600">
                      <li>• Recent pay stubs (2 months)</li>
                      <li>• Tax returns (2 years)</li>
                      <li>• Bank statements (2 months)</li>
                      <li>• Investment account statements</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-secondary-800 mb-2">Property Documents</div>
                    <ul className="space-y-1 text-secondary-600">
                      <li>• Current mortgage statement</li>
                      <li>• Property tax records</li>
                      <li>• Insurance declarations page</li>
                      <li>• HOA information (if applicable)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-secondary-800 mb-2">Credit Requirements</div>
                    <ul className="space-y-1 text-secondary-600">
                      <li>• Credit score 620+ (conventional)</li>
                      <li>• Stable income history</li>
                      <li>• Home equity (20%+ preferred)</li>
                      <li>• Reasonable debt-to-income ratio</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Costs and Considerations */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Refinancing Costs to Consider
              </h2>
              <p className="text-lg text-secondary-600">
                Understanding all costs helps you make an informed decision
              </p>
            </motion.div>

            <div className="bg-secondary-50 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Typical Closing Costs (2-5% of loan amount)
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Appraisal</span>
                      <span className="font-medium">$400 - $800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Origination fee</span>
                      <span className="font-medium">0.5% - 1% of loan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Title insurance</span>
                      <span className="font-medium">$800 - $1,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Recording fees</span>
                      <span className="font-medium">$100 - $300</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Credit report</span>
                      <span className="font-medium">$30 - $50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-700">Misc. fees</span>
                      <span className="font-medium">$500 - $1,000</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span className="text-secondary-900">Total estimate</span>
                      <span className="text-secondary-900">$2,000 - $8,000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-4">
                    Ways to Reduce Costs
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Shop around for the best rates and fees</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Consider no-closing-cost loans (higher rate)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Negotiate with your current lender</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Time your refinance to avoid prepayment penalties</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Improve credit score before applying</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-accent-50 rounded border border-accent-200">
                    <p className="text-sm text-accent-800">
                      <strong>Tip:</strong> Get quotes from multiple lenders and compare 
                      the Annual Percentage Rate (APR), not just the interest rate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Related Financial Tools
            </h2>
            <p className="text-lg text-secondary-600">
              Explore additional calculators to optimize your real estate finances
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Mortgage Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200"
            >
              <div className="bg-primary-100 rounded-lg p-3 w-fit mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Mortgage Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Calculate monthly payments for a new home purchase or 
                different loan scenarios.
              </p>
              <Link
                href="/mortgage-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Calculate Payments →
              </Link>
            </motion.div>

            {/* Affordability Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200"
            >
              <div className="bg-accent-100 rounded-lg p-3 w-fit mb-4">
                <HomeIcon className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Affordability Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Determine how much home you can afford based on 
                your income and financial situation.
              </p>
              <Link
                href="/affordability-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Check Affordability →
              </Link>
            </motion.div>

            {/* Property Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200"
            >
              <div className="bg-secondary-100 rounded-lg p-3 w-fit mb-4">
                <HomeIcon className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Property Search
              </h3>
              <p className="text-secondary-600 mb-4">
                Search for properties and see how refinancing 
                could affect your buying power.
              </p>
              <Link
                href="/properties"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Search Properties →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-primary-600">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to Explore Refinancing?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Let me connect you with trusted lenders who specialize in Southern California 
              refinancing. Get personalized quotes and expert guidance throughout the process.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-secondary-50 transition-colors duration-200"
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                Call (123) 456-7890
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Get Refinance Quotes
              </Link>
            </div>

            {calculationResults && calculationResults.monthlySavings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-white/10 rounded-lg max-w-md mx-auto"
              >
                <p className="text-sm mb-2">
                  Based on your calculation:
                </p>
                <p className="text-lg font-semibold">
                  Potential Monthly Savings: {formatCurrency(calculationResults.monthlySavings)}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}