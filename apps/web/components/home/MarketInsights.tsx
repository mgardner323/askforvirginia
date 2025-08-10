import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUpIcon,
  HomeIcon,
  CalendarDaysIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface MarketData {
  area: string;
  average_price: number;
  price_change: number;
  homes_sold: number;
  days_on_market: number;
}

const MarketInsights: React.FC = () => {
  const [marketData, setMarketData] = React.useState<MarketData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market/insights/latest?limit=3');
      if (response.ok) {
        const data = await response.json();
        setMarketData(data.data?.insights || []);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Market Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Market Insights</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest real estate market trends and data from Southern California's most desirable areas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {marketData.length > 0 ? (
            marketData.map((area, index) => (
              <motion.div
                key={area.area}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{area.area}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-600">Avg. Price</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(area.average_price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUpIcon className="w-5 h-5 text-green-600" />
                      <span className="text-gray-600">Price Change</span>
                    </div>
                    <span className={`font-semibold ${
                      area.price_change > 0 ? 'text-green-600' : 
                      area.price_change < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatPercentage(area.price_change)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ChartBarIcon className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-600">Homes Sold</span>
                    </div>
                    <span className="font-semibold text-gray-900">{area.homes_sold}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-600">Days on Market</span>
                    </div>
                    <span className="font-semibold text-gray-900">{area.days_on_market}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Data Coming Soon</h3>
              <p className="text-gray-600">We're preparing the latest market insights for you.</p>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/market-reports"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            View Detailed Market Reports
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketInsights;