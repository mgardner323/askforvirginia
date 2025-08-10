import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import AIContentGenerator from './AIContentGenerator';
import BlogMediaLibrary from './BlogMediaLibrary';
import { 
  PhotoIcon, 
  EyeIcon, 
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

import 'react-quill/dist/quill.snow.css';

// Custom CSS for the editor
const editorStyle = `
  .ql-toolbar .ql-media-library {
    display: inline-block;
    cursor: pointer;
    color: #444;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #f8f9fa;
    font-size: 12px;
    margin: 0 2px;
  }
  .ql-toolbar .ql-media-library:hover {
    background: #e9ecef;
    border-color: #aaa;
  }
  .ql-toolbar .ql-media-library::before {
    content: '📁 Media';
  }
  .ql-editor {
    min-height: 300px;
    font-size: 16px;
    line-height: 1.6;
  }
  .ql-editor img {
    max-width: 100%;
    height: auto;
    margin: 10px 0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .ql-editor blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 16px;
    margin: 16px 0;
    background: #f8fafc;
    border-radius: 0 8px 8px 0;
  }
`;

// Inject styles when component mounts
if (typeof document !== 'undefined') {
  const styleId = 'blog-editor-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = editorStyle;
    document.head.appendChild(styleElement);
  }
}

interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'market-news' | 'buying-tips' | 'selling-tips' | 'lifestyle' | 'community';
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  featured_image?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface BlogEditorProps {
  initialPost?: BlogPost;
  onSave: (post: BlogPost) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export default function BlogEditor({ initialPost, onSave, onCancel, saving = false }: BlogEditorProps) {
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'market-news',
    tags: [],
    status: 'draft',
    published_at: null,
    featured_image: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    },
    ...initialPost
  });

  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryMode, setMediaLibraryMode] = useState<'featured' | 'content'>('featured');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (initialPost) {
      setPost({ ...initialPost });
    }
  }, [initialPost]);

  // Auto-generate slug from title
  useEffect(() => {
    if (post.title && (!post.slug || post.slug === generateSlug(post.title))) {
      setPost(prev => ({
        ...prev,
        slug: generateSlug(post.title)
      }));
    }
  }, [post.title]);

  // Auto-generate SEO title from main title
  useEffect(() => {
    if (post.title && (!post.seo.title || post.seo.title === post.title)) {
      setPost(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          title: post.title
        }
      }));
    }
  }, [post.title]);

  // Auto-generate SEO description from excerpt
  useEffect(() => {
    if (post.excerpt && (!post.seo.description || post.seo.description === post.excerpt)) {
      setPost(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          description: post.excerpt.length > 160 ? post.excerpt.substring(0, 160) + '...' : post.excerpt
        }
      }));
    }
  }, [post.excerpt]);

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .trim();
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean'],
        ['media-library'] // Custom button for media library
      ],
      handlers: {
        'media-library': () => {
          setMediaLibraryMode('content');
          setShowMediaLibrary(true);
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'script',
    'code-block'
  ];

  const addTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !post.seo.keywords.includes(keywordInput.trim())) {
      setPost(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keywordInput.trim()]
        }
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setPost(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(keyword => keyword !== keywordToRemove)
      }
    }));
  };

  const validatePost = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!post.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!post.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!post.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (post.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt must be 500 characters or less';
    }

    if (!post.content.trim() || post.content === '<p><br></p>') {
      newErrors.content = 'Content is required';
    }

    if (post.status === 'scheduled' && !post.published_at) {
      newErrors.published_at = 'Publish date is required for scheduled posts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validatePost()) return;

    try {
      await onSave(post);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleAIContentGenerated = (generatedContent: any) => {
    setPost(prev => ({
      ...prev,
      title: generatedContent.title,
      content: generatedContent.content,
      excerpt: generatedContent.excerpt,
      tags: generatedContent.suggestedTags || [],
      seo: {
        title: generatedContent.seo?.title || generatedContent.title,
        description: generatedContent.seo?.description || generatedContent.excerpt,
        keywords: generatedContent.seo?.keywords || []
      }
    }));
    
    // Auto-generate slug from AI title
    if (generatedContent.title) {
      setPost(prev => ({
        ...prev,
        slug: generateSlug(generatedContent.title)
      }));
    }
  };

  const handleMediaSelect = (media: any) => {
    if (mediaLibraryMode === 'featured') {
      setPost(prev => ({
        ...prev,
        featured_image: media.publicUrl
      }));
    } else if (mediaLibraryMode === 'content') {
      insertImageIntoContent(media);
    }
    setShowMediaLibrary(false);
  };

  const insertImageIntoContent = (media: any) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      
      quill.insertEmbed(index, 'image', media.publicUrl);
      quill.setSelection(index + 1);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'market-news': 'Market News',
      'buying-tips': 'Buying Tips',
      'selling-tips': 'Selling Tips',
      'lifestyle': 'Lifestyle',
      'community': 'Community'
    };
    return labels[category] || category;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'published':
        return { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100', label: 'Published' };
      case 'draft':
        return { icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Draft' };
      case 'scheduled':
        return { icon: CalendarIcon, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Scheduled' };
      default:
        return { icon: ClockIcon, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Draft' };
    }
  };

  const statusInfo = getStatusInfo(post.status);

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Editor
          </button>
        </div>
        
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <header className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {getCategoryLabel(post.category)}
              </span>
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{post.excerpt}</p>
          </header>
          
          {post.featured_image && (
            <div className="mb-6">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter post title..."
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={post.slug}
                onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="post-url-slug"
              />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              <p className="text-xs text-gray-500 mt-1">URL: /blog/{post.slug}</p>
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={post.excerpt}
                onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.excerpt ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Brief description of the post (max 500 characters)..."
              />
              {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
              <p className="text-xs text-gray-500 mt-1">{post.excerpt.length}/500 characters</p>
            </div>

            {/* Content Editor */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <div className={`border rounded-lg ${errors.content ? 'border-red-300' : 'border-gray-300'}`}>
                <ReactQuill
                  ref={quillRef}
                  value={post.content}
                  onChange={(content) => setPost(prev => ({ ...prev, content }))}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  style={{ minHeight: '300px' }}
                />
              </div>
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                <input
                  type="text"
                  value={post.seo.title}
                  onChange={(e) => setPost(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, title: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO optimized title..."
                />
                <p className="text-xs text-gray-500 mt-1">{post.seo.title.length}/60 characters recommended</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                <textarea
                  value={post.seo.description}
                  onChange={(e) => setPost(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, description: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO meta description..."
                />
                <p className="text-xs text-gray-500 mt-1">{post.seo.description.length}/160 characters recommended</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.seo.keywords.map(keyword => (
                    <span key={keyword} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add keyword..."
                  />
                  <button
                    onClick={addKeyword}
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Publish Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Publish</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={post.status}
                  onChange={(e) => setPost(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {post.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publish Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setPost(prev => ({ 
                      ...prev, 
                      published_at: e.target.value ? new Date(e.target.value).toISOString() : null 
                    }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.published_at ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.published_at && <p className="text-red-500 text-sm mt-1">{errors.published_at}</p>}
                </div>
              )}

              <div className={`flex items-center p-3 rounded-lg ${statusInfo.bg}`}>
                <statusInfo.icon className={`h-5 w-5 ${statusInfo.color} mr-2`} />
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAIGenerator(true)}
                  type="button"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                  title="Generate content with AI"
                >
                  <SparklesIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={onCancel}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={post.category}
                  onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="market-news">Market News</option>
                  <option value="buying-tips">Buying Tips</option>
                  <option value="selling-tips">Selling Tips</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="community">Community</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-600 hover:text-gray-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tag..."
                  />
                  <button
                    onClick={addTag}
                    type="button"
                    className="px-4 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setMediaLibraryMode('featured');
                    setShowMediaLibrary(true);
                  }}
                  type="button"
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FolderIcon className="h-4 w-4 mr-2" />
                  Media Library
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or paste Image URL</label>
                <input
                  type="url"
                  value={post.featured_image || ''}
                  onChange={(e) => setPost(prev => ({ ...prev, featured_image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {post.featured_image && (
                <div className="mt-2">
                  <img 
                    src={post.featured_image} 
                    alt="Featured image preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Content Generator Modal */}
      {showAIGenerator && (
        <AIContentGenerator
          onContentGenerated={handleAIContentGenerated}
          onClose={() => setShowAIGenerator(false)}
          initialCategory={post.category}
        />
      )}

      {/* Blog Media Library Modal */}
      {showMediaLibrary && (
        <BlogMediaLibrary
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaLibrary(false)}
          selectionMode={true}
        />
      )}
    </div>
  );
}