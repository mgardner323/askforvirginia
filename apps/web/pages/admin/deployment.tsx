import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  CloudArrowUpIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface DeploymentStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

interface DeploymentResult {
  id: string;
  status: 'running' | 'completed' | 'failed';
  steps: DeploymentStep[];
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  triggeredBy: string;
}

interface DeploymentStats {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageDuration: number;
  lastDeployment?: Date;
  isCurrentlyDeploying: boolean;
}

export default function DeploymentPage() {
  const [currentDeployment, setCurrentDeployment] = useState<DeploymentResult | null>(null);
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentResult[]>([]);
  const [deploymentStats, setDeploymentStats] = useState<DeploymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [preCheckResults, setPreCheckResults] = useState<any>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentResult | null>(null);

  useEffect(() => {
    loadData();
    
    // Poll for updates every 2 seconds if deployment is running
    const interval = setInterval(() => {
      if (currentDeployment && currentDeployment.status === 'running') {
        loadCurrentDeployment();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentDeployment]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadCurrentDeployment(),
        loadDeploymentHistory(),
        loadDeploymentStats()
      ]);
    } catch (error) {
      console.error('Error loading deployment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentDeployment = async () => {
    try {
      const response = await fetch('/api/production-deployment/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentDeployment(result.data);
      }
    } catch (error) {
      console.error('Error loading current deployment:', error);
    }
  };

  const loadDeploymentHistory = async () => {
    try {
      const response = await fetch('/api/production-deployment/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setDeploymentHistory(result.data || []);
      }
    } catch (error) {
      console.error('Error loading deployment history:', error);
    }
  };

  const loadDeploymentStats = async () => {
    try {
      const response = await fetch('/api/production-deployment/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setDeploymentStats(result.data);
      }
    } catch (error) {
      console.error('Error loading deployment stats:', error);
    }
  };

  const runPreCheck = async () => {
    try {
      const response = await fetch('/api/production-deployment/pre-check', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPreCheckResults(result.data);
      } else {
        alert('Failed to run pre-deployment checks');
      }
    } catch (error) {
      console.error('Error running pre-check:', error);
      alert('Failed to run pre-deployment checks');
    }
  };

  const startDeployment = async () => {
    if (!confirm('Are you sure you want to deploy to production? This will update the live website.')) {
      return;
    }

    setDeploying(true);

    try {
      const response = await fetch('/api/production-deployment/deploy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentDeployment(result.data);
        alert('Deployment started successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to start deployment');
      }
    } catch (error) {
      console.error('Error starting deployment:', error);
      alert('Failed to start deployment');
    } finally {
      setDeploying(false);
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Production Deployment">
        <div className="flex items-center justify-center h-64">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Production Deployment">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CloudArrowUpIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Production Deployment
                </h1>
                <p className="text-gray-600 mt-1">
                  Deploy development changes to production environment
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={runPreCheck}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Run Pre-Check
              </button>
              
              <button
                onClick={startDeployment}
                disabled={deploying || (currentDeployment && currentDeployment.status === 'running')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deploying ? (
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <PlayIcon className="h-5 w-5 mr-2" />
                )}
                Deploy to Production
              </button>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Production Deployment Warning</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This will deploy changes directly to the live production environment. Always run pre-checks first and ensure you have tested changes thoroughly in development.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {deploymentStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{deploymentStats.totalDeployments}</div>
                  <div className="text-sm text-gray-600">Total Deployments</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{deploymentStats.successfulDeployments}</div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <XCircleIcon className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{deploymentStats.failedDeployments}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {deploymentStats.averageDuration > 0 ? formatDuration(deploymentStats.averageDuration) : '-'}
                  </div>
                  <div className="text-sm text-gray-600">Avg Duration</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <ArrowPathIcon className={`h-8 w-8 ${deploymentStats.isCurrentlyDeploying ? 'text-blue-500 animate-spin' : 'text-gray-400'}`} />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {deploymentStats.isCurrentlyDeploying ? 'ACTIVE' : 'IDLE'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pre-Check Results */}
        {preCheckResults && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-Deployment Check Results</h3>
            <div className={`p-4 rounded-lg ${preCheckResults.allPassed ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center mb-2">
                {preCheckResults.allPassed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className={`font-medium ${preCheckResults.allPassed ? 'text-green-800' : 'text-yellow-800'}`}>
                  {preCheckResults.allPassed ? 'All checks passed' : 'Some checks have warnings'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {Object.entries(preCheckResults.checks).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: {value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Current Deployment */}
        {currentDeployment && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Deployment</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentDeployment.status)}`}>
                {currentDeployment.status.toUpperCase()}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>ID:</strong> {currentDeployment.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Started:</strong> {new Date(currentDeployment.startTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Triggered by:</strong> {currentDeployment.triggeredBy}
              </p>
              {currentDeployment.endTime && (
                <p className="text-sm text-gray-600">
                  <strong>Duration:</strong> {currentDeployment.totalDuration ? formatDuration(currentDeployment.totalDuration) : '-'}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {currentDeployment.steps.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {getStepIcon(step.status)}
                    <span className="ml-3 font-medium text-gray-900">{step.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {step.duration && (
                      <span className="text-sm text-gray-500">{formatDuration(step.duration)}</span>
                    )}
                    {step.output && (
                      <button
                        onClick={() => alert(step.output)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View output"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deployment History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Deployment History</h3>
          </div>
          
          {deploymentHistory.length === 0 ? (
            <div className="text-center py-12">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deployments yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start your first deployment to see history here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deploymentHistory.map((deployment) => (
                <div key={deployment.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        deployment.status === 'completed' ? 'bg-green-500' : 
                        deployment.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{deployment.id}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(deployment.startTime).toLocaleString()} by {deployment.triggeredBy}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {deployment.totalDuration && (
                        <span className="text-sm text-gray-500">
                          {formatDuration(deployment.totalDuration)}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(deployment.status)}`}>
                        {deployment.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => setSelectedDeployment(deployment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deployment Detail Modal */}
        {selectedDeployment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Deployment Details: {selectedDeployment.id}
                </h3>
                <button
                  onClick={() => setSelectedDeployment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600"><strong>Status:</strong> {selectedDeployment.status}</p>
                <p className="text-sm text-gray-600"><strong>Started:</strong> {new Date(selectedDeployment.startTime).toLocaleString()}</p>
                <p className="text-sm text-gray-600"><strong>Triggered by:</strong> {selectedDeployment.triggeredBy}</p>
                {selectedDeployment.endTime && (
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> {selectedDeployment.totalDuration ? formatDuration(selectedDeployment.totalDuration) : '-'}
                  </p>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedDeployment.steps.map((step, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStepIcon(step.status)}
                        <span className="ml-3 font-medium text-gray-900">{step.name}</span>
                      </div>
                      {step.duration && (
                        <span className="text-sm text-gray-500">{formatDuration(step.duration)}</span>
                      )}
                    </div>
                    
                    {step.output && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800">
                        {step.output}
                      </div>
                    )}
                    
                    {step.error && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800">
                        Error: {step.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}