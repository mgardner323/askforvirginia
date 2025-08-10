import React from 'react';
import { motion } from 'framer-motion';

const MLSSearch: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Search MLS Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse current listings directly from the California Regional MLS. 
            Find your perfect home with real-time data and comprehensive property details.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h3 className="text-white font-semibold text-lg">
              🏡 Live MLS Property Search
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              Powered by California Regional MLS (CRMLS)
            </p>
          </div>
          
          <div className="relative">
            <iframe 
              src="https://matrix.crmls.org/Matrix/public/IDX.aspx?idx=12c32074" 
              width="100%" 
              height="700" 
              frameBorder="0" 
              marginWidth={0} 
              marginHeight={0}
              className="border-none"
              title="MLS Property Search"
              loading="lazy"
            />
            
            {/* Loading overlay */}
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" id="mls-loading">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading MLS Search...</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
              <p className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Live data from CRMLS
              </p>
              <p className="mt-2 sm:mt-0">
                Questions? <a href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">Contact Virginia</a>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 text-2xl mb-2">🔍</div>
              <h4 className="font-semibold text-gray-900 mb-2">Advanced Search</h4>
              <p className="text-gray-600 text-sm">Filter by price, location, property type, and more</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-Time Data</h4>
              <p className="text-gray-600 text-sm">Up-to-date listings and market information</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 text-2xl mb-2">📸</div>
              <h4 className="font-semibold text-gray-900 mb-2">Detailed Listings</h4>
              <p className="text-gray-600 text-sm">High-quality photos and comprehensive property details</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hide loading overlay when iframe loads */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              setTimeout(() => {
                const loadingElement = document.getElementById('mls-loading');
                if (loadingElement) {
                  loadingElement.style.display = 'none';
                }
              }, 2000);
            });
          `,
        }}
      />
    </section>
  );
};

export default MLSSearch;