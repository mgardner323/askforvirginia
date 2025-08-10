import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDaysIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category: string;
  tags: string[];
  author_id: number;
  published_at: string;
  view_count: number;
  author_name: string;
  reading_time: number;
  formattedDate: string;
}

interface BlogData {
  posts: BlogPost[];
  categories: Array<{
    category: string;
    count: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function Blog() {
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBlogPosts();
  }, [currentPage, selectedCategory, searchTerm]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/blog?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBlogData(data.data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors: { [key: string]: string } = {
    'market-news': 'bg-blue-100 text-blue-800',
    'buying-tips': 'bg-green-100 text-green-800',
    'selling-tips': 'bg-purple-100 text-purple-800',
    'lifestyle': 'bg-orange-100 text-orange-800',
    'community': 'bg-pink-100 text-pink-800'
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Layout
      title="Real Estate Blog - Expert Insights & Market Updates"
      description="Stay informed with expert real estate insights, market updates, buying and selling tips, and community news from Southern California's trusted real estate professional."
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
              Real Estate Blog
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
              Expert insights, market updates, and valuable tips for buying, selling, 
              and living in Southern California's most desirable communities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-secondary-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Category Filter */}
              <div className="lg:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Categories</option>
                  {blogData?.categories?.map(({ category, count }) => (
                    <option key={category} value={category}>
                      {formatCategoryName(category)} ({count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-secondary-50 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-secondary-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-secondary-300 rounded mb-2"></div>
                    <div className="h-6 bg-secondary-300 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-secondary-300 rounded"></div>
                      <div className="h-4 bg-secondary-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogData?.posts?.length ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogData.posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200 overflow-hidden"
                  >
                    {post.featured_image && (
                      <div className="relative h-48 bg-secondary-200">
                        <Image
                          src={post.featured_image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          categoryColors[post.category] || 'bg-secondary-100 text-secondary-700'
                        }`}>
                          {formatCategoryName(post.category)}
                        </span>
                        <div className="flex items-center text-xs text-secondary-500">
                          <CalendarDaysIcon className="w-3 h-3 mr-1" />
                          {post.formattedDate}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-secondary-900 mb-3 line-clamp-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-primary-600 transition-colors duration-200"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p className="text-secondary-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-secondary-500">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-1" />
                          {post.author_name}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {post.reading_time} min read
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {blogData.pagination.totalPages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="flex space-x-2">
                    {Array.from({ length: blogData.pagination.totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          currentPage === i + 1
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <MagnifyingGlassIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No posts found' : 'No blog posts yet'}
              </h3>
              <p className="text-secondary-600 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search terms or filters.'
                  : 'Check back soon for expert real estate insights and market updates.'
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}