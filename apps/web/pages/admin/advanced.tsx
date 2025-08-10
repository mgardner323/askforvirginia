import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  EnvelopeIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  BuildingOfficeIcon,
  ServerIcon,
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';

interface MLSStatus {
  total_listings: number;
  synced: number;
  pending: number;
  errors: number;
  sync_rate: string;
  last_sync?: {
    last_updated: string;
    mls_source: string;
  };
}

interface EmailStatus {
  campaigns: {
    total: number;
    sent: number;
    active: number;
  };
  templates: {
    total: number;
    active: number;
  };
  recent_campaigns: Array<{
    id: number;
    name: string;
    type: string;
    status: string;
    statistics: any;
    sent_at?: string;
  }>;
}

interface SystemConfig {
  mls: {
    sources: string[];
    sync_interval: string;
    configured: boolean;
  };
  email: {
    smtp_configured: boolean;
    from_email: string;
  };
}

export default function AdvancedFeaturesAdmin() {
  const [mlsStatus, setMLSStatus] = useState<MLSStatus | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'mls' | 'email' | 'config'>('overview');

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    setLoading(true);
    try {
      // Fetch MLS status
      const mlsResponse = await fetch('/api/mls/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (mlsResponse.ok) {
        const mlsData = await mlsResponse.json();
        setMLSStatus(mlsData.data);
      }

      // Fetch Email status
      const emailResponse = await fetch('/api/email/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        setEmailStatus(emailData.data);
      }

      // Fetch MLS config
      const configResponse = await fetch('/api/mls/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setSystemConfig({
          mls: {
            sources: configData.data.sources,
            sync_interval: configData.data.sync_interval,
            configured: configData.data.api_endpoints.crmls.configured
          },
          email: emailStatus?.configuration || { smtp_configured: false, from_email: '' }
        });
      }

    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerMLSSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/mls/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ source: 'crmls' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('MLS sync result:', result);
        await fetchSystemStatus(); // Refresh status
      }
    } catch (error) {
      console.error('MLS sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      const email = prompt('Enter email address for test:');
      if (!email) return;

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: email })
      });

      if (response.ok) {
        alert('Test email sent successfully!');
      } else {
        alert('Failed to send test email');
      }
    } catch (error) {
      console.error('Test email failed:', error);
      alert('Failed to send test email');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-secondary-600">Loading advanced features...</div>
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
            <h1 className="text-2xl font-bold text-secondary-900">Advanced Features</h1>
            <p className="text-secondary-600 mt-1">
              Manage MLS integration, email marketing, and system automation
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchSystemStatus}
              className="btn-outline flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-secondary-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'mls', label: 'MLS Integration', icon: BuildingOfficeIcon },
              { id: 'email', label: 'Email Marketing', icon: EnvelopeIcon },
              { id: 'config', label: 'Configuration', icon: Cog6ToothIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* MLS Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">MLS Listings</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {mlsStatus?.total_listings || 0}
                    </p>
                  </div>
                  <BuildingOfficeIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="mt-4 flex items-center">
                  <div className="text-sm text-secondary-600">
                    Sync Rate: {mlsStatus?.sync_rate || '0'}%
                  </div>
                </div>
              </motion.div>

              {/* Email Campaigns Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Email Campaigns</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {emailStatus?.campaigns.sent || 0}
                    </p>
                  </div>
                  <EnvelopeIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4 flex items-center">
                  <div className="text-sm text-secondary-600">
                    {emailStatus?.campaigns.active || 0} active
                  </div>
                </div>
              </motion.div>

              {/* System Health Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">System Health</p>
                    <p className="text-2xl font-bold text-green-600">Good</p>
                  </div>
                  <ServerIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4 flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 mr-1" />
                  <div className="text-sm text-secondary-600">All systems operational</div>
                </div>
              </motion.div>

              {/* Templates Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-soft border border-secondary-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Email Templates</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {emailStatus?.templates.active || 0}
                    </p>
                  </div>
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-4 flex items-center">
                  <div className="text-sm text-secondary-600">
                    {emailStatus?.templates.total || 0} total
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'mls' && (
            <div className="space-y-6">
              {/* MLS Status Overview */}
              <div className="bg-white rounded-lg shadow-soft border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-secondary-900">MLS Integration Status</h3>
                  <button
                    onClick={triggerMLSSync}
                    disabled={syncing}
                    className={`btn-primary flex items-center gap-2 ${syncing ? 'opacity-50' : ''}`}
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900">{mlsStatus?.total_listings || 0}</div>
                    <div className="text-sm text-secondary-600">Total Listings</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{mlsStatus?.synced || 0}</div>
                    <div className="text-sm text-secondary-600">Synced</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{mlsStatus?.pending || 0}</div>
                    <div className="text-sm text-secondary-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{mlsStatus?.errors || 0}</div>
                    <div className="text-sm text-secondary-600">Errors</div>
                  </div>
                </div>

                {mlsStatus?.last_sync && (
                  <div className="flex items-center text-sm text-secondary-600">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Last sync: {formatDate(mlsStatus.last_sync.last_updated)} ({mlsStatus.last_sync.mls_source})
                  </div>
                )}
              </div>

              {/* MLS Configuration */}
              <div className="bg-white rounded-lg shadow-soft border border-secondary-200 p-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>MLS Source</span>
                    <span className="font-medium">CRMLS (California Regional MLS)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sync Interval</span>
                    <span className="font-medium">{systemConfig?.mls.sync_interval || 60} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Status</span>
                    <span className={`flex items-center ${
                      systemConfig?.mls.configured ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {systemConfig?.mls.configured ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Configured
                        </>
                      ) : (
                        <>
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Not Configured
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              {/* Email Overview */}
              <div className="bg-white rounded-lg shadow-soft border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-secondary-900">Email Marketing Overview</h3>
                  <button
                    onClick={sendTestEmail}
                    className="btn-outline"
                  >
                    Send Test Email
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{emailStatus?.campaigns.total || 0}</div>
                    <div className="text-sm text-secondary-600">Total Campaigns</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{emailStatus?.campaigns.sent || 0}</div>
                    <div className="text-sm text-secondary-600">Sent</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{emailStatus?.campaigns.active || 0}</div>
                    <div className="text-sm text-secondary-600">Active</div>
                  </div>
                </div>
              </div>

              {/* Recent Campaigns */}
              <div className="bg-white rounded-lg shadow-soft border border-secondary-200 p-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Campaigns</h3>
                <div className="space-y-3">
                  {emailStatus?.recent_campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <div className="font-medium text-secondary-900">{campaign.name}</div>
                        <div className="text-sm text-secondary-600">
                          {campaign.type} • {campaign.statistics?.total_sent || 0} sent
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'sent' 
                            ? 'bg-green-100 text-green-800' 
                            : campaign.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {campaign.status}
                        </span>
                        {campaign.sent_at && (
                          <div className="text-sm text-secondary-500">
                            {formatDate(campaign.sent_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!emailStatus?.recent_campaigns || emailStatus.recent_campaigns.length === 0) && (
                    <div className="text-center py-8 text-secondary-500">
                      No campaigns found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-soft border border-secondary-200 p-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-6">System Configuration</h3>
                
                <div className="space-y-6">
                  {/* MLS Configuration */}
                  <div>
                    <h4 className="text-md font-medium text-secondary-900 mb-3">MLS Integration</h4>
                    <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span>API Connection</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          systemConfig?.mls.configured 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {systemConfig?.mls.configured ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Auto-sync Interval</span>
                        <span>{systemConfig?.mls.sync_interval || 60} minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Supported Sources</span>
                        <span>{systemConfig?.mls.sources.join(', ') || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Email Configuration */}
                  <div>
                    <h4 className="text-md font-medium text-secondary-900 mb-3">Email Marketing</h4>
                    <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span>SMTP Configuration</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          systemConfig?.email.smtp_configured 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {systemConfig?.email.smtp_configured ? 'Configured' : 'Not Configured'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>From Email</span>
                        <span>{systemConfig?.email.from_email || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Templates</span>
                        <span>{emailStatus?.templates.active || 0} active</span>
                      </div>
                    </div>
                  </div>

                  {/* Environment Info */}
                  <div>
                    <h4 className="text-md font-medium text-secondary-900 mb-3">Environment</h4>
                    <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Environment</span>
                        <span className="font-mono text-sm">{process.env.NODE_ENV || 'development'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>API Version</span>
                        <span className="font-mono text-sm">v1.0.0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Database</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}