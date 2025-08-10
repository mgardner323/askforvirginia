import React from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const services = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Property Search',
    description: 'Find your perfect home with our advanced search tools and local market expertise.',
    features: ['Personalized recommendations', 'Market analysis', 'Neighborhood insights']
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Home Valuation',
    description: 'Get accurate property valuations using the latest market data and trends.',
    features: ['Free market analysis', 'Competitive pricing', 'Investment potential']
  },
  {
    icon: UserGroupIcon,
    title: 'Buyer Representation',
    description: 'Expert guidance through the entire home buying process from start to finish.',
    features: ['Negotiation expertise', 'Contract assistance', 'Closing support']
  },
  {
    icon: HomeIcon,
    title: 'Seller Services',
    description: 'Maximize your home\'s value with our comprehensive selling strategy.',
    features: ['Professional staging advice', 'Marketing strategy', 'Price optimization']
  },
  {
    icon: DocumentTextIcon,
    title: 'Market Reports',
    description: 'Stay informed with detailed market analysis and trend reports.',
    features: ['Monthly updates', 'Area-specific data', 'Investment insights']
  },
  {
    icon: ShieldCheckIcon,
    title: 'Client Protection',
    description: 'Your interests are protected with our commitment to ethical practices.',
    features: ['Transparent process', 'Legal compliance', 'Confidentiality']
  }
];

const ServicesOverview: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Real Estate Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From first-time homebuyers to seasoned investors, we provide personalized service 
            and expert guidance for all your real estate needs in Southern California.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                  <service.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Real Estate Journey?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Let's discuss your goals and create a personalized strategy to help you achieve them. 
              Contact us today for a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1234567890"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Call (123) 456-7890
              </a>
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
              >
                Schedule Consultation
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesOverview;