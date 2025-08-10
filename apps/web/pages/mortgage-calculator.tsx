import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MortgageCalculator from '@/components/mortgage/MortgageCalculator';
import AmortizationSchedule from '@/components/mortgage/AmortizationSchedule';
import { motion } from 'framer-motion';
import {
  CalculatorIcon,
  HomeIcon,
  ChartBarIcon,
  LightBulbIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MortgageCalculatorPage() {
  const [calculationResults, setCalculationResults] = useState(null);
  const [loanInputs, setLoanInputs] = useState({ loanAmount: 0, interestRate: 0, loanTerm: 0 });

  const handleCalculationComplete = (results: any) => {
    setCalculationResults(results);
    // Extract loan details for amortization schedule
    setLoanInputs({
      loanAmount: results.loanAmount,
      interestRate: parseFloat(results.principalAndInterest) ? 7.25 : 0, // Default rate if not available
      loanTerm: 30 // Default term if not available
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Layout
      title="Mortgage Calculator - Southern California Home Loans"
      description="Calculate your monthly mortgage payment for Southern California properties. Get accurate estimates for home loans, property taxes, insurance, and PMI with our comprehensive mortgage calculator."
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
                <CalculatorIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Mortgage Calculator
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Calculate your monthly mortgage payment for Southern California properties. 
              Get accurate estimates including property taxes, insurance, and PMI.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <HomeIcon className="w-4 h-4" />
                <span>CA Property Tax Rates</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <ChartBarIcon className="w-4 h-4" />
                <span>Current Interest Rates</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <LightBulbIcon className="w-4 h-4" />
                <span>Expert Insights</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Calculator */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <MortgageCalculator
            onCalculationComplete={handleCalculationComplete}
            className="max-w-7xl mx-auto"
          />
        </div>
      </section>

      {/* Amortization Schedule */}
      {loanInputs.loanAmount > 0 && (
        <section className="py-16 bg-white">
          <div className="container">
            <AmortizationSchedule
              loanAmount={loanInputs.loanAmount}
              interestRate={loanInputs.interestRate}
              loanTerm={loanInputs.loanTerm}
              className="max-w-7xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* Educational Content */}
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
                Understanding Your Mortgage Payment
              </h2>
              <p className="text-lg text-secondary-600">
                Learn about the components of your monthly mortgage payment and factors 
                that affect home affordability in Southern California.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Payment Components */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-primary-50 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Payment Components
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      Principal & Interest (P&I)
                    </h4>
                    <p className="text-sm text-secondary-600">
                      The main loan payment. Principal pays down the loan balance, 
                      while interest is the cost of borrowing.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      Property Taxes
                    </h4>
                    <p className="text-sm text-secondary-600">
                      Annual property taxes divided by 12. In Southern California, 
                      rates typically range from 0.7% to 1.2% of home value.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      Home Insurance
                    </h4>
                    <p className="text-sm text-secondary-600">
                      Protects your home and belongings. Costs vary by location, 
                      with higher rates in fire-prone areas.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      PMI (Private Mortgage Insurance)
                    </h4>
                    <p className="text-sm text-secondary-600">
                      Required with less than 20% down payment. Typically 0.3% to 
                      1.5% of loan amount annually.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CA Market Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-accent-50 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Southern California Insights
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      Current Market
                    </h4>
                    <p className="text-sm text-secondary-600">
                      Median home prices in our area range from $550K in San Bernardino 
                      County to $1.2M in Orange County.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      Down Payment Options
                    </h4>
                    <p className="text-sm text-secondary-600">
                      Consider 3-5% conventional loans, FHA loans (3.5% down), 
                      or VA loans (0% down for eligible veterans).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      Interest Rate Factors
                    </h4>
                    <p className="text-sm text-secondary-600">
                      Your credit score, loan-to-value ratio, and loan type 
                      significantly impact your interest rate.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-2">
                      HOA Considerations
                    </h4>
                    <p className="text-sm text-secondary-600">
                      Many CA properties have HOA fees ranging from $100-$800+ 
                      monthly, affecting overall affordability.
                    </p>
                  </div>
                </div>
              </motion.div>
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
              More Financial Tools
            </h2>
            <p className="text-lg text-secondary-600">
              Explore additional calculators and resources to make informed home buying decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Affordability Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200"
            >
              <div className="bg-primary-100 rounded-lg p-3 w-fit mb-4">
                <HomeIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Affordability Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                Determine how much home you can afford based on your income, 
                debts, and down payment.
              </p>
              <Link
                href="/affordability-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Calculate Affordability →
              </Link>
            </motion.div>

            {/* Refinance Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200"
            >
              <div className="bg-accent-100 rounded-lg p-3 w-fit mb-4">
                <ChartBarIcon className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Refinance Calculator
              </h3>
              <p className="text-secondary-600 mb-4">
                See if refinancing your current mortgage could save you money 
                with today's interest rates.
              </p>
              <Link
                href="/refinance-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Check Refinancing →
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
                Browse available properties in Southern California with 
                integrated mortgage calculations.
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
              Ready to Get Pre-Approved?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Get personalized guidance from Virginia Hodges Real Estate. 
              I'll help you navigate the Southern California market and connect 
              you with trusted lenders for the best rates.
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
                Get in Touch
              </Link>
            </div>

            {calculationResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-white/10 rounded-lg max-w-md mx-auto"
              >
                <p className="text-sm mb-2">
                  Based on your calculation:
                </p>
                <p className="text-lg font-semibold">
                  Monthly Payment: {formatCurrency(calculationResults.totalMonthlyPayment)}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}