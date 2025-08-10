import React from 'react';
import Layout from '@/components/layout/Layout';
import PropertyAffordabilityAnalysis from '@/components/mortgage/PropertyAffordabilityAnalysis';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  MapPinIcon,
  CalculatorIcon,
  LightBulbIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  StarIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PropertyAffordabilityAnalysisPage() {
  return (
    <Layout
      title="Property Affordability Analysis - Advanced Home Buying Calculator | Southern California"
      description="Advanced property affordability analysis with Southern California market data. Get personalized insights, credit score impact, and county-specific recommendations for your home purchase."
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
              Property Affordability Analysis
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-8">
              Advanced affordability analysis with Southern California market data, 
              credit score impact, and personalized recommendations for your home purchase.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <ChartBarIcon className="w-4 h-4" />
                <span>Affordability Score</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <MapPinIcon className="w-4 h-4" />
                <span>County-Specific Data</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <LightBulbIcon className="w-4 h-4" />
                <span>Personalized Insights</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Analysis Tool */}
      <section className="py-16 bg-secondary-50">
        <div className="container">
          <PropertyAffordabilityAnalysis className="max-w-7xl mx-auto" />
        </div>
      </section>

      {/* Understanding Your Analysis */}
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
                Understanding Your Affordability Analysis
              </h2>
              <p className="text-lg text-secondary-600">
                Key components and factors that determine your home buying power
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Affordability Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-primary-50 rounded-lg p-6"
              >
                <div className="bg-primary-100 rounded-lg p-3 w-fit mb-4">
                  <StarIcon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Affordability Score
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>80-100:</strong> Excellent affordability in your target market</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>60-79:</strong> Good affordability with some considerations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Below 60:</strong> Limited affordability - adjustments recommended</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border text-xs text-secondary-600">
                  <strong>Factors:</strong> Price vs median, credit score, down payment ratio, employment type
                </div>
              </motion.div>

              {/* Price Ranges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-accent-50 rounded-lg p-6"
              >
                <div className="bg-accent-100 rounded-lg p-3 w-fit mb-4">
                  <TrendingUpIcon className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Maximum vs Comfortable
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Maximum Price</div>
                    <p className="text-secondary-600">
                      Based on 28% housing-to-income ratio - the highest you can qualify for
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800 mb-1">Comfortable Price</div>
                    <p className="text-secondary-600">
                      Based on 25% ratio - recommended for better financial security and flexibility
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-secondary-800 text-xs">
                      The comfortable range leaves room for unexpected expenses and lifestyle changes
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Credit Impact */}
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
                  Credit Score Impact
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-secondary-800">760+: Premium Rates</div>
                    <div className="text-secondary-600">Best available rates (~6.75%)</div>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800">700-759: Good Rates</div>
                    <div className="text-secondary-600">Competitive rates (~7.00%)</div>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800">660-699: Average</div>
                    <div className="text-secondary-600">Market rates (~7.25%)</div>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-800">620-659: Fair</div>
                    <div className="text-secondary-600">Higher rates (~7.75%)</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Southern California Market Insights */}
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
                Southern California Market Insights
              </h2>
              <p className="text-lg text-secondary-600">
                County-specific data that affects your affordability analysis
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* High-Cost Areas */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-100 rounded-lg p-2">
                    <TrendingUpIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    High-Cost Counties
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="font-semibold text-red-800">Orange County</div>
                    <div className="text-red-700 mt-1">
                      • Median: $1.2M | Tax: 0.73% | HOA: $300/mo<br />
                      • Requires higher income and substantial down payment<br />
                      • Consider coastal premium vs inland alternatives
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="font-semibold text-orange-800">Los Angeles County</div>
                    <div className="text-orange-700 mt-1">
                      • Median: $950K | Tax: 0.72% | HOA: $280/mo<br />
                      • Varies significantly by area (downtown vs suburbs)<br />
                      • Factor in commute costs and lifestyle preferences
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Affordable Options */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 rounded-lg p-2">
                    <HomeIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    More Affordable Counties
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="font-semibold text-green-800">Riverside County</div>
                    <div className="text-green-700 mt-1">
                      • Median: $650K | Tax: 1.21% | HOA: $150/mo<br />
                      • Better affordability with growing communities<br />
                      • Consider commute to employment centers
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-semibold text-blue-800">San Bernardino County</div>
                    <div className="text-blue-700 mt-1">
                      • Median: $550K | Tax: 1.18% | HOA: $120/mo<br />
                      • Most affordable option in region<br />
                      • Family-friendly communities with good value
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Key Considerations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200"
            >
              <h4 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-600" />
                Important Market Considerations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-secondary-800 mb-2">Property Taxes</div>
                  <p className="text-secondary-600">
                    Higher in Riverside/San Bernardino (1.2%) vs coastal counties (0.7%)
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-secondary-800 mb-2">HOA Fees</div>
                  <p className="text-secondary-600">
                    Vary widely: $100-500+/month depending on amenities and location
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-secondary-800 mb-2">Commute Costs</div>
                  <p className="text-secondary-600">
                    Factor gas, tolls, and time when choosing more affordable areas
                  </p>
                </div>
              </div>
            </motion.div>
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
              Complete Your Home Buying Analysis
            </h2>
            <p className="text-lg text-secondary-600">
              Use these tools together for comprehensive home buying insights
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
                Calculate exact monthly payments for properties in your price range.
              </p>
              <Link
                href="/mortgage-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Calculate Payments →
              </Link>
            </motion.div>

            {/* Basic Affordability */}
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
                Basic Affordability
              </h3>
              <p className="text-secondary-600 mb-4">
                Quick affordability check with standard debt-to-income calculations.
              </p>
              <Link
                href="/affordability-calculator"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Quick Check →
              </Link>
            </motion.div>

            {/* Loan Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200 border border-secondary-200"
            >
              <div className="bg-secondary-100 rounded-lg p-3 w-fit mb-4">
                <TrendingUpIcon className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Loan Options
              </h3>
              <p className="text-secondary-600 mb-4">
                Compare different loan scenarios within your affordable range.
              </p>
              <Link
                href="/loan-comparison"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Compare Loans →
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
              Let me help you find properties in your price range and connect you 
              with trusted lenders who understand the Southern California market.
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
                Find Properties in My Range
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}