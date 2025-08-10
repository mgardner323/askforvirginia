import React from 'react';
import Layout from '@/components/layout/Layout';
import ARMCalculator from '@/components/mortgage/ARMCalculator';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalculatorIcon,
  LightBulbIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ARMCalculatorPage() {
  return (
    <Layout
      title="ARM Calculator - Adjustable Rate Mortgage Analysis | Southern California"
      description="Calculate Adjustable Rate Mortgage payments, rate adjustments, and risk scenarios. Compare ARM vs fixed-rate loans for your Southern California home purchase."
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
              ARM Calculator
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Analyze Adjustable Rate Mortgage payment scenarios and understand 
              the risks and benefits for your Southern California home purchase.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Risk Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <CalculatorIcon className="w-4 h-4" />
                <span>Payment Scenarios</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <LightBulbIcon className="w-4 h-4" />
                <span>ARM vs Fixed Comparison</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ARM Calculator */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <ARMCalculator className="max-w-7xl mx-auto" />
        </div>
      </section>

      {/* ARM Education */}
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
                Understanding ARM Loans
              </h2>
              <p className="text-lg text-secondary-600">
                Key concepts and terminology for Adjustable Rate Mortgages
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Initial Rate Period */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-primary-50 rounded-lg p-6"
              >
                <div className="bg-primary-100 rounded-lg p-3 w-fit mb-4">
                  <InformationCircleIcon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Initial Rate Period
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Teaser Rate:</strong> Lower initial rate to attract borrowers</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Fixed Period:</strong> Rate stays constant for 1, 3, 5, 7, or 10 years</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Common Types:</strong> 5/1 ARM, 7/1 ARM most popular</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                  <strong>Example:</strong> 5/1 ARM = Fixed rate for 5 years, then adjusts annually
                </div>
              </motion.div>

              {/* Rate Caps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-accent-50 rounded-lg p-6"
              >
                <div className="bg-accent-100 rounded-lg p-3 w-fit mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Rate Cap Structure
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Initial Cap (2/2/5)</div>
                    <p className="text-secondary-600">
                      Maximum rate increase on first adjustment (typically 2%)
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Periodic Cap</div>
                    <p className="text-secondary-600">
                      Maximum increase per adjustment period (typically 2%)
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Lifetime Cap</div>
                    <p className="text-secondary-600">
                      Maximum rate increase over loan life (typically 5%)
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Index & Margin */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-secondary-50 rounded-lg p-6"
              >
                <div className="bg-secondary-100 rounded-lg p-3 w-fit mb-4">
                  <CalculatorIcon className="w-6 h-6 text-secondary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Rate Calculation
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Index</div>
                    <p className="text-secondary-600">
                      Market benchmark (SOFR, Treasury, LIBOR)
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Margin</div>
                    <p className="text-secondary-600">
                      Lender's fixed profit (typically 2-3%)
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-secondary-800 text-center">
                      New Rate = Index + Margin
                    </div>
                    <div className="text-xs text-secondary-600 text-center mt-1">
                      (Subject to caps and floors)
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ARM vs Fixed Comparison */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                ARM vs Fixed-Rate: Which is Right for You?
              </h2>
              <p className="text-lg text-secondary-600">
                Consider these factors when choosing between ARM and fixed-rate loans
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ARM Benefits */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    ARM May Be Good If...
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-800">Planning to Move Soon</div>
                      <div className="text-secondary-600">
                        You'll sell or refinance before first adjustment
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-800">Income Will Increase</div>
                      <div className="text-secondary-600">
                        Expected salary growth can handle higher payments
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-800">Need Lower Initial Payment</div>
                      <div className="text-secondary-600">
                        Lower start rate helps with affordability
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-800">Rates Expected to Fall</div>
                      <div className="text-secondary-600">
                        Market conditions favor declining rates
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Fixed Rate Benefits */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 rounded-lg p-2">
                    <LightBulbIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    Fixed-Rate May Be Better If...
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-800">Long-Term Ownership</div>
                      <div className="text-secondary-600">
                        Planning to stay in home for 10+ years
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-800">Budget Certainty</div>
                      <div className="text-secondary-600">
                        Prefer predictable monthly payments
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-800">Risk Averse</div>
                      <div className="text-secondary-600">
                        Uncomfortable with payment uncertainty
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-secondary-800">Rates Expected to Rise</div>
                      <div className="text-secondary-600">
                        Lock in current rates before increases
                      </div>
                    </div>
                  </div>
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
              Related Mortgage Calculators
            </h2>
            <p className="text-lg text-secondary-600">
              Explore other tools to complete your mortgage analysis
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
                Fixed Rate Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Calculate traditional fixed-rate mortgage payments for comparison with ARM scenarios.
              </p>
              <Link
                href="/mortgage-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Calculate Fixed Payments →
              </Link>
            </motion.div>

            {/* Loan Comparison */}
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
                Loan Comparison
              </h3>
              <p className="text-secondary-600 mb-4">
                Compare ARM vs fixed-rate loans side by side with different scenarios.
              </p>
              <Link
                href="/loan-comparison"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Compare Loan Options →
              </Link>
            </motion.div>

            {/* Affordability Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 border border-secondary-200"
            >
              <div className="bg-secondary-100 rounded-lg p-3 w-fit mb-4">
                <LightBulbIcon className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Affordability Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Determine if you can afford the maximum ARM payment before choosing this loan type.
              </p>
              <Link
                href="/affordability-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Check Affordability →
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
              Need Expert ARM Loan Guidance?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              ARM loans can be complex. Let me connect you with experienced lenders 
              who specialize in adjustable rate mortgages for Southern California buyers.
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
                Get ARM Loan Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}