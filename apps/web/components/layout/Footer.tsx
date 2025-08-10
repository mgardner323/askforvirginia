import React from 'react';
import Link from 'next/link';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

const footerNavigation = {
  properties: [
    { name: 'Search Properties', href: '/properties' },
    { name: 'Featured Listings', href: '/properties?featured=true' },
    { name: 'New Listings', href: '/properties?sort=newest' },
    { name: 'Open Houses', href: '/open-houses' },
  ],
  areas: [
    { name: 'Moreno Valley', href: '/areas/moreno-valley' },
    { name: 'Riverside', href: '/areas/riverside' },
    { name: 'Corona', href: '/areas/corona' },
    { name: 'Brea', href: '/areas/brea' },
    { name: 'Fullerton', href: '/areas/fullerton' },
  ],
  services: [
    { name: 'Buying Process', href: '/buying-process' },
    { name: 'Selling Process', href: '/selling-process' },
    { name: 'Market Analysis', href: '/market-analysis' },
    { name: 'Investment Properties', href: '/investment-properties' },
  ],
  resources: [
    { name: 'Real Estate News', href: '/blog' },
    { name: 'Market Reports', href: '/market-reports' },
    { name: 'Mortgage Calculator', href: '/calculator' },
    { name: 'First-Time Buyers Guide', href: '/first-time-buyers' },
  ],
};

const contactInfo = {
  phone: '(951) 555-0123',
  email: 'virginia@askforvirginia.com',
  address: 'Moreno Valley, CA',
  license: 'CA DRE# 12345678'
};

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <div className="font-bold text-xl">Virginia Hodges</div>
                  <div className="text-secondary-400 text-sm">Real Estate Expert</div>
                </div>
              </div>
              
              <p className="text-secondary-300 mb-6 max-w-md">
                Serving Christ graciously while helping families find their perfect home 
                in Southern California. Your trusted real estate partner with local expertise 
                and personalized service.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-secondary-300">{contactInfo.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="text-secondary-300 hover:text-white transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="text-secondary-300 hover:text-white transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="text-secondary-400 text-sm">{contactInfo.license}</span>
                </div>
              </div>
            </div>

            {/* Navigation Columns */}
            <div>
              <h3 className="font-semibold text-white mb-4">Properties</h3>
              <ul className="space-y-2">
                {footerNavigation.properties.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Local Areas</h3>
              <ul className="space-y-2">
                {footerNavigation.areas.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2 mb-6">
                {footerNavigation.services.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerNavigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-secondary-300 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-secondary-400">
              <p>&copy; {currentYear} Virginia Hodges Real Estate. All rights reserved.</p>
              <div className="flex items-center space-x-6">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/accessibility" className="hover:text-white transition-colors">
                  Accessibility
                </Link>
              </div>
            </div>

            <div className="text-sm text-secondary-400">
              <p>Equal Housing Opportunity</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}