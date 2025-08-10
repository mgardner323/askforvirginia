import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  NewspaperIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  XCircleIcon,
  StarIcon
} from '@heroicons/react/24/solid';

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
  is_active: boolean;
  is_featured: boolean;
  priority: number;
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
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const categoryLabels: Record<string, string> = {
  'market-update': 'Market Update',
  'neighborhood-spotlight': 'Neighborhood Spotlight',
  'buying-tips': 'Buying Tips',
  'selling-tips': 'Selling Tips',
  'investment': 'Investment',
  'community-news': 'Community News',
  'other': 'Other'
};

export default function AdminNews() {
  const [news, setNews] = useState<FeaturedNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNews, setSelectedNews] = useState<number[]>([]);

  useEffect(() => {
    fetchNews();
  }, [pagination.page, filters]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/featured-news/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNews(data.data?.news || []);
        setPagination(prev => ({
          ...prev,
          ...data.data?.pagination
        }));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', status: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;

    try {
      const response = await fetch(`/api/featured-news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchNews();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const toggleFeatured = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/featured-news/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: !currentStatus })
      });

      if (response.ok) {
        fetchNews();
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/featured-news/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        fetchNews();
      }
    } catch (error) {
      console.error('Error updating active status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAuthorName = (creator: FeaturedNewsArticle['creator']) => {
    return `${creator.profile.first_name} ${creator.profile.last_name}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-secondary-600">Loading featured news...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Featured News</h1>
            <p className="text-secondary-600 mt-1">
              Manage news articles and announcements for the website
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline flex items-center gap-2 ${showFilters ? 'bg-primary-50 border-primary-200' : ''}`}
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
            <button className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Add News Article
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200">
            <div className="flex items-center">
              <NewspaperIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Articles</p>
                <p className="text-2xl font-bold text-secondary-900">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Active</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {news.filter(n => n.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200">
            <div className="flex items-center">
              <StarIcon className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Featured</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {news.filter(n => n.is_featured).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Views</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {news.reduce((sum, n) => sum + n.analytics.views, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* News Table */}
        <div className="bg-white rounded-lg shadow-soft border border-secondary-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Analytics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {news.map((article) => (
                  <tr key={article.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={article.image.url}
                          alt={article.image.alt}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">
                            {article.title}
                          </div>
                          <div className="text-sm text-secondary-500 line-clamp-1">
                            {article.excerpt}
                          </div>
                          <div className="text-xs text-secondary-400 mt-1">
                            By {getAuthorName(article.creator)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        {categoryLabels[article.category]}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          {article.is_active ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <XCircleIcon className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <span className="text-xs">
                            {article.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {article.is_featured && (
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-xs text-yellow-700">Featured</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 text-xs text-secondary-600">
                        <div className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {article.analytics.views}
                        </div>
                        <div className="flex items-center">
                          <ChartBarIcon className="w-4 h-4 mr-1" />
                          {article.analytics.clicks}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-secondary-600">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {formatDate(article.publish_date)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleActive(article.id, article.is_active)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            article.is_active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={article.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {article.is_active ? (
                            <XCircleIcon className="w-5 h-5" />
                          ) : (
                            <CheckCircleIcon className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          onClick={() => toggleFeatured(article.id, article.is_featured)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            article.is_featured 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-secondary-400 hover:bg-secondary-50'
                          }`}
                          title={article.is_featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <StarIcon className="w-5 h-5" />
                        </button>

                        <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200">
                          <PencilIcon className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-secondary-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="btn-outline disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-outline disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-secondary-700">
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total articles)
                  </p>
                </div>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          pageNum === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'text-secondary-600 hover:bg-secondary-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}