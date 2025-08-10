import React from 'react';
import Layout from '@/components/layout/Layout';
import PaymentComparison from '@/components/mortgage/PaymentComparison';
import { motion } from 'framer-motion';
import {
  ScaleIcon,
  ChartBarIcon,
  CalculatorIcon,
  LightBulbIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function LoanComparisonPage() {
  return (
    <Layout
      title="Loan Comparison Tool - Compare Mortgage Options Side by Side"
      description="Compare different mortgage loan scenarios side by side. Analyze monthly payments, interest rates, loan terms, and total costs to find the best financing option for your Southern California home purchase."
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
                <ScaleIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Loan Comparison Tool
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Compare multiple mortgage scenarios side by side to find the best 
              financing option for your Southern California home purchase.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <ChartBarIcon className="w-4 h-4" />
                <span>Side-by-Side Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <CalculatorIcon className="w-4 h-4" />
                <span>Real-Time Calculations</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <LightBulbIcon className="w-4 h-4" />
                <span>Best Option Recommendations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Comparison Tool */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <PaymentComparison className="max-w-7xl mx-auto" />
        </div>
      </section>

      {/* Comparison Insights */}
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
                Key Factors to Compare
              </h2>
              <p className="text-lg text-secondary-600">
                Understanding what to look for when comparing mortgage options
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Monthly Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-primary-50 rounded-lg p-6"
              >
                <div className="bg-primary-100 rounded-lg p-3 w-fit mb-4">
                  <CalculatorIcon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Monthly Payment
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Consider your monthly budget and cash flow</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Lower payment = more monthly flexibility</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Include taxes, insurance, and HOA fees</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                  <strong>Rule of thumb:</strong> Keep housing costs under 28% of gross income
                </div>
              </motion.div>

              {/* Interest Rate & Term */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-accent-50 rounded-lg p-6"
              >
                <div className="bg-accent-100 rounded-lg p-3 w-fit mb-4">
                  <ChartBarIcon className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Rate & Term Impact
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">15-Year Loans</div>
                    <p className="text-secondary-600">
                      Higher monthly payment, significantly less total interest
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">30-Year Loans</div>
                    <p className="text-secondary-600">
                      Lower monthly payment, more total interest paid
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Rate Sensitivity</div>
                    <p className="text-secondary-600">
                      Even 0.25% difference adds up over time
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Total Cost */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-secondary-50 rounded-lg p-6"
              >
                <div className="bg-secondary-100 rounded-lg p-3 w-fit mb-4">
                  <ScaleIcon className="w-6 h-6 text-secondary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Long-Term Cost
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Total interest paid over loan life</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>How long you plan to stay in the home</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Opportunity cost of extra payments</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                  <strong>Consider:</strong> If you move before loan maturity, 
                  total interest matters less than monthly payment
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Scenarios */}
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
                Common Comparison Scenarios
              </h2>
              <p className="text-lg text-secondary-600">
                Popular loan comparisons that help buyers make informed decisions
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 15 vs 30 Year */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  15-Year vs 30-Year Fixed
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-semibold text-blue-800">15-Year Loan</div>
                    <div className="text-blue-700">• Higher monthly payment</div>
                    <div className="text-blue-700">• Significant interest savings</div>
                    <div className="text-blue-700">• Build equity faster</div>
                    <div className="text-blue-700">• Usually lower interest rate</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-semibold text-green-800">30-Year Loan</div>
                    <div className="text-green-700">• Lower monthly payment</div>
                    <div className="text-green-700">• More cash flow flexibility</div>
                    <div className="text-green-700">• Easier to qualify</div>
                    <div className="text-green-700">• More total interest paid</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-secondary-50 rounded text-xs text-secondary-600">
                  <strong>Best for:</strong> Compare if you can afford the higher 15-year payment 
                  for significant long-term savings
                </div>
              </motion.div>

              {/* Different Rates */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Rate Shopping Comparison
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-2">Why Compare Rates?</div>
                    <ul className="space-y-1 text-secondary-600">
                      <li>• Rates vary between lenders</li>
                      <li>• 0.25% difference = significant savings</li>
                      <li>• Credit score affects your rate</li>
                      <li>• Points can buy down your rate</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded">
                    <div className="font-semibold text-yellow-800">Example Impact</div>
                    <div className="text-yellow-700 text-xs">
                      $500K loan: 7.25% vs 7.00% = ~$75/month savings
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-secondary-50 rounded text-xs text-secondary-600">
                  <strong>Tip:</strong> Get quotes from multiple lenders on the same day 
                  for accurate comparisons
                </div>
              </motion.div>

              {/* Down Payment Options */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Down Payment Scenarios
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-2">Compare Options:</div>
                    <div className="space-y-2">
                      <div className="bg-red-50 p-2 rounded text-xs">
                        <strong>5% Down:</strong> Higher loan amount + PMI
                      </div>
                      <div className="bg-yellow-50 p-2 rounded text-xs">
                        <strong>10% Down:</strong> Moderate PMI, more cash flow
                      </div>
                      <div className="bg-green-50 p-2 rounded text-xs">
                        <strong>20% Down:</strong> No PMI, lower payment
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-secondary-50 rounded text-xs text-secondary-600">
                  <strong>Consider:</strong> PMI removal timeline and opportunity cost 
                  of using cash for down payment
                </div>
              </motion.div>

              {/* Conventional vs FHA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Conventional vs FHA Loans
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-semibold text-blue-800">Conventional</div>
                    <div className="text-blue-700">• 3-5% down minimum</div>
                    <div className="text-blue-700">• PMI removable at 20% equity</div>
                    <div className="text-blue-700">• Higher credit requirements</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="font-semibold text-purple-800">FHA</div>
                    <div className="text-purple-700">• 3.5% down minimum</div>
                    <div className="text-purple-700">• MIP for life of loan</div>
                    <div className="text-purple-700">• Lower credit requirements</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-secondary-50 rounded text-xs text-secondary-600">
                  <strong>Key Factor:</strong> FHA MIP stays for loan life vs 
                  conventional PMI that can be removed
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Additional Mortgage Tools
            </h2>
            <p className="text-lg text-secondary-600">
              Explore other calculators to complete your mortgage analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Mortgage Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 border border-secondary-200"
            >
              <div className="bg-primary-100 rounded-lg p-3 w-fit mb-4">
                <CalculatorIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Mortgage Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Calculate detailed monthly payments including taxes, 
                insurance, and PMI.
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
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 border border-secondary-200"
            >
              <div className="bg-accent-100 rounded-lg p-3 w-fit mb-4">
                <ChartBarIcon className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Affordability Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Determine the maximum home price you can afford 
                based on your income and debts.
              </p>
              <Link
                href="/affordability-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Check Affordability →
              </Link>
            </motion.div>

            {/* Refinance Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 border border-secondary-200"
            >
              <div className="bg-secondary-100 rounded-lg p-3 w-fit mb-4">
                <ScaleIcon className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Refinance Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Compare your current mortgage with potential 
                refinancing options.
              </p>
              <Link
                href="/refinance-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Compare Refinance →
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
              Need Help Choosing the Right Loan?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Let me connect you with trusted lenders who can provide personalized quotes 
              and help you navigate the Southern California mortgage market.
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
                Get Lender Recommendations
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}