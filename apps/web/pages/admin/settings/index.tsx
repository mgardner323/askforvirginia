import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  CogIcon,
  DatabaseIcon,
  EnvelopeIcon,
  CloudIcon,
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Setting {
  id: number;
  category: 'database' | 'smtp' | 'system' | 'api' | 'storage';
  key: string;
  value: string;
  description?: string;
  is_encrypted: boolean;
  is_active: boolean;
  full_value?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  key: string;
  label: string;
  icon: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  database: DatabaseIcon,
  smtp: EnvelopeIcon,
  system: CogIcon,
  api: CloudIcon,
  storage: FolderIcon
};

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    category: 'database' as Setting['category'],
    key: '',
    value: '',
    description: '',
    is_encrypted: false
  });

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/settings/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSettings = async (category?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const url = category && category !== 'all' 
        ? `/api/settings?category=${category}`
        : '/api/settings';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('error', 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchSettings(category);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key || !formData.value) {
      showNotification('error', 'Key and value are required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('success', data.message);
        setShowAddModal(false);
        resetForm();
        fetchSettings(selectedCategory);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save setting');
      }
    } catch (error: any) {
      console.error('Error saving setting:', error);
      showNotification('error', error.message || 'Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number, value: string) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/settings/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('success', data.message);
        setEditingSetting(null);
        fetchSettings(selectedCategory);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update setting');
      }
    } catch (error: any) {
      console.error('Error updating setting:', error);
      showNotification('error', error.message || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/settings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showNotification('success', 'Setting deleted successfully');
        fetchSettings(selectedCategory);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete setting');
      }
    } catch (error: any) {
      console.error('Error deleting setting:', error);
      showNotification('error', error.message || 'Failed to delete setting');
    }
  };

  const handleMigrateEnv = async () => {
    if (!confirm('This will migrate settings from .env file to the database. Continue?')) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/settings/migrate-env', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        showNotification('success', data.message);
        fetchSettings(selectedCategory);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to migrate settings');
      }
    } catch (error: any) {
      console.error('Error migrating settings:', error);
      showNotification('error', error.message || 'Failed to migrate settings');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'database',
      key: '',
      value: '',
      description: '',
      is_encrypted: false
    });
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredSettings = selectedCategory === 'all' 
    ? settings 
    : settings.filter(s => s.category === selectedCategory);

  return (
    <AdminAuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Manage database, SMTP, and system configurations</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleMigrateEnv}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <DatabaseIcon className="w-4 h-4" />
                <span>Migrate .env</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Setting</span>
              </button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`p-4 rounded-lg flex items-center space-x-2 ${
                notification.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5" />
              )}
              <span>{notification.message}</span>
            </motion.div>
          )}

          {/* Categories */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedCategory === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Settings
              </button>
              {categories.map((category) => {
                const IconComponent = CATEGORY_ICONS[category.key];
                return (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryChange(category.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      selectedCategory === category.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings List */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading settings...</p>
              </div>
            ) : filteredSettings.length === 0 ? (
              <div className="p-8 text-center">
                <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Settings Found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedCategory === 'all' 
                    ? 'No settings have been configured yet.'
                    : `No ${selectedCategory} settings found.`}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add First Setting
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredSettings.map((setting) => (
                  <div key={setting.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            setting.category === 'database' ? 'bg-blue-100 text-blue-800' :
                            setting.category === 'smtp' ? 'bg-green-100 text-green-800' :
                            setting.category === 'system' ? 'bg-gray-100 text-gray-800' :
                            setting.category === 'api' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {setting.category.toUpperCase()}
                          </span>
                          <h3 className="text-lg font-medium text-gray-900">{setting.key}</h3>
                          {setting.is_encrypted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                              Encrypted
                            </span>
                          )}
                        </div>
                        {setting.description && (
                          <p className="mt-1 text-sm text-gray-600">{setting.description}</p>
                        )}
                        <div className="mt-2">
                          {editingSetting?.id === setting.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type={setting.is_encrypted ? 'password' : 'text'}
                                defaultValue={setting.full_value || setting.value}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdate(setting.id, (e.target as HTMLInputElement).value);
                                  } else if (e.key === 'Escape') {
                                    setEditingSetting(null);
                                  }
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter new value"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  const input = document.querySelector('input:focus') as HTMLInputElement;
                                  if (input) {
                                    handleUpdate(setting.id, input.value);
                                  }
                                }}
                                disabled={saving}
                                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSetting(null)}
                                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <code className={`flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm ${
                                setting.is_encrypted ? 'font-mono' : ''
                              }`}>
                                {setting.is_encrypted ? (
                                  showPasswords[setting.id] ? 
                                    (setting.full_value || setting.value) : 
                                    '••••••••••••••••'
                                ) : (
                                  setting.value
                                )}
                              </code>
                              {setting.is_encrypted && (
                                <button
                                  onClick={() => togglePasswordVisibility(setting.id)}
                                  className="p-2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPasswords[setting.id] ? (
                                    <EyeSlashIcon className="w-4 h-4" />
                                  ) : (
                                    <EyeIcon className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Last updated: {new Date(setting.updated_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-6">
                        <button
                          onClick={() => setEditingSetting(setting)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(setting.id, setting.key)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Setting Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Setting</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Setting['category'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {categories.map((category) => (
                          <option key={category.key} value={category.key}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Key
                      </label>
                      <input
                        type="text"
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., DB_HOST"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type={formData.is_encrypted ? 'password' : 'text'}
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter value"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_encrypted}
                          onChange={(e) => setFormData({ ...formData, is_encrypted: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Encrypt this value</span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          resetForm();
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Add Setting'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default AdminSettingsPage;