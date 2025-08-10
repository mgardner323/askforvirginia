import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';
import BlogEditor from '../../../components/admin/BlogEditor';

interface BlogPost {
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

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (post: BlogPost) => {
    setSaving(true);

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(post)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message
        alert('Blog post created successfully!');
        
        // Redirect to blog management or edit page
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Failed to create blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/admin/blog');
    }
  };

  return (
    <AdminLayout title="New Blog Post">
      <BlogEditor
        onSave={handleSave}
        onCancel={handleCancel}
        saving={saving}
      />
    </AdminLayout>
  );
}