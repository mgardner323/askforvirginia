#!/usr/bin/env node

/**
 * WordPress Content Extractor
 * Extracts content from WordPress database for migration to MariaDB
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

class WordPressExtractor {
  constructor(config) {
    this.config = config;
    this.connection = null;
    this.wpPrefix = 'wp_'; // Will be auto-detected
    this.extractedData = {
      posts: [],
      pages: [],
      properties: [],
      users: [],
      media: [],
      categories: [],
      tags: [],
      comments: []
    };
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        port: this.config.port || 3306
      });
      console.log('✅ Connected to WordPress database');
      
      // Auto-detect WordPress table prefix
      await this.detectTablePrefix();
    } catch (error) {
      console.error('❌ Failed to connect to WordPress database:', error.message);
      process.exit(1);
    }
  }

  async detectTablePrefix() {
    try {
      const [tables] = await this.connection.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      // Find the WordPress table prefix by looking for posts table
      const prefixes = new Set();
      tableNames.forEach(table => {
        const parts = table.split('_');
        if (parts.length > 1 && parts[parts.length - 1] === 'posts') {
          const prefix = parts.slice(0, -1).join('_') + '_';
          prefixes.add(prefix);
        }
      });
      
      if (prefixes.size > 0) {
        this.wpPrefix = Array.from(prefixes)[0];
        console.log(`🔍 Detected WordPress table prefix: ${this.wpPrefix}`);
      } else {
        console.log(`⚠️ Using default WordPress prefix: ${this.wpPrefix}`);
      }
    } catch (error) {
      console.error('⚠️ Could not detect table prefix, using default:', error.message);
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('📊 Disconnected from WordPress database');
    }
  }

  /**
   * Extract all posts (including custom post types)
   */
  async extractPosts() {
    console.log('📄 Extracting posts and pages...');
    
    const query = `
      SELECT 
        p.ID,
        p.post_author,
        p.post_date,
        p.post_content,
        p.post_title,
        p.post_excerpt,
        p.post_status,
        p.post_name as slug,
        p.post_type,
        p.post_modified,
        u.user_login,
        u.user_email,
        u.display_name
      FROM ${this.wpPrefix}posts p
      LEFT JOIN ${this.wpPrefix}users u ON p.post_author = u.ID
      WHERE p.post_status IN ('publish', 'private', 'draft')
      AND p.post_type IN ('post', 'page', 'property')
      ORDER BY p.post_date DESC
    `;

    const [rows] = await this.connection.execute(query);

    for (const row of rows) {
      // Get post meta data
      const metaQuery = `
        SELECT meta_key, meta_value 
        FROM ${this.wpPrefix}postmeta 
        WHERE post_id = ?
      `;
      const [metaRows] = await this.connection.execute(metaQuery, [row.ID]);
      
      const meta = {};
      metaRows.forEach(metaRow => {
        meta[metaRow.meta_key] = metaRow.meta_value;
      });

      // Get categories and tags
      const termsQuery = `
        SELECT t.name, t.slug, tt.taxonomy
        FROM ${this.wpPrefix}term_relationships tr
        JOIN ${this.wpPrefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
        JOIN ${this.wpPrefix}terms t ON tt.term_id = t.term_id
        WHERE tr.object_id = ?
        AND tt.taxonomy IN ('category', 'post_tag', 'property_type', 'property_status')
      `;
      const [termsRows] = await this.connection.execute(termsQuery, [row.ID]);

      const categories = [];
      const tags = [];
      const propertyTypes = [];
      const propertyStatuses = [];

      termsRows.forEach(term => {
        switch (term.taxonomy) {
          case 'category':
            categories.push({ name: term.name, slug: term.slug });
            break;
          case 'post_tag':
            tags.push({ name: term.name, slug: term.slug });
            break;
          case 'property_type':
            propertyTypes.push(term.name);
            break;
          case 'property_status':
            propertyStatuses.push(term.name);
            break;
        }
      });

      const postData = {
        id: row.ID,
        title: row.post_title,
        slug: row.slug,
        content: row.post_content,
        excerpt: row.post_excerpt,
        status: row.post_status,
        type: row.post_type,
        published_at: row.post_date,
        modified_at: row.post_modified,
        author: {
          id: row.post_author,
          username: row.user_login,
          email: row.user_email,
          display_name: row.display_name
        },
        meta: meta,
        categories: categories,
        tags: tags,
        property_types: propertyTypes,
        property_statuses: propertyStatuses
      };

      if (row.post_type === 'post') {
        this.extractedData.posts.push(postData);
      } else if (row.post_type === 'page') {
        this.extractedData.pages.push(postData);
      } else if (row.post_type === 'property') {
        this.extractedData.properties.push(postData);
      }
    }

    console.log(`📄 Found ${this.extractedData.posts.length} posts`);
    console.log(`📄 Found ${this.extractedData.pages.length} pages`);
    console.log(`🏠 Found ${this.extractedData.properties.length} properties`);
  }

  /**
   * Extract users
   */
  async extractUsers() {
    console.log('👥 Extracting users...');

    const query = `
      SELECT 
        u.ID,
        u.user_login,
        u.user_email,
        u.user_registered,
        u.user_status,
        u.display_name,
        um1.meta_value as first_name,
        um2.meta_value as last_name,
        um3.meta_value as description,
        um4.meta_value as capabilities
      FROM ${this.wpPrefix}users u
      LEFT JOIN ${this.wpPrefix}usermeta um1 ON u.ID = um1.user_id AND um1.meta_key = 'first_name'
      LEFT JOIN ${this.wpPrefix}usermeta um2 ON u.ID = um2.user_id AND um2.meta_key = 'last_name'
      LEFT JOIN ${this.wpPrefix}usermeta um3 ON u.ID = um3.user_id AND um3.meta_key = 'description'
      LEFT JOIN ${this.wpPrefix}usermeta um4 ON u.ID = um4.user_id AND um4.meta_key = 'wp_capabilities'
      ORDER BY u.user_registered DESC
    `;

    const [rows] = await this.connection.execute(query);

    for (const row of rows) {
      // Determine role from capabilities
      let role = 'client';
      if (row.capabilities) {
        const caps = JSON.parse(row.capabilities);
        if (caps.administrator) role = 'admin';
        else if (caps.editor || caps.author) role = 'agent';
      }

      this.extractedData.users.push({
        id: row.ID,
        username: row.user_login,
        email: row.user_email,
        registered: row.user_registered,
        status: row.user_status,
        role: role,
        profile: {
          first_name: row.first_name || '',
          last_name: row.last_name || '',
          display_name: row.display_name,
          bio: row.description || ''
        }
      });
    }

    console.log(`👥 Found ${this.extractedData.users.length} users`);
  }

  /**
   * Extract media files
   */
  async extractMedia() {
    console.log('🖼️ Extracting media files...');

    const query = `
      SELECT 
        p.ID,
        p.post_title,
        p.post_name as slug,
        p.guid as url,
        p.post_mime_type,
        p.post_date,
        pm.meta_value as attachment_metadata
      FROM ${this.wpPrefix}posts p
      LEFT JOIN ${this.wpPrefix}postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_wp_attachment_metadata'
      WHERE p.post_type = 'attachment'
      AND p.post_mime_type LIKE 'image/%'
      ORDER BY p.post_date DESC
    `;

    const [rows] = await this.connection.execute(query);

    for (const row of rows) {
      let metadata = {};
      if (row.attachment_metadata) {
        try {
          metadata = JSON.parse(row.attachment_metadata);
        } catch (e) {
          console.warn(`Failed to parse metadata for attachment ${row.ID}`);
        }
      }

      this.extractedData.media.push({
        id: row.ID,
        title: row.post_title,
        slug: row.slug,
        url: row.url,
        mime_type: row.post_mime_type,
        uploaded_at: row.post_date,
        metadata: metadata
      });
    }

    console.log(`🖼️ Found ${this.extractedData.media.length} media files`);
  }

  /**
   * Save extracted data to JSON files
   */
  async saveData() {
    const dataDir = path.join(__dirname, '../data');
    
    // Ensure data directory exists
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString().split('T')[0];
    
    for (const [key, data] of Object.entries(this.extractedData)) {
      if (data.length > 0) {
        const filename = path.join(dataDir, `${key}_${timestamp}.json`);
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`💾 Saved ${data.length} ${key} to ${filename}`);
      }
    }

    // Save summary
    const summary = {
      extraction_date: new Date().toISOString(),
      totals: Object.fromEntries(
        Object.entries(this.extractedData).map(([key, data]) => [key, data.length])
      ),
      wordpress_config: {
        host: this.config.host,
        database: this.config.database
      }
    };

    const summaryFile = path.join(dataDir, `extraction_summary_${timestamp}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📋 Saved extraction summary to ${summaryFile}`);
  }

  /**
   * Run full extraction process
   */
  async extract() {
    console.log('🚀 Starting WordPress content extraction...\n');
    
    await this.connect();
    
    try {
      await this.extractUsers();
      await this.extractPosts();
      await this.extractMedia();
      await this.saveData();
      
      console.log('\n✅ Content extraction completed successfully!');
      console.log('📁 Check the migration/data directory for extracted files');
      
    } catch (error) {
      console.error('❌ Extraction failed:', error.message);
      console.error(error.stack);
    } finally {
      await this.disconnect();
    }
  }
}

// Configuration - Update with actual WordPress database credentials
const config = {
  host: process.env.WP_DB_HOST || 'localhost',
  user: process.env.WP_DB_USER || 'wordpress_user',
  password: process.env.WP_DB_PASS || 'wordpress_password',
  database: process.env.WP_DB_NAME || 'wordpress_db',
  port: process.env.WP_DB_PORT || 3306
};

// Run extraction if called directly
if (require.main === module) {
  const extractor = new WordPressExtractor(config);
  extractor.extract().catch(console.error);
}

module.exports = WordPressExtractor;