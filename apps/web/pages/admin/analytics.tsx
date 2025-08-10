import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ServerIcon,
  EyeIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  Activity,
  Users,
  Building,
  FileText,
  Search,
  Server,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface AnalyticsData {
  properties: {
    totalProperties: number;
    featuredProperties: number;
    averagePrice: number;
    priceRanges: Array<{ range: string; count: number }>;
    propertiesByArea: Array<{ area: string; count: number; averagePrice: number }>;
    viewCounts: Array<{ propertyId: number; title: string; views: number }>;
    conversionRate: number;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newUsers: { today: number; thisWeek: number; thisMonth: number };
    usersByRole: Array<{ role: string; count: number }>;
    engagementMetrics: {
      averageSessionDuration: number;
      averagePagesPerSession: number;
      bounceRate: number;
    };
  };
  blog: {
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    popularPosts: Array<{ id: number; title: string; views: number; shares: number }>;
    categoriesPerformance: Array<{ category: string; posts: number; views: number; engagement: number }>;
    averageReadTime: number;
  };
  system: {
    apiResponseTimes: Array<{ endpoint: string; averageTime: number; requestCount: number }>;
    errorRates: Array<{ endpoint: string; errorRate: number; errorCount: number }>;
    cachePerformance: {
      hitRate: number;
      totalRequests: number;
      memoryUsage: number;
    };
    serverMetrics: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      uptime: number;
    };
  };
  search: {
    popularSearchTerms: Array<{ term: string; count: number; resultCount: number; clickThroughRate: number }>;
    searchFilters: Array<{ filter: string; usage: number }>;
    noResultsQueries: Array<{ term: string; count: number }>;
  };
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('7d');
  const [activeTab, setActiveTab] = React.useState('overview');

  React.useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'properties', name: 'Properties', icon: BuildingOfficeIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'content', name: 'Content', icon: DocumentTextIcon },
    { id: 'search', name: 'Search', icon: MagnifyingGlassIcon },
    { id: 'system', name: 'System', icon: ServerIcon }
  ];

  const pieChartColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (loading || !data) {
    return (
      <AdminAuthGuard>
        <AdminLayout title="Analytics Dashboard">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </AdminLayout>
      </AdminAuthGuard>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900">{data.properties.totalProperties}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{data.users.activeUsers}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +8% from last week
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blog Views</p>
              <p className="text-3xl font-bold text-gray-900">{data.blog.totalViews.toLocaleString()}</p>
              <p className="text-sm text-red-600 flex items-center">
                <TrendingDownIcon className="w-4 h-4 mr-1" />
                -3% from last week
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <EyeIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(data.system.apiResponseTimes.reduce((acc, curr) => acc + curr.averageTime, 0) / data.system.apiResponseTimes.length)}ms
              </p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                15% faster
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <ClockIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Price Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Price Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.properties.priceRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registration Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { name: 'Today', users: data.users.newUsers.today },
              { name: 'This Week', users: data.users.newUsers.thisWeek },
              { name: 'This Month', users: data.users.newUsers.thisMonth }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Roles Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.users.usersByRole}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                nameKey="role"
              >
                {data.users.usersByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* System Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>{Math.round(data.system.serverMetrics.cpuUsage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${data.system.serverMetrics.cpuUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>{Math.round(data.system.serverMetrics.memoryUsage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${data.system.serverMetrics.memoryUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Disk Usage</span>
                <span>{Math.round(data.system.serverMetrics.diskUsage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${data.system.serverMetrics.diskUsage}%` }}
                />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-600">
                Uptime: {formatTime(data.system.serverMetrics.uptime)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cache Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Performance</h3>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{Math.round(data.system.cachePerformance.hitRate)}%</p>
              <p className="text-sm text-gray-600">Hit Rate</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Requests</span>
                <span>{data.system.cachePerformance.totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>{Math.round(data.system.cachePerformance.memoryUsage)}MB</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderPropertiesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties by Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties by Area</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.properties.propertiesByArea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip 
                formatter={[
                  (value: number, name: string) => [
                    name === 'count' ? value : formatCurrency(value),
                    name === 'count' ? 'Properties' : 'Avg Price'
                  ]
                ]}
              />
              <Bar dataKey="count" fill="#3B82F6" name="count" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Most Viewed Properties */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Properties</h3>
          <div className="space-y-3">
            {data.properties.viewCounts.slice(0, 8).map((property, index) => (
              <div key={property.propertyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 truncate">{property.title}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  <span className="font-medium">{property.views}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Property Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm border"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{data.properties.totalProperties}</p>
            <p className="text-sm text-gray-600">Total Properties</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{data.properties.featuredProperties}</p>
            <p className="text-sm text-gray-600">Featured</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(data.properties.averagePrice)}</p>
            <p className="text-sm text-gray-600">Average Price</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{data.properties.conversionRate}%</p>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderContentTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blog Categories Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Categories Performance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.blog.categoriesPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#10B981" name="Views" />
              <Bar dataKey="posts" fill="#3B82F6" name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Popular Blog Posts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Blog Posts</h3>
          <div className="space-y-3">
            {data.blog.popularPosts.map((post, index) => (
              <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1 line-clamp-2">{post.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {post.views} views
                      </span>
                      <span>📤 {post.shares} shares</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Search Terms */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Search Terms</h3>
          <div className="space-y-3">
            {data.search.popularSearchTerms.map((term, index) => (
              <div key={term.term} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{term.term}</p>
                    <p className="text-sm text-gray-600">{term.resultCount} results • {term.clickThroughRate}% CTR</p>
                  </div>
                </div>
                <span className="font-semibold text-blue-600">{term.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search Filters Usage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Filters Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.search.searchFilters} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="filter" type="category" />
              <Tooltip />
              <Bar dataKey="usage" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Response Times */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Response Times</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.system.apiResponseTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="endpoint" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value}ms`, 'Response Time']} />
              <Bar dataKey="averageTime" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Error Rates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rates by Endpoint</h3>
          <div className="space-y-4">
            {data.system.errorRates.map((endpoint) => (
              <div key={endpoint.endpoint} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{endpoint.endpoint}</span>
                  <span className={`${endpoint.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>
                    {endpoint.errorRate}% ({endpoint.errorCount} errors)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${endpoint.errorRate > 1 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(endpoint.errorRate * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <AdminAuthGuard>
      <AdminLayout title="Analytics Dashboard">
        <div className="space-y-6">
          {/* Header with controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600 mt-1">Comprehensive insights into your website performance</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button
                onClick={fetchAnalyticsData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'properties' && renderPropertiesTab()}
            {activeTab === 'users' && renderOverviewTab()} {/* Reuse overview for now */}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'search' && renderSearchTab()}
            {activeTab === 'system' && renderSystemTab()}
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default AdminAnalytics;