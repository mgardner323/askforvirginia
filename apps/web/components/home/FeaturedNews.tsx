import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  NewspaperIcon,
  CalendarIcon,
  UserIcon,
  ArrowRightIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface FeaturedNewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: {
    url: string;
    alt: string;
  };
  publish_date: string;
  analytics: {
    views: number;
    clicks: number;
  };
  creator: {
    id: number;
    profile: {
      first_name: string;
      last_name: string;
    };
  };
  readingTime: number;
}

interface FeaturedNewsProps {
  className?: string;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  'market-update': { label: 'Market Update', color: 'bg-blue-100 text-blue-800' },
  'neighborhood-spotlight': { label: 'Neighborhood', color: 'bg-green-100 text-green-800' },
  'buying-tips': { label: 'Buying Tips', color: 'bg-purple-100 text-purple-800' },
  'selling-tips': { label: 'Selling Tips', color: 'bg-orange-100 text-orange-800' },
  'investment': { label: 'Investment', color: 'bg-yellow-100 text-yellow-800' },
  'community-news': { label: 'Community', color: 'bg-indigo-100 text-indigo-800' },
  'other': { label: 'News', color: 'bg-gray-100 text-gray-800' }
};

export default function FeaturedNews({ className = '' }: FeaturedNewsProps) {
  const [news, setNews] = useState<FeaturedNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedNews();
  }, []);

  const fetchFeaturedNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/featured-news/homepage');
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.data?.news || []);
      } else {
        throw new Error('Failed to fetch featured news');
      }
    } catch (err) {
      console.error('Error fetching featured news:', err);
      setError('Unable to load news articles');
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (articleId: number) => {
    try {
      await fetch(`/api/featured-news/${articleId}/click`, { method: 'POST' });
    } catch (error) {
      // Silent fail for analytics
      console.error('Failed to track click:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAuthorName = (creator: FeaturedNewsArticle['creator']) => {
    return `${creator.profile.first_name} ${creator.profile.last_name}`;
  };

  if (loading) {
    return (
      <section className={`py-20 bg-white ${className}`}>
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Latest Real Estate News
            </h2>
            <div className="animate-pulse">
              <div className="h-4 bg-secondary-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                  <div className="h-6 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-4 bg-secondary-200 rounded w-full"></div>
                  <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || news.length === 0) {
    return null; // Don't show the section if there's no news
  }

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <NewspaperIcon className="w-8 h-8 text-primary-600 mr-3" />
            <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
              Featured News
            </span>
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Latest Real Estate News
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Stay informed with the latest market updates, neighborhood insights, and expert tips 
            from Virginia Hodges Real Estate
          </p>
        </motion.div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {news.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="group bg-white rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden"
            >
              {/* Featured Image */}
              <div className="relative overflow-hidden">
                <img
                  src={article.image.url}
                  alt={article.image.alt}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    categoryLabels[article.category]?.color || categoryLabels.other.color
                  }`}>
                    {categoryLabels[article.category]?.label || categoryLabels.other.label}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-white text-xs">
                  <div className="flex items-center bg-black/50 rounded-full px-2 py-1">
                    <EyeIcon className="w-3 h-3 mr-1" />
                    {article.analytics.views}
                  </div>
                  <div className="flex items-center bg-black/50 rounded-full px-2 py-1">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {article.readingTime} min
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center text-sm text-secondary-500 mb-3">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>{formatDate(article.publish_date)}</span>
                  <span className="mx-2">•</span>
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span>{getAuthorName(article.creator)}</span>
                </div>

                <h3 className="text-lg font-semibold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                  <Link
                    href={`/news/${article.slug}`}
                    onClick={() => handleArticleClick(article.id)}
                    className="hover:underline"
                  >
                    {article.title}
                  </Link>
                </h3>

                <p className="text-secondary-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/news/${article.slug}`}
                  onClick={() => handleArticleClick(article.id)}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200"
                >
                  Read More
                  <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All News Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/news"
            className="btn-outline inline-flex items-center"
          >
            View All News
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}