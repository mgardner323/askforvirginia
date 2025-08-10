import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import AffordabilityCalculator from '@/components/mortgage/AffordabilityCalculator';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  LightBulbIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AffordabilityCalculatorPage() {
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
      title="Home Affordability Calculator - How Much House Can I Afford?"
      description="Calculate how much house you can afford in Southern California based on your income, debts, and down payment. Get personalized affordability analysis with current market rates."
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
                <HomeIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Home Affordability Calculator
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Discover how much house you can afford in Southern California based on 
              your income, existing debts, and available down payment.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>Income-Based Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <ChartBarIcon className="w-4 h-4" />
                <span>Debt-to-Income Ratios</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <LightBulbIcon className="w-4 h-4" />
                <span>Personalized Recommendations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Calculator */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <AffordabilityCalculator
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
                Understanding Home Affordability
              </h2>
              <p className="text-lg text-secondary-600">
                Learn the key factors that determine how much house you can afford 
                and what lenders consider when approving your mortgage.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Debt-to-Income Ratios */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-primary-50 rounded-lg p-6"
              >
                <div className="bg-primary-100 rounded-lg p-3 w-fit mb-4">
                  <ChartBarIcon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Debt-to-Income Ratios
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800">Front-End Ratio (≤ 28%)</div>
                    <p className="text-secondary-600">
                      Housing costs (PITI) ÷ gross monthly income
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800">Back-End Ratio (≤ 36%)</div>
                    <p className="text-secondary-600">
                      All monthly debt payments ÷ gross monthly income
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-xs text-secondary-600">
                      FHA loans may allow higher ratios: 31% front-end, 43% back-end
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Income Considerations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-accent-50 rounded-lg p-6"
              >
                <div className="bg-accent-100 rounded-lg p-3 w-fit mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Income Considerations
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Base salary</div>
                      <p className="text-secondary-600">W-2 wages and salary income</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Bonuses & commissions</div>
                      <p className="text-secondary-600">2-year average if consistent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Rental income</div>
                      <p className="text-secondary-600">75% of rental income counts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Self-employment</div>
                      <p className="text-secondary-600">2-year tax return average</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Southern California Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-secondary-50 rounded-lg p-6"
              >
                <div className="bg-secondary-100 rounded-lg p-3 w-fit mb-4">
                  <HomeIcon className="w-6 h-6 text-secondary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  California Market Tips
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">High-Cost Area Benefits</div>
                    <p className="text-secondary-600">
                      Higher conforming loan limits ($1,149,825 in 2024)
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Down Payment Options</div>
                    <p className="text-secondary-600">
                      3% conventional, 3.5% FHA, 0% VA, or first-time buyer programs
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Property Taxes</div>
                    <p className="text-secondary-600">
                      Avg 1.21% in Riverside County, varies by location
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">HOA Fees</div>
                    <p className="text-secondary-600">
                      Factor in $100-800+ monthly for many communities
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Affordability Tips */}
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
                Tips to Improve Your Buying Power
              </h2>
              <p className="text-lg text-secondary-600">
                Strategies to increase how much house you can afford
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <h3 className="text-lg font-bold text-secondary-900 mb-4">
                  Before You Buy
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Pay down high-interest debt to improve DTI ratio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Increase your credit score for better interest rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Save for a larger down payment to reduce PMI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Consider a co-signer to qualify for more</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <h3 className="text-lg font-bold text-secondary-900 mb-4">
                  Loan Program Options
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>FHA loans allow higher debt-to-income ratios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>VA loans offer 0% down for eligible veterans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>First-time buyer programs with down payment assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Bank statement loans for self-employed borrowers</span>
                  </li>
                </ul>
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
              Next Steps in Your Home Buying Journey
            </h2>
            <p className="text-lg text-secondary-600">
              Use these additional tools to refine your home buying strategy
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
                <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Mortgage Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Calculate exact monthly payments for a specific home price 
                and loan terms.
              </p>
              <Link
                href="/mortgage-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Calculate Payments →
              </Link>
            </motion.div>

            {/* Property Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 border border-secondary-200"
            >
              <div className="bg-accent-100 rounded-lg p-3 w-fit mb-4">
                <HomeIcon className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Property Search
              </h3>
              <p className="text-secondary-600 mb-4">
                Search for homes within your budget with integrated 
                payment calculations.
              </p>
              <Link
                href="/properties"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Search Homes →
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
                <ChartBarIcon className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Pre-Approval Process
              </h3>
              <p className="text-secondary-600 mb-4">
                Get pre-approved to strengthen your offers and understand 
                your exact buying power.
              </p>
              <Link
                href="/contact"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Get Pre-Approved →
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
              Ready to Start House Hunting?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Let's find homes within your budget in Southern California's best neighborhoods. 
              I'll guide you through the entire process and connect you with trusted lenders.
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
                Schedule Consultation
              </Link>
            </div>

            {calculationResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-white/10 rounded-lg max-w-md mx-auto"
              >
                <p className="text-sm mb-2">
                  Based on your financial profile:
                </p>
                <p className="text-lg font-semibold">
                  Max Home Price: {formatCurrency(calculationResults.maxHomePrice)}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}