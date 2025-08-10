import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  {
    name: 'Properties',
    href: '/properties',
    children: [
      { name: 'All Listings', href: '/properties' },
      { name: 'Featured Properties', href: '/properties?is_featured=true' },
      { name: 'New Listings', href: '/properties?sort=-created_at' },
      { name: 'Price Reduced', href: '/properties?sort=-updated_at' },
    ]
  },
  {
    name: 'The Market',
    href: '/market',
    children: [
      { name: 'Market Overview', href: '/market' },
      { name: 'Market Reports', href: '/market-reports' },
      { name: 'Price Trends', href: '/market#market-data' },
      { name: 'Market Analysis', href: '/contact?subject=market-info' },
    ]
  },
  {
    name: 'Services',
    href: '/about#services',
    children: [
      { name: 'Buyer Representation', href: '/about#services' },
      { name: 'Seller Representation', href: '/about#services' },
      { name: 'Investment Properties', href: '/about#services' },
      { name: 'First-Time Buyers', href: '/about#services' },
    ]
  },
  {
    name: 'Local Areas',
    href: '/community',
    children: [
      { name: 'Community Information', href: '/community' },
      { name: 'Local Events', href: '/community#events' },
      { name: 'Moreno Valley', href: '/properties?city=Moreno Valley' },
      { name: 'Riverside', href: '/properties?city=Riverside' },
      { name: 'Corona', href: '/properties?city=Corona' },
      { name: 'Brea', href: '/properties?city=Brea' },
      { name: 'Fullerton', href: '/properties?city=Fullerton' },
    ]
  },
  {
    name: 'Calculators',
    href: '/mortgage-calculator',
    children: [
      { name: 'Mortgage Calculator', href: '/mortgage-calculator' },
      { name: 'Affordability Calculator', href: '/affordability-calculator' },
      { name: 'Refinance Calculator', href: '/refinance-calculator' },
      { name: 'ARM Calculator', href: '/arm-calculator' },
      { name: 'Loan Comparison', href: '/loan-comparison' },
      { name: 'Extra Payments Calculator', href: '/extra-payments' },
      { name: 'Rent vs Buy Analysis', href: '/rent-vs-buy' },
      { name: 'Pre-Approval Estimator', href: '/pre-approval-estimator' },
      { name: 'Amortization Charts', href: '/amortization-charts' },
      { name: 'Property Affordability Analysis', href: '/property-affordability-analysis' },
    ]
  },
  {
    name: 'About',
    href: '/about',
    children: [
      { name: 'About Virginia', href: '/about' },
      { name: 'Our Services', href: '/about#services' },
      { name: 'Service Areas', href: '/about#service-areas' },
      { name: 'Contact Us', href: '/contact' },
    ]
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActivePath = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-safari shadow-medium' : 'bg-white/90'
    }`}>
      <nav className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-xl text-secondary-900">Virginia Hodges</div>
            <div className="text-sm text-secondary-600">Real Estate Expert</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1">
          {navigation.map((item) => (
            <div key={item.name} className="relative group">
              <Link
                href={item.href}
                className={`nav-link flex items-center space-x-1 ${
                  isActivePath(item.href) ? 'nav-link-active' : ''
                }`}
                onMouseEnter={() => setActiveDropdown(item.name)}
              >
                <span>{item.name}</span>
                {item.children && <ChevronDownIcon className="w-4 h-4" />}
              </Link>

              {/* Dropdown Menu */}
              {item.children && (
                <AnimatePresence>
                  {activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-strong border border-secondary-200 py-2 mt-2"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                            isActivePath(child.href)
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        {/* Contact Button & Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <Link href="/contact" className="hidden sm:inline-flex btn-primary">
            Contact Virginia
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-secondary-200"
          >
            <div className="container py-6">
              {navigation.map((item) => (
                <div key={item.name} className="mb-6">
                  <Link
                    href={item.href}
                    className={`block text-lg font-medium mb-3 ${
                      isActivePath(item.href) ? 'text-primary-600' : 'text-secondary-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.children && (
                    <div className="pl-4 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`block text-sm ${
                            isActivePath(child.href)
                              ? 'text-primary-600'
                              : 'text-secondary-600 hover:text-primary-600'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-6 border-t border-secondary-200">
                <Link
                  href="/contact"
                  className="btn-primary w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Virginia
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}