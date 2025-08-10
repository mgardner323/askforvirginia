import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  StarIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import {
  BedIcon,
  BathIcon,
  ViewfinderCircleIcon
} from '@heroicons/react/24/solid';

interface Property {
  id: number;
  mls_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
  property_details: {
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    type: string;
    status: string;
    property_type: string;
  };
  images: Array<{
    url: string;
    alt: string;
    is_primary: boolean;
  }>;
  seo: {
    slug: string;
  };
  is_featured: boolean;
  created_at: string;
}

interface Filters {
  city: string;
  min_price: string;
  max_price: string;
  bedrooms: string;
  bathrooms: string;
  property_type: string;
  sort: string;
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState<Filters>({
    city: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
    property_type: '',
    sort: '-created_at'
  });

  useEffect(() => {
    fetchProperties();
  }, [filters, pagination.page]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'active',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/properties?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.data?.properties || []);
        setPagination(prev => ({
          ...prev,
          total: data.data?.pagination?.total || 0,
          totalPages: data.data?.pagination?.totalPages || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      property_type: '',
      sort: '-created_at'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatSquareFeet = (sqft?: number) => {
    if (!sqft) return 'N/A';
    return new Intl.NumberFormat('en-US').format(sqft) + ' sqft';
  };

  const getPrimaryImage = (images: Property['images']) => {
    const primary = images.find(img => img.is_primary);
    return primary?.url || images[0]?.url || '/images/placeholder-property.jpg';
  };

  const formatPropertyType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isNewListing = (createdDate: string) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const cities = ['Moreno Valley', 'Riverside', 'Corona', 'Brea', 'Fullerton'];
  const priceRanges = [
    { label: 'Any Price', value: '' },
    { label: 'Under $400K', min: '', max: '400000' },
    { label: '$400K - $600K', min: '400000', max: '600000' },
    { label: '$600K - $800K', min: '600000', max: '800000' },
    { label: '$800K - $1M', min: '800000', max: '1000000' },
    { label: 'Over $1M', min: '1000000', max: '' },
  ];

  return (
    <Layout
      title="New Listings - Find Your Dream Home Today"
      description="Browse the latest property listings in Moreno Valley, Riverside, Corona, Brea, and Fullerton. Find single-family homes, condos, townhouses, and more."
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
              Find Your Dream Home
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Browse our latest listings across Southern California's most desirable communities. 
              Your perfect home is waiting for you.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search by city, neighborhood, or ZIP code..."
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg border border-secondary-300 text-secondary-900 placeholder-secondary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      {showFilters && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="py-8 bg-white border-b border-secondary-200"
        >
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Price Range
                </label>
                <select
                  value={`${filters.min_price}-${filters.max_price}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-');
                    handleFilterChange('min_price', min);
                    handleFilterChange('max_price', max);
                  }}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {priceRanges.map((range, index) => (
                    <option key={index} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Bathrooms
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="1.5">1.5+</option>
                  <option value="2">2+</option>
                  <option value="2.5">2.5+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.property_type}
                  onChange={(e) => handleFilterChange('property_type', e.target.value)}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="single_family">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="multi_family">Multi Family</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-secondary-600">
                  Sort by:
                </span>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="property_details.price">Price: Low to High</option>
                  <option value="-property_details.price">Price: High to Low</option>
                  <option value="address.city">City A-Z</option>
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Results Header */}
      <section className="py-8 bg-secondary-50">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">
                {loading ? 'Loading Properties...' : `${pagination.total} Properties Found`}
              </h2>
              <p className="text-secondary-600">
                Showing page {pagination.page} of {pagination.totalPages}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Grid */}
      <section className="py-12 bg-white">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-soft animate-pulse">
                  <div className="h-64 bg-secondary-300 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-secondary-300 rounded mb-2"></div>
                    <div className="h-4 bg-secondary-300 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-secondary-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * (index % 4) }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 group overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={getPrimaryImage(property.images)}
                        alt={`${property.address.street}, ${property.address.city}`}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {property.is_featured && (
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded">
                            Featured
                          </span>
                        )}
                        {isNewListing(property.created_at) && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                            New
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-2 bg-white rounded-full shadow-soft hover:bg-secondary-50 transition-colors duration-200">
                          <HeartIcon className="w-5 h-5 text-secondary-600" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-secondary-900 font-bold text-lg rounded">
                          {formatPrice(property.property_details.price)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Address */}
                      <div className="flex items-start mb-3">
                        <MapPinIcon className="w-5 h-5 text-secondary-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200">
                            {property.address.street}
                          </h3>
                          <p className="text-secondary-600 text-sm">
                            {property.address.city}, {property.address.state} {property.address.zip_code}
                          </p>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="flex items-center justify-between text-sm text-secondary-600 mb-4">
                        <div className="flex items-center gap-4">
                          {property.property_details.bedrooms && (
                            <div className="flex items-center">
                              <HomeIcon className="w-4 h-4 mr-1" />
                              {property.property_details.bedrooms} bed
                            </div>
                          )}
                          {property.property_details.bathrooms && (
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-1">🛁</span>
                              {property.property_details.bathrooms} bath
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Property Type and Square Feet */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded">
                          {formatPropertyType(property.property_details.property_type)}
                        </span>
                        {property.property_details.square_feet && (
                          <span className="text-secondary-600">
                            {formatSquareFeet(property.property_details.square_feet)}
                          </span>
                        )}
                      </div>

                      {/* View Details Button */}
                      <Link
                        href={`/properties/${property.seo.slug}`}
                        className="block w-full text-center btn-primary"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(pagination.totalPages)].slice(
                        Math.max(0, pagination.page - 3),
                        Math.min(pagination.totalPages, pagination.page + 2)
                      ).map((_, index) => {
                        const pageNum = Math.max(0, pagination.page - 3) + index + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`px-3 py-2 rounded-md ${
                              pageNum === pagination.page
                                ? 'bg-primary-600 text-white'
                                : 'hover:bg-secondary-50 text-secondary-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <HomeIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Properties Found</h3>
              <p className="text-secondary-600 max-w-md mx-auto mb-6">
                We couldn't find any properties matching your criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Clear All Filters
              </button>
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
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Let Virginia help you find the perfect property. Get personalized recommendations 
              based on your specific needs and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact?subject=buying"
                className="btn-secondary"
              >
                Get Personal Assistance
              </Link>
              <Link
                href="/contact?subject=consultation"
                className="btn-outline-white"
              >
                Schedule Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}