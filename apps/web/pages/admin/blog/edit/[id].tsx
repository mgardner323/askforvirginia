import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/admin/AdminLayout';
import BlogEditor from '../../../../components/admin/BlogEditor';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface BlogPost {
  id: number;
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
  created_at: string;
  updated_at: string;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadPost(parseInt(id));
    }
  }, [id]);

  const loadPost = async (postId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${postId}?admin=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPost(result.data);
      } else if (response.status === 404) {
        alert('Blog post not found');
        router.push('/admin/blog');
      } else {
        alert('Failed to load blog post');
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      alert('Failed to load blog post');
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    if (!post) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedPost)
      });

      if (response.ok) {
        const result = await response.json();
        setPost(result.data);
        
        // Show success message
        alert('Blog post updated successfully!');
        
        // Optionally redirect back to blog management
        // router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update blog post');
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
      alert('Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/admin/blog');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Blog Post">
        <div className="flex items-center justify-center h-64">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading post...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout title="Edit Blog Post">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Blog post not found</p>
            <button
              onClick={() => router.push('/admin/blog')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Blog Management
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit: ${post.title}`}>
      <BlogEditor
        initialPost={post}
        onSave={handleSave}
        onCancel={handleCancel}
        saving={saving}
      />
    </AdminLayout>
  );
}