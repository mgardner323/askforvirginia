import React from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import {
  StarIcon,
  AcademicCapIcon,
  TrophyIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import {
  ChatBubbleLeftRightIcon,
  HomeIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function About() {
  const achievements = [
    {
      icon: TrophyIcon,
      title: '500+ Homes Sold',
      description: 'Successfully helped over 500 families find their dream homes across Southern California'
    },
    {
      icon: AcademicCapIcon,
      title: '15+ Years Experience',
      description: 'Deep knowledge of local markets, trends, and the complete buying/selling process'
    },
    {
      icon: StarIcon,
      title: '98% Client Satisfaction',
      description: 'Consistently rated 5-stars by satisfied clients who trust our professional service'
    },
    {
      icon: HeartIcon,
      title: 'Faith-Based Service',
      description: 'Serving Christ graciously in all our business interactions with integrity and care'
    }
  ];

  const services = [
    {
      icon: HomeIcon,
      title: 'Buyer Representation',
      description: 'Expert guidance through every step of the home buying process, from search to closing.',
      features: ['Property Search Assistance', 'Market Analysis', 'Negotiation Support', 'Closing Coordination']
    },
    {
      icon: ChartBarIcon,
      title: 'Seller Representation',
      description: 'Comprehensive marketing and pricing strategies to sell your home quickly and for top dollar.',
      features: ['Professional Photography', 'Market Pricing Analysis', 'Marketing Strategy', 'Open House Coordination']
    },
    {
      icon: UsersIcon,
      title: 'Investment Properties',
      description: 'Specialized knowledge in investment properties and rental market analysis.',
      features: ['ROI Analysis', 'Rental Market Insights', 'Property Management Referrals', 'Tax Strategy Guidance']
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'First-Time Buyers',
      description: 'Patient guidance and education for those purchasing their very first home.',
      features: ['FHA/VA Loan Assistance', 'Down Payment Programs', 'Neighborhood Education', 'Process Walkthrough']
    }
  ];

  const serviceAreas = [
    { name: 'Moreno Valley', population: '210,000+', specialty: 'Family Communities' },
    { name: 'Riverside', population: '330,000+', specialty: 'Historic Downtown' },
    { name: 'Corona', population: '170,000+', specialty: 'New Developments' },
    { name: 'Brea', population: '48,000+', specialty: 'Luxury Homes' },
    { name: 'Fullerton', population: '140,000+', specialty: 'Educational Hub' }
  ];

  return (
    <Layout
      title="About Virginia Hodges - Your Trusted Real Estate Expert"
      description="Meet Virginia Hodges, your trusted real estate professional with 15+ years of experience serving Moreno Valley, Riverside, Corona, Brea, and Fullerton. Faith-based service with proven results."
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
              About Virginia Hodges
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Your trusted real estate expert serving Southern California with faith, 
              integrity, and over 15 years of proven results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main About Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  Serving Southern California with Excellence
                </h2>
                
                <div className="space-y-6 text-lg text-secondary-600">
                  <p>
                    For over 15 years, Virginia Hodges has been helping families throughout 
                    Southern California achieve their real estate dreams. With deep roots in 
                    the community and extensive market knowledge, she has built a reputation 
                    as one of the most trusted and successful agents in the region.
                  </p>
                  
                  <p>
                    Virginia's approach to real estate goes beyond just buying and selling homes. 
                    She believes in building lasting relationships with her clients, providing 
                    them with the knowledge, support, and guidance they need to make confident 
                    decisions about one of life's biggest investments.
                  </p>
                  
                  <p>
                    As a faith-based professional, Virginia operates with the highest standards 
                    of integrity and service. Her commitment to excellence is reflected in her 
                    track record of success and the countless satisfied families she has served 
                    throughout her career.
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-secondary-50 rounded-lg p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Get In Touch Today</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-secondary-600">
                    <PhoneIcon className="w-5 h-5 mr-3 text-primary-600" />
                    <span>(951) 555-0123</span>
                  </div>
                  <div className="flex items-center text-secondary-600">
                    <EnvelopeIcon className="w-5 h-5 mr-3 text-primary-600" />
                    <span>virginia@askforvirginia.com</span>
                  </div>
                  <div className="flex items-start text-secondary-600">
                    <MapPinIcon className="w-5 h-5 mr-3 mt-0.5 text-primary-600" />
                    <span>Serving Moreno Valley, Riverside, Corona, Brea & Fullerton</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-secondary-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Proven Track Record of Success
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Numbers don't lie - Virginia's dedication to excellence is reflected in her achievements
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="text-center p-8 bg-white rounded-lg shadow-soft"
              >
                <achievement.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {achievement.title}
                </h3>
                <p className="text-secondary-600">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Comprehensive Real Estate Services
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              From first-time buyers to seasoned investors, Virginia provides expert guidance 
              tailored to your unique needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-secondary-50 rounded-lg p-8"
              >
                <service.icon className="w-10 h-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-secondary-600 mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-secondary-600">
                      <CheckCircleIcon className="w-5 h-5 text-primary-600 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
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
              Local Market Expertise
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Deep knowledge of Southern California's most desirable communities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {serviceAreas.map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 text-center shadow-soft hover:shadow-medium transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {area.name}
                </h3>
                <p className="text-sm text-secondary-500 mb-2">
                  Population: {area.population}
                </p>
                <p className="text-sm text-primary-600 font-medium">
                  {area.specialty}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
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
              Ready to Start Your Real Estate Journey?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Whether you're buying your first home or selling your current one, 
              Virginia is here to guide you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-secondary"
              >
                Get Started Today
              </Link>
              <Link
                href="/properties"
                className="btn-outline-white"
              >
                View Available Properties
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}