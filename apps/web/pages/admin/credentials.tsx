import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  KeyIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Credential {
  id: number;
  service_name: string;
  service_type: string;
  description?: string;
  is_active: boolean;
  last_used?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  has_credentials: boolean;
  credential_keys: string[];
}

interface CredentialType {
  value: string;
  label: string;
  description: string;
}

export default function CredentialsPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [showPasswords, setShowPasswords] = useState<Set<number>>(new Set());

  // Form state for add/edit
  const [formData, setFormData] = useState({
    service_name: '',
    service_type: 'api_key',
    description: '',
    is_active: true,
    credentials: {} as any
  });

  // Load credentials and types on mount
  useEffect(() => {
    loadCredentials();
    loadCredentialTypes();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/credentials', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCredentials(result.data || []);
      } else {
        console.error('Failed to load credentials');
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCredentialTypes = async () => {
    try {
      const response = await fetch('/api/credentials/types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCredentialTypes(result.data || []);
      }
    } catch (error) {
      console.error('Error loading credential types:', error);
    }
  };

  const handleAddCredential = () => {
    setFormData({
      service_name: '',
      service_type: 'api_key',
      description: '',
      is_active: true,
      credentials: {}
    });
    setShowAddModal(true);
  };

  const handleEditCredential = async (credential: Credential) => {
    try {
      // Fetch full credential details with actual values
      const response = await fetch(`/api/credentials/${credential.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedCredential(result.data);
        setFormData({
          service_name: result.data.service_name,
          service_type: result.data.service_type,
          description: result.data.description || '',
          is_active: result.data.is_active,
          credentials: result.data.credentials || {}
        });
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error loading credential details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = showEditModal ? 'PUT' : 'POST';
      const url = showEditModal ? `/api/credentials/${selectedCredential?.id}` : '/api/credentials';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadCredentials();
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedCredential(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save credential');
      }
    } catch (error) {
      console.error('Error saving credential:', error);
      alert('Failed to save credential');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/credentials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadCredentials();
      } else {
        alert('Failed to delete credential');
      }
    } catch (error) {
      console.error('Error deleting credential:', error);
      alert('Failed to delete credential');
    }
  };

  const handleTestCredential = async (id: number) => {
    try {
      const response = await fetch(`/api/credentials/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const testResult = result.data;
        alert(`Test ${testResult.success ? 'Passed' : 'Failed'}: ${testResult.message}`);
      }
    } catch (error) {
      console.error('Error testing credential:', error);
      alert('Failed to test credential');
    }
  };

  const togglePasswordVisibility = (id: number) => {
    const newShowPasswords = new Set(showPasswords);
    if (newShowPasswords.has(id)) {
      newShowPasswords.delete(id);
    } else {
      newShowPasswords.add(id);
    }
    setShowPasswords(newShowPasswords);
  };

  const renderCredentialForm = () => {
    const selectedType = credentialTypes.find(t => t.value === formData.service_type);

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Name
          </label>
          <input
            type="text"
            value={formData.service_name}
            onChange={(e) => setFormData({...formData, service_name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., google_gemini, smtp_primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Type
          </label>
          <select
            value={formData.service_type}
            onChange={(e) => setFormData({...formData, service_type: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {credentialTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Description of what this credential is used for"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>

        {/* Dynamic credential fields based on type */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Credential Values</h4>
          
          {formData.service_type === 'api_key' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={formData.credentials.api_key || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  credentials: {...formData.credentials, api_key: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter API key"
              />
            </div>
          )}

          {formData.service_type === 'smtp' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                <input
                  type="text"
                  value={formData.credentials.host || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, host: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  value={formData.credentials.port || 587}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, port: parseInt(e.target.value)}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.credentials.username || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, username: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.credentials.password || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, password: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="secure"
                  checked={formData.credentials.secure || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, secure: e.target.checked}
                  })}
                  className="mr-2"
                />
                <label htmlFor="secure" className="text-sm font-medium text-gray-700">
                  Use SSL/TLS
                </label>
              </div>
            </div>
          )}

          {formData.service_type === 'database' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                <input
                  type="text"
                  value={formData.credentials.host || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, host: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  value={formData.credentials.port || 3306}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, port: parseInt(e.target.value)}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
                <input
                  type="text"
                  value={formData.credentials.database || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, database: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={formData.credentials.username || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, username: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.credentials.password || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, password: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showEditModal ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <KeyIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  API & Service Credentials
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage API keys, authentication credentials, and service configurations
                </p>
              </div>
            </div>
            <button
              onClick={handleAddCredential}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Credential
            </button>
          </div>
        </div>

        {/* Credentials List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {credentials.map((credential) => (
                  <tr key={credential.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {credential.service_name}
                        </div>
                        {credential.description && (
                          <div className="text-sm text-gray-500">
                            {credential.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {credential.service_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {credential.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {credential.last_used 
                        ? new Date(credential.last_used).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestCredential(credential.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Test Credential"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditCredential(credential)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Credential"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(credential.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Credential"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {credentials.length === 0 && (
            <div className="text-center py-12">
              <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No credentials</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first API credential.
              </p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {showEditModal ? 'Edit Credential' : 'Add New Credential'}
                </h3>
              </div>
              {renderCredentialForm()}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}