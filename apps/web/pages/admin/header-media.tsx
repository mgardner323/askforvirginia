import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  VideoIcon, 
  PhotoIcon,
  PlusIcon, 
  TrashIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface HeaderMedia {
  id: number;
  media_type: 'video' | 'image';
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  is_active: boolean;
  upload_date: string;
  publicUrl: string;
}

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  activeMedia: number;
  videoFiles: number;
  imageFiles: number;
}

export default function HeaderMediaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<HeaderMedia[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<HeaderMedia | null>(null);

  // Load media and stats on mount
  useEffect(() => {
    loadMedia();
    loadStats();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await fetch('/api/header-media/admin?include_inactive=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMedia(result.data || []);
      } else {
        console.error('Failed to load header media');
      }
    } catch (error) {
      console.error('Error loading header media:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/header-media/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const formData = new FormData();
        formData.append('media', file);

        const response = await fetch('/api/header-media/admin/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.message || 'Failed to upload file');
          continue;
        }

        console.log(`Successfully uploaded: ${file.name}`);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    await loadMedia();
    await loadStats();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const activateMedia = async (id: number) => {
    try {
      const response = await fetch(`/api/header-media/admin/${id}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadMedia();
        alert('Media activated successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to activate media');
      }
    } catch (error) {
      console.error('Error activating media:', error);
      alert('Failed to activate media');
    }
  };

  const deleteMedia = async (id: number) => {
    if (!confirm('Are you sure you want to delete this media file? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/header-media/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadMedia();
        await loadStats();
        alert('Media deleted successfully');
      } else {
        alert('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const MediaPreview = ({ media }: { media: HeaderMedia }) => {
    if (media.media_type === 'video') {
      return (
        <video
          className="w-full h-32 object-cover rounded"
          src={media.publicUrl}
          controls={false}
          muted
          playsInline
        />
      );
    } else {
      return (
        <img
          className="w-full h-32 object-cover rounded"
          src={media.publicUrl}
          alt={media.original_filename}
        />
      );
    }
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
              <VideoIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Header Media Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage homepage header videos and images
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Upload Media
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <PhotoIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalFiles}</div>
                  <div className="text-sm text-gray-600">Total Files</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CloudArrowUpIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</div>
                  <div className="text-sm text-gray-600">Total Size</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.activeMedia}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <VideoIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.videoFiles}</div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <PhotoIcon className="h-8 w-8 text-indigo-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.imageFiles}</div>
                  <div className="text-sm text-gray-600">Images</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500 mr-3" />
              <span className="text-gray-600">Uploading files...</span>
            </div>
          ) : (
            <div>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Click to upload
                </button>
                <span className="text-gray-600"> or drag and drop</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                MP4, WebM, OGG videos or PNG, JPG, WebP images up to 50MB
              </p>
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {media.length === 0 ? (
            <div className="text-center py-12">
              <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first header media file.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {media.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Media Preview */}
                  <div className="relative">
                    <MediaPreview media={item} />
                    {item.is_active && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        ACTIVE
                      </div>
                    )}
                    {item.media_type === 'video' && item.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  
                  {/* Media Info */}
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      {item.media_type === 'video' ? (
                        <VideoIcon className="h-4 w-4 text-purple-500 mr-2" />
                      ) : (
                        <PhotoIcon className="h-4 w-4 text-indigo-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.original_filename}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      <div>{formatFileSize(item.file_size)}</div>
                      <div>Uploaded {new Date(item.upload_date).toLocaleDateString()}</div>
                      {item.dimensions && (
                        <div>{item.dimensions.width} × {item.dimensions.height}</div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPreviewMedia(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Preview"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {!item.is_active && (
                          <button
                            onClick={() => activateMedia(item.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Activate"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMedia(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {item.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => activateMedia(item.id)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Set Active
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />

        {/* Preview Modal */}
        {previewMedia && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {previewMedia.original_filename}
                </h3>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                {previewMedia.media_type === 'video' ? (
                  <video
                    className="w-full max-h-96 object-contain"
                    src={previewMedia.publicUrl}
                    controls
                  />
                ) : (
                  <img
                    className="w-full max-h-96 object-contain"
                    src={previewMedia.publicUrl}
                    alt={previewMedia.original_filename}
                  />
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Size:</strong> {formatFileSize(previewMedia.file_size)}</p>
                <p><strong>Type:</strong> {previewMedia.mime_type}</p>
                <p><strong>Uploaded:</strong> {new Date(previewMedia.upload_date).toLocaleString()}</p>
                {previewMedia.duration && (
                  <p><strong>Duration:</strong> {Math.floor(previewMedia.duration / 60)}:{String(Math.floor(previewMedia.duration % 60)).padStart(2, '0')}</p>
                )}
                {previewMedia.dimensions && (
                  <p><strong>Dimensions:</strong> {previewMedia.dimensions.width} × {previewMedia.dimensions.height}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}