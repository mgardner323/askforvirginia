import React, { useState, useEffect } from 'react';
import {
  PhotoIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FolderPlusIcon,
  ArrowUpOnSquareIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface BlogMedia {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  uploaded_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  publicUrl: string;
  formattedFileSize: string;
  displaySize: string;
  uploader?: {
    email: string;
    profile: any;
  };
}

interface BlogMediaStats {
  totalFiles: number;
  totalSize: number;
  imageFiles: number;
  recentUploads: number;
  formattedTotalSize: string;
}

interface BlogMediaLibraryProps {
  onSelect?: (media: BlogMedia) => void;
  onClose?: () => void;
  selectionMode?: boolean;
}

export default function BlogMediaLibrary({ onSelect, onClose, selectionMode = false }: BlogMediaLibraryProps) {
  const [media, setMedia] = useState<BlogMedia[]>([]);
  const [stats, setStats] = useState<BlogMediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<BlogMedia | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Edit states
  const [editingMedia, setEditingMedia] = useState<BlogMedia | null>(null);
  const [editForm, setEditForm] = useState({ alt_text: '', caption: '' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadMedia();
    loadStats();
  }, [currentPage, searchTerm, filterType]);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { type: filterType })
      });

      const response = await fetch(`/api/blog-media?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMedia(result.data.media);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.total);
      } else {
        setError('Failed to load media');
      }
    } catch (error) {
      console.error('Error loading media:', error);
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/blog-media/stats', {
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('media', files[0]);

      const response = await fetch('/api/blog-media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setMedia(prev => [result.data, ...prev]);
        loadStats();
      } else {
        const error = await response.json();
        setError(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed');
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleEditMedia = (media: BlogMedia) => {
    setEditingMedia(media);
    setEditForm({
      alt_text: media.alt_text || '',
      caption: media.caption || ''
    });
  };

  const saveEdit = async () => {
    if (!editingMedia) return;

    try {
      const response = await fetch(`/api/blog-media/${editingMedia.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const result = await response.json();
        setMedia(prev => prev.map(item => 
          item.id === editingMedia.id ? result.data : item
        ));
        setEditingMedia(null);
      } else {
        setError('Failed to update media');
      }
    } catch (error) {
      console.error('Edit error:', error);
      setError('Failed to update media');
    }
  };

  const deleteMedia = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      const response = await fetch(`/api/blog-media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMedia(prev => prev.filter(item => item.id !== mediaId));
        setSelectedMedia(null);
        loadStats();
      } else {
        setError('Failed to delete media');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete media');
    }
  };

  const handleMediaSelect = (mediaItem: BlogMedia) => {
    if (selectionMode && onSelect) {
      onSelect(mediaItem);
    } else {
      setSelectedMedia(mediaItem);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = !searchTerm || 
      item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.alt_text && item.alt_text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || 
      (filterType === 'image' && item.mime_type.startsWith('image/'));
    
    return matchesSearch && matchesType;
  });

  const renderMediaGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredMedia.map(mediaItem => (
        <div
          key={mediaItem.id}
          className={`group relative bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
            selectedMedia?.id === mediaItem.id 
              ? 'border-blue-500 shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleMediaSelect(mediaItem)}
        >
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            {mediaItem.mime_type.startsWith('image/') ? (
              <img
                src={mediaItem.publicUrl}
                alt={mediaItem.alt_text || mediaItem.original_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <DocumentTextIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          
          <div className="p-2">
            <p className="text-xs font-medium text-gray-900 truncate">
              {mediaItem.original_name}
            </p>
            <p className="text-xs text-gray-500">
              {mediaItem.formattedFileSize}
            </p>
            {mediaItem.displaySize !== 'Unknown' && (
              <p className="text-xs text-gray-400">
                {mediaItem.displaySize}
              </p>
            )}
          </div>

          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditMedia(mediaItem);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
              >
                <PencilIcon className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMedia(mediaItem.id);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetailView = () => {
    if (!selectedMedia) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedMedia(null)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Library
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditMedia(selectedMedia)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {selectionMode && onSelect && (
              <button
                onClick={() => onSelect(selectedMedia)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Select
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {selectedMedia.mime_type.startsWith('image/') ? (
              <img
                src={selectedMedia.publicUrl}
                alt={selectedMedia.alt_text || selectedMedia.original_name}
                className="w-full rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedMedia.original_name}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>File size:</strong> {selectedMedia.formattedFileSize}</p>
                <p><strong>Type:</strong> {selectedMedia.mime_type}</p>
                {selectedMedia.displaySize !== 'Unknown' && (
                  <p><strong>Dimensions:</strong> {selectedMedia.displaySize}</p>
                )}
                <p><strong>Uploaded:</strong> {new Date(selectedMedia.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={selectedMedia.publicUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(selectedMedia.publicUrl)}
                  className="px-3 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            {selectedMedia.alt_text && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <p className="text-sm text-gray-900">{selectedMedia.alt_text}</p>
              </div>
            )}

            {selectedMedia.caption && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <p className="text-sm text-gray-900">{selectedMedia.caption}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${selectionMode ? 'fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-auto' : 'max-w-7xl mx-auto px-4 py-8'}`}>
      <div className={`${selectionMode ? 'relative top-10 mx-auto border shadow-lg rounded-md bg-white mb-10 max-w-6xl' : ''}`}>
        <div className={`${selectionMode ? 'p-6' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <PhotoIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Blog Media Library
              </h2>
              {selectionMode && onClose && (
                <button
                  onClick={onClose}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="sr-only"
                />
                <div className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  <ArrowUpOnSquareIcon className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </div>
              </label>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Files</div>
                <div className="text-2xl font-semibold text-gray-900">{stats.totalFiles}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Size</div>
                <div className="text-2xl font-semibold text-gray-900">{stats.formattedTotalSize}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Images</div>
                <div className="text-2xl font-semibold text-gray-900">{stats.imageFiles}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Recent (7 days)</div>
                <div className="text-2xl font-semibold text-gray-900">{stats.recentUploads}</div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images Only</option>
            </select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading media...</p>
            </div>
          ) : selectedMedia && !selectionMode ? (
            renderDetailView()
          ) : filteredMedia.length > 0 ? (
            <div>
              {renderMediaGrid()}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                  </p>
                  
                  <div className="flex space-x-1">
                    {currentPage > 1 && (
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    )}
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-lg ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    {currentPage < totalPages && (
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No media files found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingMedia && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-auto">
          <div className="relative top-1/2 mx-auto p-6 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white transform -translate-y-1/2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Media</h3>
              <button
                onClick={() => setEditingMedia(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editForm.alt_text}
                  onChange={(e) => setEditForm(prev => ({ ...prev, alt_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the image for accessibility..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption
                </label>
                <textarea
                  value={editForm.caption}
                  onChange={(e) => setEditForm(prev => ({ ...prev, caption: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional caption for the image..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingMedia(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}