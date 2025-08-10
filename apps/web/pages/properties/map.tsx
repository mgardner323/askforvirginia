import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  ListBulletIcon,
  Squares2X2Icon,
  BookmarkIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';

// This would normally use a proper map library like Google Maps or Mapbox
// For demo purposes, we'll create a simplified map component
interface MapComponentProps {
  properties: Property[];
  center: { lat: number; lng: number };
  zoom: number;
  onPropertyClick: (property: Property) => void;
  selectedProperty?: Property;
}

interface Property {
  id: number;
  mls_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    coordinates: {
      lat: number;
      lng: number;
    };
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

interface SavedSearch {
  id: string;
  name: string;
  criteria: any;
  notifications: boolean;
}

interface Filters {
  city: string;
  min_price: string;
  max_price: string;
  bedrooms: string;
  bathrooms: string;
  property_type: string;
  square_feet_min: string;
  square_feet_max: string;
  year_built_min: string;
  year_built_max: string;
  features: string[];
  sort: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Simplified Map Component (replace with actual Google Maps/Mapbox)
const MapComponent: React.FC<MapComponentProps> = ({ 
  properties, 
  center, 
  zoom, 
  onPropertyClick, 
  selectedProperty 
}) => {
  return (
    <div className="relative w-full h-full bg-secondary-100 rounded-lg overflow-hidden">
      {/* Map Background - This would be replaced with actual map */}
      <div 
        className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {/* Property Markers */}
        {properties.map((property, index) => (
          <div
            key={property.id}
            className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 ${
              selectedProperty?.id === property.id ? 'scale-125 z-20' : 'z-10 hover:scale-110'
            }`}
            style={{
              left: `${((property.address.coordinates.lng + 117.5) / 1.5) * 100}%`,
              top: `${(1 - ((property.address.coordinates.lat - 33.5) / 1.0)) * 100}%`
            }}
            onClick={() => onPropertyClick(property)}
          >
            <div className={`relative ${
              selectedProperty?.id === property.id ? 'z-20' : ''
            }`}>
              {/* Price Marker */}
              <div className={`px-3 py-2 rounded-lg shadow-medium text-sm font-semibold text-white transition-colors duration-200 ${
                property.is_featured 
                  ? 'bg-yellow-500' 
                  : selectedProperty?.id === property.id 
                    ? 'bg-primary-700' 
                    : 'bg-primary-600 hover:bg-primary-700'
              }`}>
                ${(property.property_details.price / 1000).toFixed(0)}K
              </div>
              {/* Marker Arrow */}
              <div className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
                property.is_featured 
                  ? 'border-t-yellow-500' 
                  : selectedProperty?.id === property.id 
                    ? 'border-t-primary-700' 
                    : 'border-t-primary-600'
              }`} style={{ borderTopWidth: '8px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="p-2 bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="p-2 bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-soft">
        <div className="text-xs font-medium text-secondary-700 mb-2">Legend</div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary-600 rounded"></div>
            <span>Regular</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Featured</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PropertiesMapView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'grid'>('map');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveSearch, setShowSaveSearch] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    city: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    bathrooms: '',
    property_type: '',
    square_feet_min: '',
    square_feet_max: '',
    year_built_min: '',
    year_built_max: '',
    features: [],
    sort: '-created_at'
  });

  const [mapCenter, setMapCenter] = useState({ lat: 33.9425, lng: -117.2297 }); // Riverside County center

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: 'active',
        limit: '100', // Load more for map view
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== '' && value !== undefined && !Array.isArray(value)
          )
        )
      });

      if (filters.features.length > 0) {
        params.append('features', filters.features.join(','));
      }

