import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  StarIcon,
  AcademicCapIcon,
  TrophyIcon,
  HeartIcon
} from '@heroicons/react/24/solid';

const AboutVirginia: React.FC = () => {
  const achievements = [
    {
      icon: TrophyIcon,
      title: '500+ Homes Sold',
      description: 'Successfully helped over 500 families find their dream homes'
    },
    {
      icon: AcademicCapIcon,
      title: '15+ Years Experience',
      description: 'Deep knowledge of Southern California real estate markets'
    },
    {
      icon: StarIcon,
      title: '98% Client Satisfaction',
      description: 'Consistently rated 5-stars by satisfied clients'
    },
    {
      icon: HeartIcon,
      title: 'Faith-Based Service',
      description: 'Serving Christ graciously in all our business interactions'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Virginia Hodges - Real Estate Expert"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating Achievement Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-6 max-w-xs"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">15+</div>
                <div className="text-sm text-gray-600">Years of Excellence</div>
                <div className="text-xs text-gray-500 mt-1">in Real Estate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:pl-8"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Meet Virginia Hodges
              </h2>
              <h3 className="text-xl text-blue-600 font-semibold mb-6">
                Your Trusted Real Estate Expert
              </h3>
              
              <div className="space-y-4 text-gray-600">
                <p>
                  With over 15 years of experience serving Southern California, Virginia Hodges 
                  has built a reputation as one of the most trusted and knowledgeable real estate 
                  professionals in the region.
                </p>
                
                <p>
                  Specializing in Moreno Valley, Riverside, Corona, Brea, and Fullerton, Virginia 
                  combines deep local market knowledge with a genuine commitment to serving her 
                  clients with integrity and excellence.
                </p>
                
                <p>
                  As a faith-based professional, Virginia believes in building lasting relationships 
                  founded on trust, transparency, and exceptional service. Her goal is not just to 
                  help you buy or sell a home, but to guide you through one of life's most important 
                  decisions with confidence and peace of mind.
                </p>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="text-center p-4"
                >
                  <achievement.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {achievement.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Work With Virginia
              </a>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
              >
                Learn More About Me
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutVirginia;