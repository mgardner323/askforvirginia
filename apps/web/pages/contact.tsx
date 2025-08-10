import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import Head from 'next/head';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import {
  ChatBubbleLeftRightIcon,
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferred_contact: string;
}

// Declare global grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferred_contact: 'email'
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const recaptchaRef = useRef<any>(null);

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setRecaptchaLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (recaptchaLoaded && window.grecaptcha && recaptchaRef.current) {
      try {
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test key
          theme: 'light',
          size: 'normal'
        });
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    }
  }, [recaptchaLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Get reCAPTCHA token
    let recaptchaToken = null;
    if (window.grecaptcha && recaptchaRef.current) {
      try {
        recaptchaToken = window.grecaptcha.getResponse();
        if (!recaptchaToken) {
          setStatus('error');
          setErrorMessage('Please complete the reCAPTCHA verification.');
          return;
        }
      } catch (error) {
        console.error('reCAPTCHA error:', error);
        setStatus('error');
        setErrorMessage('reCAPTCHA verification failed. Please try again.');
        return;
      }
    }

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptcha_token: recaptchaToken
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          preferred_contact: 'email'
        });
        
        // Reset reCAPTCHA
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      
      // Reset reCAPTCHA on error
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
    }
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      label: 'Phone',
      value: '(951) 555-0123',
      href: 'tel:+19515550123',
      description: 'Call or text anytime'
    },
    {
      icon: EnvelopeIcon,
      label: 'Email',
      value: 'virginia@askforvirginia.com',
      href: 'mailto:virginia@askforvirginia.com',
      description: 'Quick response guaranteed'
    },
    {
      icon: MapPinIcon,
      label: 'Service Areas',
      value: 'Moreno Valley, Riverside, Corona, Brea, Fullerton',
      href: null,
      description: 'Serving all of Riverside & Orange County'
    },
    {
      icon: ClockIcon,
      label: 'Availability',
      value: 'Monday - Sunday: 8AM - 8PM',
      href: null,
      description: 'Available 7 days a week'
    }
  ];

  const serviceCards = [
    {
      icon: HomeIcon,
      title: 'Home Buying',
      description: 'Find your perfect home with expert guidance and local market knowledge.',
      features: ['Property Search', 'Market Analysis', 'Negotiation Support', 'Closing Assistance']
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Home Selling',
      description: 'Sell your home quickly and for the best price with comprehensive marketing.',
      features: ['Free Home Valuation', 'Professional Photography', 'Marketing Strategy', 'Open Houses']
    },
    {
      icon: DocumentTextIcon,
      title: 'Market Reports',
      description: 'Stay informed with detailed market analysis and neighborhood insights.',
      features: ['Monthly Reports', 'Price Trends', 'Investment Analysis', 'Area Statistics']
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Consultation',
      description: 'Get personalized advice on your real estate goals and market opportunities.',
      features: ['Strategy Planning', 'Timeline Development', 'Goal Setting', 'Action Plan']
    }
  ];

  const officeLocations = [
    {
      name: 'Main Office',
      address: '12345 Main Street, Suite 100\nMoreno Valley, CA 92553',
      phone: '(951) 555-0123',
      hours: 'Mon-Fri: 9AM-6PM\nSat-Sun: 10AM-4PM'
    }
  ];

  return (
    <Layout
      title="Contact Virginia Hodges - Get Started Today"
      description="Contact Virginia Hodges for expert real estate services in Moreno Valley, Riverside, Corona, Brea, and Fullerton. Quick response guaranteed. Available 7 days a week."
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
              Get In Touch Today
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Ready to start your real estate journey? Virginia is here to help 
              you every step of the way with personalized service and expert guidance.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="#contact-form" className="btn-secondary">
                Send a Message
              </a>
              <a href="tel:+19515550123" className="btn-outline-white">
                Call Now: (951) 555-0123
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
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
              Multiple Ways to Connect
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Choose the method that works best for you - we're available when you need us
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-8 text-center shadow-soft hover:shadow-medium transition-shadow duration-200"
              >
                <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {item.label}
                </h3>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-primary-600 hover:text-primary-700 font-medium block mb-2 transition-colors duration-200"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-secondary-900 font-medium mb-2">{item.value}</p>
                )}
                <p className="text-sm text-secondary-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              How Can We Help You?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              From buying your first home to selling an investment property, 
              we provide comprehensive real estate services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceCards.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-secondary-50 rounded-lg p-8 hover:bg-secondary-100 transition-colors duration-200"
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

      {/* Contact Form and Office Info */}
      <section id="contact-form" className="py-20 bg-secondary-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-8 shadow-soft"
              >
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                  Send Us a Message
                </h2>

                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg flex items-center space-x-3"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-900">Message Sent!</h4>
                      <p className="text-sm text-green-700">
                        Thank you for contacting us. We'll get back to you within 1 hour!
                      </p>
                    </div>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg flex items-center space-x-3"
                  >
                    <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-900">Error</h4>
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="(951) 555-0123"
                      />
                    </div>
                    <div>
                      <label htmlFor="preferred_contact" className="block text-sm font-medium text-secondary-700 mb-2">
                        Preferred Contact
                      </label>
                      <select
                        id="preferred_contact"
                        name="preferred_contact"
                        value={formData.preferred_contact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="text">Text Message</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                      How can we help? *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    >
                      <option value="">Select a topic</option>
                      <option value="buying">I'm looking to buy a home</option>
                      <option value="selling">I want to sell my home</option>
                      <option value="valuation">Free home valuation</option>
                      <option value="consultation">Schedule a consultation</option>
                      <option value="market-info">Market information</option>
                      <option value="investment">Investment properties</option>
                      <option value="other">Other questions</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
                      Tell us more *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      placeholder="Tell us about your real estate goals, timeline, budget, or any specific questions you have..."
                    ></textarea>
                  </div>

                  {/* reCAPTCHA */}
                  <div className="flex flex-col items-center">
                    <div 
                      ref={recaptchaRef}
                      className="mb-4"
                    ></div>
                    {!recaptchaLoaded && (
                      <div className="text-sm text-secondary-500 mb-4">
                        Loading security verification...
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading' || !recaptchaLoaded}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Office Information */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Response Promise */}
                <div className="bg-white rounded-lg p-6 shadow-soft">
                  <h3 className="font-semibold text-secondary-900 mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    Our Response Promise
                  </h3>
                  <ul className="space-y-3 text-sm text-secondary-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Response within 1 hour during business hours</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Available 7 days a week for urgent matters</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Free consultation and market analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Personalized service for every client</span>
                    </li>
                  </ul>
                </div>

                {/* Office Location */}
                <div className="bg-white rounded-lg p-6 shadow-soft">
                  <h3 className="font-semibold text-secondary-900 mb-4 flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-primary-600 mr-2" />
                    Office Location
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-secondary-600 whitespace-pre-line">
                        12345 Main Street, Suite 100{'\n'}Moreno Valley, CA 92553
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600">
                      <ClockIcon className="w-4 h-4 text-primary-600 mr-2" />
                      <span className="whitespace-pre-line">
                        Mon-Fri: 9AM-6PM{'\n'}Sat-Sun: 10AM-4PM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-primary-50 rounded-lg p-6">
                  <h3 className="font-semibold text-secondary-900 mb-4 flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 text-primary-600 mr-2" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+19515550123"
                      className="block w-full text-center btn-primary"
                    >
                      Call Now
                    </a>
                    <a
                      href="mailto:virginia@askforvirginia.com"
                      className="block w-full text-center btn-outline"
                    >
                      Send Email
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}