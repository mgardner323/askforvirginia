import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  BuildingOfficeIcon as BuildingOfficeSolid,
  DocumentTextIcon as DocumentTextSolid,
  UsersIcon as UsersSolid,
  ChartBarIcon as ChartBarSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';

interface DashboardStats {
  properties: {
    total: number;
    active: number;
    sold: number;
    pending: number;
  };
  blog: {
    total: number;
    published: number;
    draft: number;
  };
  users: {
    total: number;
    agents: number;
    clients: number;
  };
  market: {
    reports: number;
    latest_date: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<DashboardStats>({
    properties: { total: 0, active: 0, sold: 0, pending: 0 },
    blog: { total: 0, published: 0, draft: 0 },
    users: { total: 0, agents: 0, clients: 0 },
    market: { reports: 0, latest_date: '' }
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Properties',
      total: stats.properties.total,
      subtitle: `${stats.properties.active} active, ${stats.properties.sold} sold`,
      icon: BuildingOfficeIcon,
      iconSolid: BuildingOfficeSolid,
      color: 'blue',
      href: '/admin/properties'
    },
    {
      title: 'Blog Posts',
      total: stats.blog.total,
      subtitle: `${stats.blog.published} published, ${stats.blog.draft} drafts`,
      icon: DocumentTextIcon,
      iconSolid: DocumentTextSolid,
      color: 'green',
      href: '/admin/blog'
    },
    {
      title: 'Users',
      total: stats.users.total,
      subtitle: `${stats.users.agents} agents, ${stats.users.clients} clients`,
      icon: UsersIcon,
      iconSolid: UsersSolid,
      color: 'purple',
      href: '/admin/users'
    },
    {
      title: 'Market Reports',
      total: stats.market.reports,
      subtitle: stats.market.latest_date ? `Latest: ${new Date(stats.market.latest_date).toLocaleDateString()}` : 'No reports',
      icon: ChartBarIcon,
      iconSolid: ChartBarSolid,
      color: 'orange',
      href: '/admin/market'
    }
  ];

  const quickActions = [
    {
      title: 'Add Property',
      description: 'List a new property',
      icon: BuildingOfficeIcon,
      href: '/admin/properties/new',
      color: 'blue'
    },
    {
      title: 'Write Blog Post',
      description: 'Create new blog content',
      icon: DocumentTextIcon,
      href: '/admin/blog/new',
      color: 'green'
    },
    {
      title: 'Create Market Report',
      description: 'Add market analysis',
      icon: ChartBarIcon,
      href: '/admin/market/new',
      color: 'orange'
    },
    {
      title: 'Manage Users',
      description: 'View and edit users',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'purple'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'New property added', item: '123 Main St, Riverside', time: '2 hours ago', type: 'property' },
    { id: 2, action: 'Blog post published', item: 'Market Trends for August 2025', time: '4 hours ago', type: 'blog' },
    { id: 3, action: 'Property sold', item: '456 Oak Ave, Corona', time: '1 day ago', type: 'property' },
    { id: 4, action: 'New user registered', item: 'john.smith@email.com', time: '2 days ago', type: 'user' }
  ];

  return (
    <AdminAuthGuard>
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={card.href}>
                <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className="flex items-center">
                    <div className={`bg-${card.color}-100 rounded-lg p-3`}>
                      <card.iconSolid className={`w-6 h-6 text-${card.color}-600`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {loading ? '—' : card.total}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.title} href={action.href}>
                    <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className={`bg-${action.color}-100 rounded-lg p-3 mb-3`}>
                        <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 text-center">{action.title}</h4>
                      <p className="text-xs text-gray-500 text-center mt-1">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <Link href="/admin/activity">
                  <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                    View all
                  </span>
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'property' ? 'bg-blue-500' :
                      activity.type === 'blog' ? 'bg-green-500' :
                      activity.type === 'user' ? 'bg-purple-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-gray-600"> — {activity.item}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default AdminDashboard;