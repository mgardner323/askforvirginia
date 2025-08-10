#!/usr/bin/env node

/**
 * MariaDB Importer
 * Imports transformed WordPress data into MariaDB using Sequelize
 */

const fs = require('fs').promises;
const path = require('path');

// Import our Sequelize models
const { User, Property, BlogPost } = require('../../apps/api/src/models');
const { sequelize } = require('../../apps/api/src/config/database');

class MariaDBImporter {
  constructor() {
    this.importStats = {
      users: { imported: 0, skipped: 0, errors: 0 },
      properties: { imported: 0, skipped: 0, errors: 0 },
      blog_posts: { imported: 0, skipped: 0, errors: 0 }
    };
    this.userMapping = new Map(); // WordPress ID -> MariaDB ID mapping
  }

  /**
   * Load transformed data files
   */
  async loadTransformedData(dataDir) {
    console.log('📂 Loading transformed data...');
    
    const files = await fs.readdir(dataDir);
    const transformedFiles = files.filter(f => f.includes('_transformed_') && f.endsWith('.json'));
    
    const data = {};
    
    for (const file of transformedFiles) {
      const filePath = path.join(dataDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(content);
      
      const dataType = file.split('_transformed_')[0];
      data[dataType] = jsonData;
      console.log(`📄 Loaded ${jsonData.length} ${dataType} records`);
    }
    
    return data;
  }

  /**
   * Import users with error handling
   */
  async importUsers(users) {
    console.log('\n👥 Importing users...');
    
    for (const userData of users) {
      try {
        // Remove WordPress ID from data before import
        const { _wp_id, ...cleanUserData } = userData;
        
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: cleanUserData.email } });
        
        if (existingUser) {
          console.log(`⏭️  User ${cleanUserData.email} already exists, skipping`);
          this.userMapping.set(_wp_id, existingUser.id);
          this.importStats.users.skipped++;
          continue;
        }

        const user = await User.create(cleanUserData);
        this.userMapping.set(_wp_id, user.id);
        this.importStats.users.imported++;
        
        console.log(`✅ Imported user: ${user.email} (ID: ${user.id})`);
        
      } catch (error) {
        console.error(`❌ Failed to import user ${userData.email}:`, error.message);
        this.importStats.users.errors++;
      }
    }
  }

  /**
   * Import blog posts with author mapping
   */
  async importBlogPosts(blogPosts) {
    console.log('\n📝 Importing blog posts...');
    
    for (const postData of blogPosts) {
      try {
        const { _wp_id, ...cleanPostData } = postData;
        
        // Update author_id using our mapping
        if (this.userMapping.has(cleanPostData.author_id)) {
          cleanPostData.author_id = this.userMapping.get(cleanPostData.author_id);
        } else {
          // Default to first admin user if author not found
          const adminUser = await User.findOne({ where: { role: 'admin' } });
          cleanPostData.author_id = adminUser ? adminUser.id : 1;
        }

        // Check if post already exists
        const existingPost = await BlogPost.findOne({ where: { slug: cleanPostData.slug } });
        
        if (existingPost) {
          console.log(`⏭️  Blog post "${cleanPostData.title}" already exists, skipping`);
          this.importStats.blog_posts.skipped++;
          continue;
        }

        const post = await BlogPost.create(cleanPostData);
        this.importStats.blog_posts.imported++;
        
        console.log(`✅ Imported blog post: "${post.title}" (ID: ${post.id})`);
        
      } catch (error) {
        console.error(`❌ Failed to import blog post "${postData.title}":`, error.message);
        this.importStats.blog_posts.errors++;
      }
    }
  }

  /**
   * Import properties with agent mapping
   */
  async importProperties(properties) {
    console.log('\n🏠 Importing properties...');
    
    for (const propertyData of properties) {
      try {
        const { _wp_id, ...cleanPropertyData } = propertyData;
        
        // Update agent_id using our mapping
        if (this.userMapping.has(cleanPropertyData.agent_id)) {
          cleanPropertyData.agent_id = this.userMapping.get(cleanPropertyData.agent_id);
        } else {
          // Default to first admin/agent user if not found
          const agentUser = await User.findOne({ 
            where: { role: ['admin', 'agent'] } 
          });
          cleanPropertyData.agent_id = agentUser ? agentUser.id : 1;
        }

        // Check if property already exists
        const existingProperty = await Property.findOne({ 
          where: { mls_id: cleanPropertyData.mls_id } 
        });
        
        if (existingProperty) {
          console.log(`⏭️  Property ${cleanPropertyData.mls_id} already exists, skipping`);
          this.importStats.properties.skipped++;
          continue;
        }

        const property = await Property.create(cleanPropertyData);
        this.importStats.properties.imported++;
        
        console.log(`✅ Imported property: ${property.mls_id} at ${property.address.street} (ID: ${property.id})`);
        
      } catch (error) {
        console.error(`❌ Failed to import property ${propertyData.mls_id}:`, error.message);
        console.error('Property data:', JSON.stringify(propertyData, null, 2));
        this.importStats.properties.errors++;
      }
    }
  }

  /**
   * Generate import report
   */
  generateReport() {
    console.log('\n📊 Import Summary:');
    console.log('==================');
    
    for (const [type, stats] of Object.entries(this.importStats)) {
      console.log(`\n${type.toUpperCase()}:`);
      console.log(`  ✅ Imported: ${stats.imported}`);
      console.log(`  ⏭️  Skipped:  ${stats.skipped}`);
      console.log(`  ❌ Errors:   ${stats.errors}`);
      console.log(`  📊 Total:    ${stats.imported + stats.skipped + stats.errors}`);
    }

    const totalImported = Object.values(this.importStats).reduce((sum, stats) => sum + stats.imported, 0);
    const totalErrors = Object.values(this.importStats).reduce((sum, stats) => sum + stats.errors, 0);
    
    console.log('\n🎯 Overall:');
    console.log(`  ✅ Successfully imported: ${totalImported} records`);
    console.log(`  ❌ Errors encountered: ${totalErrors} records`);
    
    return {
      stats: this.importStats,
      success: totalErrors === 0,
      totalImported,
      totalErrors
    };
  }

  /**
   * Run full import process
   */
  async import(dataDir, options = {}) {
    console.log('📥 Starting MariaDB import process...\n');
    
    try {
      // Test database connection
      await sequelize.authenticate();
      console.log('✅ MariaDB connection established');
      
      // Optionally sync database (create tables if they don't exist)
      if (options.sync) {
        await sequelize.sync({ alter: true });
        console.log('✅ Database schema synchronized');
      }

      const transformedData = await this.loadTransformedData(dataDir);
      
      // Import in order: users first, then content that references users
      if (transformedData.users && transformedData.users.length > 0) {
        await this.importUsers(transformedData.users);
      }
      
      if (transformedData.blog_posts && transformedData.blog_posts.length > 0) {
        await this.importBlogPosts(transformedData.blog_posts);
      }
      
      if (transformedData.properties && transformedData.properties.length > 0) {
        await this.importProperties(transformedData.properties);
      }

      const report = this.generateReport();
      
      // Save import report
      const reportFile = path.join(dataDir, `import_report_${new Date().toISOString().split('T')[0]}.json`);
      await fs.writeFile(reportFile, JSON.stringify({
        import_date: new Date().toISOString(),
        ...report
      }, null, 2));
      
      console.log(`\n📋 Import report saved to: ${reportFile}`);
      
      if (report.success) {
        console.log('\n🎉 Import completed successfully!');
      } else {
        console.log('\n⚠️  Import completed with errors. Please review the log above.');
      }
      
    } catch (error) {
      console.error('❌ Import process failed:', error.message);
      console.error(error.stack);
      throw error;
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const dataDir = args[0] || path.join(__dirname, '../data/transformed');
  const sync = args.includes('--sync');
  
  console.log(`📁 Data directory: ${dataDir}`);
  console.log(`🔄 Sync database: ${sync ? 'Yes' : 'No'}`);
  
  const importer = new MariaDBImporter();
  importer.import(dataDir, { sync }).catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });
}

module.exports = MariaDBImporter;