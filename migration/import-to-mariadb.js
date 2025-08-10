#!/usr/bin/env node

/**
 * MariaDB Data Importer
 * Imports transformed WordPress data into Virginia Real Estate database
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

class MariaDBImporter {
  constructor() {
    this.dataDir = path.join(__dirname, 'data', 'transformed');
    this.connection = null;
    
    // Load MariaDB config from apps/api/.env
    this.config = {
      host: '127.0.0.1',
      port: 3306,
      user: 'virginia',
      password: 'Pinkhamster99!1',
      database: 'virginia'
    };
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log('✅ Connected to MariaDB');
    } catch (error) {
      console.error('❌ Failed to connect to MariaDB:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('📊 Disconnected from MariaDB');
    }
  }

  async import() {
    console.log('🚀 Starting MariaDB import...');
    
    await this.connect();
    
    try {
      // Find latest transformed files
      const files = await fs.readdir(this.dataDir);
      const latestDate = files
        .filter(f => f.startsWith('users_transformed_'))
        .map(f => f.match(/users_transformed_(\d{4}-\d{2}-\d{2})\.json/))
        .filter(match => match)
        .map(match => match[1])
        .sort()
        .reverse()[0];
      
      if (!latestDate) {
        throw new Error('No transformed data files found');
      }
      
      console.log(`📅 Importing data from: ${latestDate}`);
      
      // Load transformed data
      const users = JSON.parse(await fs.readFile(
        path.join(this.dataDir, `users_transformed_${latestDate}.json`), 'utf8'
      ));
      
      const blogPosts = JSON.parse(await fs.readFile(
        path.join(this.dataDir, `blog_posts_transformed_${latestDate}.json`), 'utf8'
      ));
      
      console.log(`📊 Importing ${users.length} users and ${blogPosts.length} blog posts`);
      
      // Import users first (they're referenced by blog posts)
      const userIdMap = await this.importUsers(users);
      
      // Import blog posts with correct author IDs
      await this.importBlogPosts(blogPosts, userIdMap);
      
      // Create import summary
      const summary = {
        import_date: new Date().toISOString(),
        source_date: latestDate,
        imported: {
          users: users.length,
          blog_posts: blogPosts.length
        }
      };
      
      await fs.writeFile(
        path.join(path.dirname(this.dataDir), `import_summary_${latestDate}.json`),
        JSON.stringify(summary, null, 2)
      );
      
      console.log('✅ Import completed successfully!');
      console.log(`📊 Imported: ${summary.imported.users} users, ${summary.imported.blog_posts} blog posts`);
      
      return summary;
      
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async importUsers(users) {
    console.log('👥 Importing users...');
    
    const userIdMap = new Map(); // Map WordPress ID to new MariaDB ID
    
    for (const user of users) {
      try {
        // Check if user already exists
        const [existing] = await this.connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );
        
        if (existing.length > 0) {
          console.log(`⚠️ User ${user.email} already exists, skipping`);
          userIdMap.set(user.wp_id, existing[0].id);
          continue;
        }
        
        // Format dates properly for MySQL
        const formatDate = (dateStr) => {
          if (!dateStr) return null;
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 19).replace('T', ' ');
        };

        // Insert new user
        const [result] = await this.connection.execute(`
          INSERT INTO users (
            email, password, profile, preferences, saved_properties, 
            saved_searches, role, is_verified, is_active, last_login, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          user.email,
          user.password,
          JSON.stringify(user.profile),
          JSON.stringify(user.preferences),
          JSON.stringify(user.saved_properties),
          JSON.stringify(user.saved_searches),
          user.role,
          user.is_verified,
          user.is_active,
          user.last_login,
          formatDate(user.created_at),
          formatDate(user.updated_at)
        ]);
        
        userIdMap.set(user.wp_id, result.insertId);
        console.log(`✅ Imported user: ${user.email} (ID: ${result.insertId})`);
        
      } catch (error) {
        console.error(`❌ Failed to import user ${user.email}:`, error.message);
      }
    }
    
    return userIdMap;
  }

  async importBlogPosts(blogPosts, userIdMap) {
    console.log('📄 Importing blog posts...');
    
    for (const post of blogPosts) {
      try {
        // Check if post already exists
        const [existing] = await this.connection.execute(
          'SELECT id FROM blog_posts WHERE slug = ?',
          [post.slug]
        );
        
        if (existing.length > 0) {
          console.log(`⚠️ Blog post "${post.title}" already exists, skipping`);
          continue;
        }
        
        // Get the correct author ID from our mapping
        const authorId = userIdMap.get(post.wp_id) || 1; // Default to first user
        
        // Map category to our enum values
        const categoryMap = {
          'General': 'lifestyle',
          'Home': 'lifestyle',
          'Kitchen': 'lifestyle',
          'Bathroom': 'lifestyle',
          'Garden': 'lifestyle',
          'Real Estate': 'market-news',
          'Market': 'market-news'
        };
        
        const primaryCategory = post.categories && post.categories.length > 0 
          ? post.categories[0] 
          : 'General';
        const mappedCategory = categoryMap[primaryCategory] || 'lifestyle';

        // Format dates properly
        const formatDate = (dateStr) => {
          if (!dateStr) return null;
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 19).replace('T', ' ');
        };

        // Insert blog post
        const [result] = await this.connection.execute(`
          INSERT INTO blog_posts (
            title, content, excerpt, slug, status, featured_image,
            author_id, category, tags, seo, published_at, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          post.title,
          post.content,
          post.excerpt,
          post.slug,
          post.status,
          post.featured_image,
          authorId,
          mappedCategory,
          JSON.stringify(post.tags),
          JSON.stringify(post.meta),
          formatDate(post.published_at),
          formatDate(post.created_at),
          formatDate(post.updated_at)
        ]);
        
        console.log(`✅ Imported blog post: "${post.title}" (ID: ${result.insertId})`);
        
      } catch (error) {
        console.error(`❌ Failed to import blog post "${post.title}":`, error.message);
        console.error('Error details:', error);
      }
    }
  }
}

if (require.main === module) {
  const importer = new MariaDBImporter();
  importer.import().catch(error => {
    console.error('Fatal import error:', error);
    process.exit(1);
  });
}

module.exports = MariaDBImporter;