      const response = await fetch(`/api/properties?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.data?.properties || []);
        
        // Update map center based on first property if available
        if (data.data?.properties?.length > 0 && data.data.properties[0].address.coordinates) {
          setMapCenter({
            lat: data.data.properties[0].address.coordinates.lat,
            lng: data.data.properties[0].address.coordinates.lng
          });
        }
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      property_type: '',
      square_feet_min: '',
      square_feet_max: '',
      year_built_min: '',
      year_built_max: '',
      features: [],
      sort: '-created_at'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPrimaryImage = (images: Property['images']) => {
    const primary = images.find(img => img.is_primary);
    return primary?.url || images[0]?.url || '/images/placeholder-property.jpg';
  };

  const handleSaveSearch = async () => {
    const searchName = prompt('Enter a name for this search:');
    if (!searchName) return;

    const search: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      criteria: filters,
      notifications: true
    };

    setSavedSearches(prev => [...prev, search]);
    setShowSaveSearch(false);

    // In a real app, this would save to the backend
    console.log('Saved search:', search);
  };

  const featureOptions = [
    'Pool', 'Spa', 'Fireplace', 'Garage', 'Balcony', 'Patio', 'Deck',
    'Hardwood Floors', 'Granite Counters', 'Stainless Appliances', 
    'Updated Kitchen', 'View', 'Gated Community', 'Security System'
  ];

  return (
    <Layout
      title="Properties Map View - Interactive Property Search"
      description="Explore properties on an interactive map with advanced search filters. Find homes in Moreno Valley, Riverside, Corona, Brea, and Fullerton."
    >
      {/* Header */}
      <section className="py-6 bg-white border-b border-secondary-200">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Property Map Search
              </h1>
              <p className="text-secondary-600">
                {loading ? 'Loading properties...' : `${properties.length} properties found`}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'map' 
                      ? 'bg-white text-primary-600 shadow-soft' 
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <MapPinIcon className="w-5 h-5 inline mr-2" />
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-primary-600 shadow-soft' 
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <ListBulletIcon className="w-5 h-5 inline mr-2" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-primary-600 shadow-soft' 
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5 inline mr-2" />
                  Grid
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center gap-2 ${showFilters ? 'bg-primary-50 border-primary-200' : ''}`}
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex h-screen">
        {/* Filters Sidebar */}
        {showFilters && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '320px' }}
            exit={{ width: 0 }}
            className="bg-white border-r border-secondary-200 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Location Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="City, neighborhood, or ZIP code..."
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="1.5">1.5+</option>
                    <option value="2">2+</option>
                    <option value="2.5">2.5+</option>
                    <option value="3">3+</option>
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.property_type}
                  onChange={(e) => handleFilterChange('property_type', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="single_family">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="multi_family">Multi Family</option>
                </select>
              </div>

              {/* Square Footage */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Square Footage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Sq Ft"
                    value={filters.square_feet_min}
                    onChange={(e) => handleFilterChange('square_feet_min', e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Sq Ft"
                    value={filters.square_feet_max}
                    onChange={(e) => handleFilterChange('square_feet_max', e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Features
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 border border-secondary-200 rounded-md">
                  {featureOptions.map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('features', [...filters.features, feature]);
                          } else {
                            handleFilterChange('features', filters.features.filter(f => f !== feature));
                          }
                        }}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-secondary-200">
                <button
                  onClick={handleSaveSearch}
                  className="w-full btn-outline flex items-center justify-center gap-2"
                >
                  <BookmarkIcon className="w-5 h-5" />
                  Save Search
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>

              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-700 mb-2">Saved Searches</h3>
                  <div className="space-y-2">
                    {savedSearches.map((search) => (
                      <div key={search.id} className="flex items-center justify-between p-2 bg-secondary-50 rounded-md">
                        <div>
                          <div className="text-sm font-medium">{search.name}</div>
                          <div className="text-xs text-secondary-500">
                            Notifications: {search.notifications ? 'On' : 'Off'}
                          </div>
                        </div>
                        <button
                          onClick={() => setFilters(search.criteria)}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 relative">
          {viewMode === 'map' ? (
            <MapComponent
              properties={properties}
              center={mapCenter}
              zoom={10}
              onPropertyClick={setSelectedProperty}
              selectedProperty={selectedProperty}
            />
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              {viewMode === 'list' ? (
                // List View
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow-soft border border-secondary-200 p-6 hover:shadow-medium transition-shadow duration-200">
                      <div className="flex gap-6">
                        <div className="w-32 h-24 flex-shrink-0">
                          <img
                            src={getPrimaryImage(property.images)}
                            alt={property.address.street}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-secondary-900">
                                {formatPrice(property.property_details.price)}
                              </h3>
                              <p className="text-secondary-600">
                                {property.address.street}, {property.address.city}, {property.address.state}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-secondary-600">
                                {property.property_details.bedrooms && (
                                  <span>{property.property_details.bedrooms} beds</span>
                                )}
                                {property.property_details.bathrooms && (
                                  <span>{property.property_details.bathrooms} baths</span>
                                )}
                                {property.property_details.square_feet && (
                                  <span>{property.property_details.square_feet.toLocaleString()} sqft</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-secondary-50 rounded-lg transition-colors duration-200">
                                <HeartIcon className="w-5 h-5 text-secondary-400" />
                              </button>
                              <button className="p-2 hover:bg-secondary-50 rounded-lg transition-colors duration-200">
                                <EyeIcon className="w-5 h-5 text-secondary-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200 overflow-hidden">
                      <div className="relative">
                        <img
                          src={getPrimaryImage(property.images)}
                          alt={property.address.street}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button className="p-2 bg-white rounded-full shadow-soft">
                            <HeartIcon className="w-5 h-5 text-secondary-600" />
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-secondary-900 font-bold text-lg rounded">
                            {formatPrice(property.property_details.price)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-secondary-900 mb-2">
                          {property.address.street}
                        </h3>
                        <p className="text-secondary-600 text-sm mb-4">
                          {property.address.city}, {property.address.state}
                        </p>
                        <div className="flex items-center justify-between text-sm text-secondary-600">
                          <div className="flex gap-3">
                            {property.property_details.bedrooms && (
                              <span>{property.property_details.bedrooms} beds</span>
                            )}
                            {property.property_details.bathrooms && (
                              <span>{property.property_details.bathrooms} baths</span>
                            )}
                          </div>
                          {property.property_details.square_feet && (
                            <span>{property.property_details.square_feet.toLocaleString()} sqft</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Property Details Panel */}
          {selectedProperty && viewMode === 'map' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-6 right-6 bg-white rounded-lg shadow-strong p-6 max-w-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900">
                    {formatPrice(selectedProperty.property_details.price)}
                  </h3>
                  <p className="text-secondary-600">
                    {selectedProperty.address.street}, {selectedProperty.address.city}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProperty(undefined)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <img
                  src={getPrimaryImage(selectedProperty.images)}
                  alt={selectedProperty.address.street}
                  className="w-20 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-secondary-600 mb-2">
                    {selectedProperty.property_details.bedrooms && (
                      <span>{selectedProperty.property_details.bedrooms} beds</span>
                    )}
                    {selectedProperty.property_details.bathrooms && (
                      <span>{selectedProperty.property_details.bathrooms} baths</span>
                    )}
                    {selectedProperty.property_details.square_feet && (
                      <span>{selectedProperty.property_details.square_feet.toLocaleString()} sqft</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm">View Details</button>
                    <button className="btn-outline text-sm">Save</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}