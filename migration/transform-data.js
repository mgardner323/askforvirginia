#!/usr/bin/env node

/**
 * WordPress to MariaDB Data Transformer
 * Converts WordPress data to match our Sequelize models
 */

const fs = require('fs').promises;
const path = require('path');

class DataTransformer {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.outputDir = path.join(__dirname, 'data', 'transformed');
  }

  async transform() {
    console.log('🔄 Starting data transformation...');
    
    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Find latest extraction files
    const files = await fs.readdir(this.dataDir);
    const latestDate = files
      .filter(f => f.startsWith('wp_posts_'))
      .map(f => f.match(/wp_posts_(\d{4}-\d{2}-\d{2})\.json/))
      .filter(match => match)
      .map(match => match[1])
      .sort()
      .reverse()[0];
    
    if (!latestDate) {
      throw new Error('No WordPress extraction files found');
    }
    
    console.log(`📅 Using extraction from: ${latestDate}`);
    
    // Load WordPress data
    const posts = JSON.parse(await fs.readFile(path.join(this.dataDir, `wp_posts_${latestDate}.json`), 'utf8'));
    const users = JSON.parse(await fs.readFile(path.join(this.dataDir, `wp_users_${latestDate}.json`), 'utf8'));
    const media = JSON.parse(await fs.readFile(path.join(this.dataDir, `wp_media_${latestDate}.json`), 'utf8'));
    
    console.log(`📊 Processing ${posts.length} posts, ${users.length} users, ${media.length} media files`);
    
    // Transform users
    const transformedUsers = await this.transformUsers(users);
    await fs.writeFile(
      path.join(this.outputDir, `users_transformed_${latestDate}.json`),
      JSON.stringify(transformedUsers, null, 2)
    );
    
    // Transform posts to blog posts and pages
    const { blogPosts, pages } = await this.transformPosts(posts, transformedUsers);
    await fs.writeFile(
      path.join(this.outputDir, `blog_posts_transformed_${latestDate}.json`),
      JSON.stringify(blogPosts, null, 2)
    );
    
    await fs.writeFile(
      path.join(this.outputDir, `pages_transformed_${latestDate}.json`),
      JSON.stringify(pages, null, 2)
    );
    
    // Create transformation summary
    const summary = {
      transformation_date: new Date().toISOString(),
      source_date: latestDate,
      results: {
        users: transformedUsers.length,
        blog_posts: blogPosts.length,
        pages: pages.length,
        media_files: media.length
      }
    };
    
    await fs.writeFile(
      path.join(this.outputDir, `transformation_summary_${latestDate}.json`),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('✅ Data transformation completed!');
    console.log(`📊 Transformed: ${summary.results.users} users, ${summary.results.blog_posts} blog posts, ${summary.results.pages} pages`);
    
    return summary;
  }

  async transformUsers(wpUsers) {
    console.log('👥 Transforming users...');
    
    return wpUsers.map(user => ({
      // Map WordPress fields to our User model
      wp_id: user.ID,
      email: user.user_email,
      password: '$2b$12$placeholder.hash.will.need.reset', // Placeholder - users need to reset
      profile: {
        first_name: user.display_name?.split(' ')[0] || 'Unknown',
        last_name: user.display_name?.split(' ').slice(1).join(' ') || 'User',
        phone: '',
        bio: '',
        avatar: '',
        website: '',
        specializations: [],
        areas_served: [],
        license_number: ''
      },
      preferences: {
        property_types: [],
        price_range: {},
        locations: [],
        email_notifications: true
      },
      saved_properties: [],
      saved_searches: [],
      role: user.user_login === 'admin' ? 'admin' : 'client',
      is_verified: true,
      is_active: true,
      last_login: null,
      created_at: user.user_registered,
      updated_at: new Date().toISOString()
    }));
  }

  async transformPosts(wpPosts, transformedUsers) {
    console.log('📄 Transforming posts and pages...');
    
    const blogPosts = [];
    const pages = [];
    
    for (const post of wpPosts) {
      // Find the author
      const author = transformedUsers.find(u => u.wp_id === post.post_author);
      const authorId = author ? 1 : 1; // Default to first user if not found
      
      if (post.post_type === 'post') {
        // Transform to blog post
        const blogPost = {
          wp_id: post.ID,
          title: post.post_title,
          content: this.transformContent(post.post_content),
          excerpt: post.post_excerpt || this.generateExcerpt(post.post_content),
          slug: post.slug,
          status: post.post_status === 'publish' ? 'published' : 'draft',
          featured_image: this.extractFeaturedImage(post.meta),
          author_id: authorId,
          categories: this.extractCategories(post.meta),
          tags: this.extractTags(post.meta),
          meta: {
            seo_title: post.meta._yoast_wpseo_title || post.post_title,
            seo_description: post.meta._yoast_wpseo_metadesc || this.generateExcerpt(post.post_content),
            seo_keywords: post.meta._yoast_wpseo_focuskw || '',
            canonical_url: '',
            og_image: this.extractFeaturedImage(post.meta),
            reading_time: this.calculateReadingTime(post.post_content)
          },
          published_at: post.post_date,
          created_at: post.post_date,
          updated_at: post.post_modified
        };
        
        blogPosts.push(blogPost);
        
      } else if (post.post_type === 'page') {
        // Transform to page (could be stored as a special blog post or separate content)
        const page = {
          wp_id: post.ID,
          title: post.post_title,
          content: this.transformContent(post.post_content),
          slug: post.slug,
          type: 'page',
          template: this.detectPageTemplate(post.slug, post.meta),
          author_id: authorId,
          meta: {
            seo_title: post.meta._yoast_wpseo_title || post.post_title,
            seo_description: post.meta._yoast_wpseo_metadesc || this.generateExcerpt(post.post_content),
            parent_page: post.meta._wp_page_template || null
          },
          published_at: post.post_date,
          created_at: post.post_date,
          updated_at: post.post_modified
        };
        
        pages.push(page);
      }
    }
    
    return { blogPosts, pages };
  }

  transformContent(content) {
    if (!content) return '';
    
    // Basic cleanup of WordPress content
    return content
      // Remove WordPress-specific shortcodes
      .replace(/\[et_pb[^\]]*\]/g, '')
      .replace(/\[\/et_pb[^\]]*\]/g, '')
      .replace(/\[vc_[^\]]*\]/g, '')
      .replace(/\[\/vc_[^\]]*\]/g, '')
      // Clean up common WordPress HTML
      .replace(/<p>&nbsp;<\/p>/g, '')
      .replace(/<p><\/p>/g, '')
      // Convert WordPress galleries to simple HTML
      .replace(/\[gallery[^\]]*\]/g, '<div class="gallery">Gallery content</div>')
      .trim();
  }

  extractFeaturedImage(meta) {
    // Try to extract featured image from WordPress meta
    if (meta._thumbnail_id) {
      return `/wp-content/uploads/featured-image-${meta._thumbnail_id}.jpg`;
    }
    return '';
  }

  extractCategories(meta) {
    // WordPress categories - simplified extraction
    const categories = [];
    
    // Look for category-related meta keys
    Object.keys(meta || {}).forEach(key => {
      if (key.includes('category') && meta[key]) {
        categories.push(meta[key]);
      }
    });
    
    return categories.length > 0 ? categories : ['General'];
  }

  extractTags(meta) {
    // WordPress tags - simplified extraction
    const tags = [];
    
    // Look for tag-related meta keys
    Object.keys(meta || {}).forEach(key => {
      if (key.includes('tag') && meta[key]) {
        tags.push(meta[key]);
      }
    });
    
    return tags;
  }

  generateExcerpt(content, length = 160) {
    if (!content) return '';
    
    // Strip HTML and create excerpt
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  calculateReadingTime(content) {
    if (!content) return 1;
    
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  detectPageTemplate(slug, meta) {
    // Detect page type from slug or meta
    if (slug.includes('about')) return 'about';
    if (slug.includes('contact')) return 'contact';
    if (slug.includes('service')) return 'services';
    if (slug.includes('home') || slug === 'index') return 'home';
    
    return 'standard';
  }
}

if (require.main === module) {
  const transformer = new DataTransformer();
  transformer.transform().catch(error => {
    console.error('❌ Transformation failed:', error);
    process.exit(1);
  });
}

module.exports = DataTransformer;