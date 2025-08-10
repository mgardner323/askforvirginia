#!/usr/bin/env node

/**
 * Direct WordPress Content Extraction
 * Simplified extraction script with explicit IP addressing
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function extractWordPressData() {
  let connection;
  
  try {
    console.log('🚀 Starting WordPress extraction...');
    
    // Connect with explicit 127.0.0.1
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'mgardner323',
      password: 'Pinkhamster99!1',
      database: 'ask4'
    });
    
    console.log('✅ Connected to WordPress database');
    
    // Detect table prefix
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    let wpPrefix = 'wp_';
    for (const table of tableNames) {
      if (table.endsWith('_posts')) {
        const parts = table.split('_');
        if (parts.length > 1) {
          wpPrefix = parts.slice(0, -1).join('_') + '_';
          break;
        }
      }
    }
    
    console.log(`🔍 Using WordPress prefix: ${wpPrefix}`);
    
    // Extract published posts and pages
    console.log('📄 Extracting posts and pages...');
    const postsQuery = `
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
      FROM ${wpPrefix}posts p
      LEFT JOIN ${wpPrefix}users u ON p.post_author = u.ID
      WHERE p.post_status = 'publish'
      AND p.post_type IN ('post', 'page')
      ORDER BY p.post_date DESC
      LIMIT 100
    `;
    
    const [posts] = await connection.execute(postsQuery);
    console.log(`📝 Found ${posts.length} published posts and pages`);
    
    // Extract post meta for each post
    const postsWithMeta = [];
    for (const post of posts) {
      const metaQuery = `
        SELECT meta_key, meta_value 
        FROM ${wpPrefix}postmeta 
        WHERE post_id = ?
      `;
      const [metaRows] = await connection.execute(metaQuery, [post.ID]);
      
      const meta = {};
      metaRows.forEach(row => {
        meta[row.meta_key] = row.meta_value;
      });
      
      postsWithMeta.push({
        ...post,
        meta
      });
    }
    
    // Extract users
    console.log('👥 Extracting users...');
    const usersQuery = `
      SELECT 
        u.ID,
        u.user_login,
        u.user_email,
        u.user_registered,
        u.user_status,
        u.display_name
      FROM ${wpPrefix}users u
      ORDER BY u.user_registered DESC
    `;
    
    const [users] = await connection.execute(usersQuery);
    console.log(`👤 Found ${users.length} users`);
    
    // Extract media attachments
    console.log('🖼️ Extracting media...');
    const mediaQuery = `
      SELECT 
        p.ID,
        p.post_title,
        p.post_name as slug,
        p.post_date,
        p.guid as url,
        pm.meta_value as file_path
      FROM ${wpPrefix}posts p
      LEFT JOIN ${wpPrefix}postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_wp_attached_file'
      WHERE p.post_type = 'attachment'
      AND p.post_status = 'inherit'
      ORDER BY p.post_date DESC
      LIMIT 50
    `;
    
    const [media] = await connection.execute(mediaQuery);
    console.log(`🖼️ Found ${media.length} media files`);
    
    // Save extracted data
    const outputDir = path.join(__dirname, 'data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    await fs.writeFile(
      path.join(outputDir, `wp_posts_${timestamp}.json`),
      JSON.stringify(postsWithMeta, null, 2)
    );
    
    await fs.writeFile(
      path.join(outputDir, `wp_users_${timestamp}.json`),
      JSON.stringify(users, null, 2)
    );
    
    await fs.writeFile(
      path.join(outputDir, `wp_media_${timestamp}.json`),
      JSON.stringify(media, null, 2)
    );
    
    // Create summary
    const summary = {
      extraction_date: new Date().toISOString(),
      wordpress_prefix: wpPrefix,
      totals: {
        posts: postsWithMeta.length,
        users: users.length,
        media: media.length
      },
      post_breakdown: {
        posts: postsWithMeta.filter(p => p.post_type === 'post').length,
        pages: postsWithMeta.filter(p => p.post_type === 'page').length
      }
    };
    
    await fs.writeFile(
      path.join(outputDir, `extraction_summary_${timestamp}.json`),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('✅ Extraction completed successfully!');
    console.log(`📊 Extracted: ${summary.totals.posts} posts, ${summary.totals.users} users, ${summary.totals.media} media files`);
    console.log(`📁 Files saved to: ${outputDir}`);
    
    return summary;
    
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('📊 Database connection closed');
    }
  }
}

if (require.main === module) {
  extractWordPressData().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = extractWordPressData;