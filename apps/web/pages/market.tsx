import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  HomeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import {
  BuildingOfficeIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/solid';

interface MarketData {
  area: string;
  average_price: number;
  price_change: number;
  homes_sold: number;
  days_on_market: number;
}

interface MarketReport {
  id: number;
  area: string;
  report_date: string;
  metrics: {
    median_home_price: number;
    average_days_on_market: number;
    total_sales: number;
    price_per_sqft: number;
    inventory_levels: number;
    year_over_year_change: number;
  };
  insights: string;
  seo: {
    meta_title: string;
    meta_description: string;
    slug: string;
  };
  formattedDate: string;
  url: string;
}

export default function Market() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [recentReports, setRecentReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch market insights
        const insightsResponse = await fetch('/api/market/insights/latest?limit=5');
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          setMarketData(insightsData.data?.insights || []);
        }

        // Fetch recent reports
        const reportsResponse = await fetch('/api/market?limit=6');
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setRecentReports(reportsData.data?.reports || []);
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const serviceAreas = [
    { 
      name: 'Moreno Valley', 
      population: '210,000+', 
      description: 'Growing family communities with excellent schools and amenities',
      highlights: ['Family-Friendly', 'Great Schools', 'Affordable Housing']
    },
    { 
      name: 'Riverside', 
      population: '330,000+', 
      description: 'Historic downtown with diverse neighborhoods and strong job market',
      highlights: ['Historic Downtown', 'Job Growth', 'Cultural Scene']
    },
    { 
      name: 'Corona', 
      population: '170,000+', 
      description: 'Modern developments and master-planned communities',
      highlights: ['New Construction', 'Master-Planned', 'Modern Amenities']
    },
    { 
      name: 'Brea', 
      population: '48,000+', 
      description: 'Upscale community with luxury homes and premium lifestyle',
      highlights: ['Luxury Homes', 'Premium Lifestyle', 'Top-Rated Schools']
    },
    { 
      name: 'Fullerton', 
      population: '140,000+', 
      description: 'Educational hub with university presence and vibrant culture',
      highlights: ['University Town', 'Cultural Hub', 'Walkable Downtown']
    }
  ];

  return (
    <Layout
      title="The Market - Real Estate Market Reports & Analysis"
      description="Stay informed with comprehensive market reports, price trends, and real estate analytics for Moreno Valley, Riverside, Corona, Brea, and Fullerton."
    >
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The Market
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Stay ahead with comprehensive market reports, price trends, and real estate 
              analytics for Southern California's most desirable communities.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="#market-data" className="btn-secondary">
                View Market Data
              </a>
              <a href="#reports" className="btn-outline-white">
                Latest Reports
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Market Overview Cards */}
      <section id="market-data" className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Current Market Snapshot
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Get the latest market insights and trends from across our service areas
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-secondary-50 rounded-lg p-8 animate-pulse">
                  <div className="h-6 bg-secondary-300 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-secondary-300 rounded"></div>
                    <div className="h-4 bg-secondary-300 rounded w-3/4"></div>
                    <div className="h-4 bg-secondary-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : marketData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {marketData.map((area, index) => (
                <motion.div
                  key={area.area}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg p-8 shadow-soft hover:shadow-medium transition-all duration-200 border border-secondary-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-secondary-900">{area.area}</h3>
                    <div className={`p-2 rounded-lg ${
                      area.price_change > 0 ? 'bg-green-100' : 
                      area.price_change < 0 ? 'bg-red-100' : 'bg-secondary-100'
                    }`}>
                      {area.price_change > 0 ? (
                        <TrendingUpIcon className="w-6 h-6 text-green-600" />
                      ) : area.price_change < 0 ? (
                        <TrendingDownIcon className="w-6 h-6 text-red-600" />
                      ) : (
                        <ChartBarIcon className="w-6 h-6 text-secondary-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HomeIcon className="w-5 h-5 text-primary-600" />
                        <span className="text-secondary-600">Median Price</span>
                      </div>
                      <span className="font-semibold text-secondary-900">
                        {formatPrice(area.average_price)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUpIcon className="w-5 h-5 text-primary-600" />
                        <span className="text-secondary-600">Year Change</span>
                      </div>
                      <span className={`font-semibold ${
                        area.price_change > 0 ? 'text-green-600' : 
                        area.price_change < 0 ? 'text-red-600' : 'text-secondary-600'
                      }`}>
                        {formatPercentage(area.price_change)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChartBarIcon className="w-5 h-5 text-primary-600" />
                        <span className="text-secondary-600">Homes Sold</span>
                      </div>
                      <span className="font-semibold text-secondary-900">{area.homes_sold}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                        <span className="text-secondary-600">Days on Market</span>
                      </div>
                      <span className="font-semibold text-secondary-900">{area.days_on_market}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ChartBarIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Market Data Coming Soon</h3>
              <p className="text-secondary-600 max-w-md mx-auto">
                We're preparing the latest market insights for you. Check back soon for comprehensive data.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Service Areas */}
      <section id="service-areas" className="py-20 bg-secondary-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Our Service Areas
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Expert local knowledge across Southern California's most desirable communities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceAreas.map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-8 shadow-soft hover:shadow-medium transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-secondary-900">{area.name}</h3>
                  <MapPinIcon className="w-6 h-6 text-primary-600 mt-1" />
                </div>
                <p className="text-sm text-secondary-500 mb-3">Population: {area.population}</p>
                <p className="text-secondary-600 mb-4">{area.description}</p>
                <div className="flex flex-wrap gap-2">
                  {area.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      <section id="reports" className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Latest Market Reports
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              In-depth analysis and insights from our local market experts
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-secondary-50 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-secondary-300 rounded mb-2"></div>
                  <div className="h-6 bg-secondary-300 rounded mb-4"></div>
                  <div className="h-4 bg-secondary-300 rounded mb-2"></div>
                  <div className="h-4 bg-secondary-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : recentReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200 overflow-hidden border border-secondary-100"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                        {report.area}
                      </span>
                      <time className="text-sm text-secondary-500">
                        {new Date(report.report_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </time>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                      {report.seo.meta_title}
                    </h3>
                    
                    <p className="text-secondary-600 mb-4 line-clamp-2">
                      {report.seo.meta_description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 text-primary-600 mr-1" />
                        <span className="text-secondary-600">
                          {formatPrice(report.metrics.median_home_price)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 text-primary-600 mr-1" />
                        <span className="text-secondary-600">
                          {report.metrics.average_days_on_market} days
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/market-reports/${report.seo.slug}`}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                    >
                      Read Full Report
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <DocumentTextIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Reports Coming Soon</h3>
              <p className="text-secondary-600 max-w-md mx-auto">
                Our comprehensive market reports are being prepared. Check back soon for detailed analysis.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary-600">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-3xl font-bold mb-6">
              Get Personalized Market Analysis
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Want specific insights for your neighborhood or property? Get a custom market 
              analysis tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact?subject=valuation"
                className="btn-secondary"
              >
                Request Free Analysis
              </Link>
              <Link
                href="/properties"
                className="btn-outline-white"
              >
                Browse Properties
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}