#!/usr/bin/env node

/**
 * Blog Content Updater
 * Updates blog post content to use new media paths and clean up formatting
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

class BlogContentUpdater {
  constructor() {
    this.connection = null;
    this.config = {
      host: '127.0.0.1',
      port: 3306,
      user: 'virginia',
      password: 'Pinkhamster99!1',
      database: 'virginia'
    };
    this.urlMappings = {};
    this.updatedPosts = [];
  }

  async update() {
    console.log('🔄 Starting blog content cleanup and media path updates...');
    
    await this.connect();
    
    try {
      // Load URL mappings from media migration
      await this.loadUrlMappings();
      
      // Get all blog posts
      const posts = await this.getBlogPosts();
      
      // Update each post's content
      for (const post of posts) {
        await this.updatePostContent(post);
      }
      
      // Generate update report
      await this.generateReport();
      
      console.log('✅ Blog content update completed!');
      
    } finally {
      await this.disconnect();
    }
  }

  async connect() {
    this.connection = await mysql.createConnection(this.config);
    console.log('✅ Connected to MariaDB');
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('📊 Disconnected from MariaDB');
    }
  }

  async loadUrlMappings() {
    try {
      const mappingFile = path.join(__dirname, 'data', 'media_url_mappings.json');
      const mappingContent = await fs.readFile(mappingFile, 'utf8');
      this.urlMappings = JSON.parse(mappingContent);
      console.log(`📋 Loaded ${Object.keys(this.urlMappings).length} URL mappings`);
    } catch (error) {
      console.log('⚠️ No URL mappings found, will only clean up content');
    }
  }

  async getBlogPosts() {
    const [posts] = await this.connection.execute(`
      SELECT id, title, content, slug 
      FROM blog_posts 
      ORDER BY id ASC
    `);
    
    console.log(`📝 Found ${posts.length} blog posts to process`);
    return posts;
  }

  async updatePostContent(post) {
    console.log(`🔧 Processing: "${post.title}"`);
    
    let updatedContent = post.content;
    let hasChanges = false;
    
    // 1. Update media URLs
    for (const [oldUrl, newUrl] of Object.entries(this.urlMappings)) {
      if (updatedContent.includes(oldUrl)) {
        updatedContent = updatedContent.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
        hasChanges = true;
        console.log(`   📸 Updated media URL: ${path.basename(oldUrl)}`);
      }
    }
    
    // 2. Clean up WordPress-specific content
    const originalLength = updatedContent.length;
    
    // Remove Divi builder shortcodes
    updatedContent = updatedContent.replace(/\[et_pb[^\]]*\]/g, '');
    updatedContent = updatedContent.replace(/\[\/et_pb[^\]]*\]/g, '');
    
    // Remove Visual Composer shortcodes
    updatedContent = updatedContent.replace(/\[vc_[^\]]*\]/g, '');
    updatedContent = updatedContent.replace(/\[\/vc_[^\]]*\]/g, '');
    
    // Clean up common WordPress artifacts
    updatedContent = updatedContent.replace(/<p>&nbsp;<\/p>/g, '');
    updatedContent = updatedContent.replace(/<p><\/p>/g, '');
    updatedContent = updatedContent.replace(/&nbsp;/g, ' ');
    
    // Convert WordPress galleries to placeholder
    updatedContent = updatedContent.replace(/\[gallery[^\]]*\]/g, '<div class="gallery-placeholder">Gallery content will be displayed here</div>');
    
    // Clean up extra whitespace
    updatedContent = updatedContent.replace(/\n\s*\n/g, '\n\n');
    updatedContent = updatedContent.trim();
    
    if (updatedContent.length !== originalLength) {
      hasChanges = true;
      console.log(`   🧹 Cleaned up content (${originalLength} → ${updatedContent.length} chars)`);
    }
    
    // 3. Update database if changes were made
    if (hasChanges) {
      await this.connection.execute(`
        UPDATE blog_posts 
        SET content = ?, updated_at = NOW()
        WHERE id = ?
      `, [updatedContent, post.id]);
      
      this.updatedPosts.push({
        id: post.id,
        title: post.title,
        slug: post.slug,
        changes: {
          media_urls_updated: Object.keys(this.urlMappings).filter(url => post.content.includes(url)).length,
          content_cleaned: updatedContent.length !== originalLength,
          original_length: originalLength,
          new_length: updatedContent.length
        }
      });
      
      console.log(`   ✅ Updated post in database`);
    } else {
      console.log(`   ℹ️  No changes needed`);
    }
  }

  async generateReport() {
    const report = {
      update_date: new Date().toISOString(),
      total_posts_processed: this.updatedPosts.length + (await this.getBlogPosts()).length - this.updatedPosts.length,
      posts_updated: this.updatedPosts.length,
      url_mappings_applied: Object.keys(this.urlMappings).length,
      updated_posts: this.updatedPosts
    };
    
    await fs.writeFile(
      path.join(__dirname, 'data', 'blog_content_update_report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📊 Content Update Report:');
    console.log(`✅ Posts updated: ${report.posts_updated} out of ${report.total_posts_processed}`);
    console.log(`🔗 URL mappings applied: ${report.url_mappings_applied}`);
    console.log(`📁 Report saved to: blog_content_update_report.json`);
  }
}

if (require.main === module) {
  const updater = new BlogContentUpdater();
  updater.update().catch(error => {
    console.error('❌ Blog content update failed:', error);
    process.exit(1);
  });
}

module.exports = BlogContentUpdater;