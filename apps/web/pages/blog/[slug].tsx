import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  ArrowLeftIcon,
  ShareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category: string;
  tags: string[];
  author_id: number;
  published_at: string;
  view_count: number;
  author_name: string;
  reading_time: number;
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
  formattedDate: string;
  formattedContent: string;
}

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  category: string;
  published_at: string;
  reading_time: number;
  formattedDate: string;
}

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/blog/${postSlug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Post not found');
        } else {
          setError('Failed to load post');
        }
        return;
      }

      const data = await response.json();
      setPost(data.data.post);

      // Fetch related posts
      if (data.data.post?.category) {
        fetchRelatedPosts(data.data.post.category, data.data.post.id);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category: string, currentPostId: number) => {
    try {
      const response = await fetch(`/api/blog?category=${category}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current post
        const filtered = data.data.posts?.filter((p: RelatedPost) => p.id !== currentPostId) || [];
        setRelatedPosts(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const categoryColors: { [key: string]: string } = {
    'market-news': 'bg-blue-100 text-blue-800',
    'buying-tips': 'bg-green-100 text-green-800',
    'selling-tips': 'bg-purple-100 text-purple-800',
    'lifestyle': 'bg-orange-100 text-orange-800',
    'community': 'bg-pink-100 text-pink-800'
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const sharePost = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <Layout title="Loading..." description="">
        <div className="min-h-screen bg-white">
          <div className="container py-20">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-secondary-300 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-secondary-300 rounded mb-8 w-1/2"></div>
                <div className="h-64 bg-secondary-300 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-secondary-300 rounded"></div>
                  <div className="h-4 bg-secondary-300 rounded"></div>
                  <div className="h-4 bg-secondary-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout title="Post Not Found" description="The requested blog post could not be found.">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              {error === 'Post not found' ? '404 - Post Not Found' : 'Error Loading Post'}
            </h1>
            <p className="text-xl text-secondary-600 mb-8">
              {error === 'Post not found' 
                ? 'The blog post you\'re looking for doesn\'t exist or has been moved.'
                : 'We\'re having trouble loading this post. Please try again later.'
              }
            </p>
            <Link
              href="/blog"
              className="btn-primary inline-flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={post.seo?.meta_title || post.title}
      description={post.seo?.meta_description || post.excerpt}
    >
      <article className="bg-white">
        {/* Back Navigation */}
        <div className="container pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <header className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  categoryColors[post.category] || 'bg-secondary-100 text-secondary-700'
                }`}>
                  {formatCategoryName(post.category)}
                </span>
                <time className="text-secondary-500 flex items-center">
                  <CalendarDaysIcon className="w-4 h-4 mr-1" />
                  {post.formattedDate}
                </time>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-center gap-6 text-secondary-600">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {post.author_name}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {post.reading_time} min read
                </div>
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  {post.view_count} views
                </div>
                <button
                  onClick={sharePost}
                  className="flex items-center hover:text-primary-600 transition-colors duration-200"
                >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="container mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="container pb-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg prose-secondary max-w-none"
              dangerouslySetInnerHTML={{ __html: post.formattedContent || post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-secondary-200">
                <div className="flex items-center gap-4">
                  <TagIcon className="w-5 h-5 text-secondary-400" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-20 bg-secondary-50">
            <div className="container">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-secondary-900 mb-12 text-center">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.article
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      viewport={{ once: true }}
                      className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200 overflow-hidden"
                    >
                      {relatedPost.featured_image && (
                        <div className="relative h-48 bg-secondary-200">
                          <Image
                            src={relatedPost.featured_image}
                            alt={relatedPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            categoryColors[relatedPost.category] || 'bg-secondary-100 text-secondary-700'
                          }`}>
                            {formatCategoryName(relatedPost.category)}
                          </span>
                          <time className="text-xs text-secondary-500">
                            {relatedPost.formattedDate}
                          </time>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-secondary-900 mb-3 line-clamp-2">
                          <Link
                            href={`/blog/${relatedPost.slug}`}
                            className="hover:text-primary-600 transition-colors duration-200"
                          >
                            {relatedPost.title}
                          </Link>
                        </h3>
                        
                        <p className="text-secondary-600 text-sm line-clamp-2 mb-4">
                          {relatedPost.excerpt}
                        </p>
                        
                        <div className="text-xs text-secondary-500">
                          <ClockIcon className="w-3 h-3 inline mr-1" />
                          {relatedPost.reading_time} min read
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
}