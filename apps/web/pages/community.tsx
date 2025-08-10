import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import {
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  HeartIcon,
  ShoppingBagIcon,
  MusicalNoteIcon,
  SunIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';

interface CommunityEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'education' | 'community' | 'business' | 'entertainment' | 'family' | 'health';
  organizer: string;
  isRecurring: boolean;
  image?: string;
}

interface CommunityInfo {
  name: string;
  description: string;
  population: string;
  medianHome: string;
  schools: string;
  highlights: string[];
  image: string;
}

const communities: CommunityInfo[] = [
  {
    name: "Moreno Valley",
    description: "A vibrant city in Riverside County offering family-friendly neighborhoods, excellent schools, and beautiful mountain views.",
    population: "208,634",
    medianHome: "$425,000",
    schools: "A+ rated schools",
    highlights: [
      "March Field Air Museum",
      "Lake Perris State Recreation Area nearby",
      "TownGate Memorial Park",
      "Shopping at Moreno Valley Mall"
    ],
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Riverside",
    description: "Historic city known for its citrus heritage, UC Riverside campus, and beautiful Mission Inn Hotel & Spa.",
    population: "331,360",
    medianHome: "$520,000",
    schools: "Top-rated districts",
    highlights: [
      "Mission Inn Hotel & Spa",
      "UC Riverside campus",
      "Riverside Art Museum",
      "Mount Rubidoux hiking trail"
    ],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Corona",
    description: "Known as the 'Circle City' for its unique street layout, Corona offers great amenities and proximity to both LA and San Diego.",
    population: "157,136",
    medianHome: "$650,000",
    schools: "Excellent school system",
    highlights: [
      "Corona Historic Civic Center",
      "Santana Regional Park",
      "Glen Ivy Hot Springs nearby",
      "Tom's Farms entertainment complex"
    ],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  }
];

const sampleEvents: CommunityEvent[] = [
  {
    id: 1,
    title: "Riverside Farmers Market",
    description: "Fresh local produce, artisanal goods, and community vendors every Saturday morning.",
    date: "2025-08-16",
    time: "8:00 AM - 1:00 PM",
    location: "Riverside Downtown Plaza",
    category: "community",
    organizer: "Riverside Chamber of Commerce",
    isRecurring: true,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 2,
    title: "Home Buying Workshop",
    description: "Free educational seminar covering the home buying process, financing options, and market trends.",
    date: "2025-08-20",
    time: "6:00 PM - 8:00 PM",
    location: "Moreno Valley Community Center",
    category: "education",
    organizer: "Virginia Hodges Real Estate",
    isRecurring: false,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 3,
    title: "Corona Summer Concert Series",
    description: "Live music performances featuring local and touring acts in the beautiful Corona Civic Center.",
    date: "2025-08-23",
    time: "7:00 PM - 9:30 PM",
    location: "Corona Civic Center",
    category: "entertainment",
    organizer: "Corona Parks & Recreation",
    isRecurring: true,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 4,
    title: "Family Fun Day at Lake Perris",
    description: "Swimming, boating, hiking, and family activities at one of Southern California's premier lakes.",
    date: "2025-08-24",
    time: "10:00 AM - 4:00 PM",
    location: "Lake Perris State Recreation Area",
    category: "family",
    organizer: "California State Parks",
    isRecurring: false,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 5,
    title: "Business Networking Breakfast",
    description: "Monthly networking event for local business owners, entrepreneurs, and professionals.",
    date: "2025-08-28",
    time: "7:30 AM - 9:00 AM",
    location: "Mission Inn Hotel & Spa",
    category: "business",
    organizer: "Riverside Business Association",
    isRecurring: true,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: 6,
    title: "Community Health Fair",
    description: "Free health screenings, wellness information, and resources from local healthcare providers.",
    date: "2025-08-30",
    time: "9:00 AM - 3:00 PM",
    location: "Moreno Valley Mall",
    category: "health",
    organizer: "Riverside County Health Department",
    isRecurring: false,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  }
];

const categoryIcons = {
  education: AcademicCapIcon,
  community: UserGroupIcon,
  business: PresentationChartBarIcon,
  entertainment: MusicalNoteIcon,
  family: HeartIcon,
  health: HeartIcon
};

const categoryColors = {
  education: 'bg-blue-100 text-blue-800',
  community: 'bg-green-100 text-green-800',
  business: 'bg-purple-100 text-purple-800',
  entertainment: 'bg-pink-100 text-pink-800',
  family: 'bg-orange-100 text-orange-800',
  health: 'bg-red-100 text-red-800'
};

export default function CommunityPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading events
    setTimeout(() => {
      setEvents(sampleEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const categories = [
    { key: 'all', label: 'All Events', count: events.length },
    { key: 'community', label: 'Community', count: events.filter(e => e.category === 'community').length },
    { key: 'education', label: 'Education', count: events.filter(e => e.category === 'education').length },
    { key: 'business', label: 'Business', count: events.filter(e => e.category === 'business').length },
    { key: 'entertainment', label: 'Entertainment', count: events.filter(e => e.category === 'entertainment').length },
    { key: 'family', label: 'Family', count: events.filter(e => e.category === 'family').length },
    { key: 'health', label: 'Health', count: events.filter(e => e.category === 'health').length }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <Head>
        <title>Community Information & Events | Virginia Hodges Real Estate</title>
        <meta 
          name="description" 
          content="Discover community events, local information, and what makes Southern California neighborhoods special. Stay connected with your community." 
        />
        <meta name="keywords" content="community events, Riverside County, Moreno Valley, Corona, local events, community information" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary-600 to-primary-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="heading-xl text-white mb-6">
                Community Information & Events
              </h1>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Discover what makes Southern California communities special. Stay connected with local events, 
                resources, and the vibrant neighborhoods we serve.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Communities Overview */}
        <section className="py-16 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="heading-lg text-secondary-900 mb-4">Our Communities</h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Each community we serve has its own unique character, amenities, and charm. 
                Explore what makes these areas perfect places to call home.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {communities.map((community, index) => (
                <motion.div
                  key={community.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-strong transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={community.image}
                      alt={community.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                      {community.name}
                    </h3>
                    <p className="text-secondary-600 mb-4 leading-relaxed">
                      {community.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-secondary-500">Population:</span>
                        <div className="font-semibold text-secondary-900">{community.population}</div>
                      </div>
                      <div>
                        <span className="text-secondary-500">Median Home:</span>
                        <div className="font-semibold text-secondary-900">{community.medianHome}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-secondary-500">Schools:</span>
                        <div className="font-semibold text-secondary-900">{community.schools}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-2">Community Highlights:</h4>
                      <ul className="text-sm text-secondary-600 space-y-1">
                        {community.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-16 bg-secondary-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="heading-lg text-secondary-900 mb-4">Community Events</h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Stay connected with local happenings, educational workshops, and community gatherings. 
                Your participation makes our communities stronger.
              </p>
            </motion.div>

            {/* Event Categories Filter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.key
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'bg-white text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </motion.div>

            {/* Events Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => {
                  const IconComponent = categoryIcons[event.category];
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-strong transition-all duration-300"
                    >
                      {event.image && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[event.category]}`}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </span>
                          {event.isRecurring && (
                            <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded">
                              Recurring
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-secondary-900 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-secondary-600 mb-4 leading-relaxed">
                          {event.description}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-secondary-600">
                            <CalendarDaysIcon className="w-4 h-4 mr-2 text-primary-500" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center text-secondary-600">
                            <ClockIcon className="w-4 h-4 mr-2 text-primary-500" />
                            {event.time}
                          </div>
                          <div className="flex items-center text-secondary-600">
                            <MapPinIcon className="w-4 h-4 mr-2 text-primary-500" />
                            {event.location}
                          </div>
                          <div className="flex items-center text-secondary-600">
                            <UserGroupIcon className="w-4 h-4 mr-2 text-primary-500" />
                            {event.organizer}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-12">
                <CalendarDaysIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  No events found
                </h3>
                <p className="text-secondary-600">
                  No events match your selected category. Try selecting a different category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Community Resources */}
        <section className="py-16 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="heading-lg text-secondary-900 mb-4">Community Resources</h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Essential resources and services to help you navigate and enjoy your community.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Schools & Education",
                  description: "Information about local schools, districts, and educational programs.",
                  icon: AcademicCapIcon,
                  color: "bg-blue-500"
                },
                {
                  title: "Healthcare Services", 
                  description: "Hospitals, clinics, and healthcare providers in your area.",
                  icon: HeartIcon,
                  color: "bg-red-500"
                },
                {
                  title: "Shopping & Dining",
                  description: "Local businesses, restaurants, and shopping centers.",
                  icon: ShoppingBagIcon,
                  color: "bg-green-500"
                },
                {
                  title: "Recreation & Parks",
                  description: "Parks, trails, recreational facilities, and outdoor activities.",
                  icon: SunIcon,
                  color: "bg-orange-500"
                }
              ].map((resource, index) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className={`inline-flex p-4 rounded-full ${resource.color} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <resource.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-secondary-600">
                    {resource.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-primary-600">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="heading-lg text-white mb-4">
                Questions About Our Communities?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                As your local real estate expert, I'm here to help you understand everything 
                these wonderful communities have to offer.
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Contact Virginia Today
              </motion.a>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
}