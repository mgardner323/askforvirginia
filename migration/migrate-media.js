#!/usr/bin/env node

/**
 * WordPress Media Migration
 * Downloads and processes WordPress media files for the new system
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class MediaMigrator {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.outputDir = path.join(__dirname, '..', 'apps', 'web', 'public', 'uploads');
    this.mediaData = null;
    this.downloadedFiles = [];
    this.failedDownloads = [];
  }

  async migrate() {
    console.log('🖼️ Starting WordPress media migration...');
    
    // Create uploads directory structure
    await this.createDirectories();
    
    // Load media data
    await this.loadMediaData();
    
    // Copy media files from WordPress directory
    await this.copyMediaFiles();
    
    // Update blog post references
    await this.updateBlogPostReferences();
    
    // Generate migration report
    await this.generateReport();
    
    console.log('✅ Media migration completed!');
  }

  async createDirectories() {
    console.log('📁 Creating upload directories...');
    
    const directories = [
      this.outputDir,
      path.join(this.outputDir, 'blog'),
      path.join(this.outputDir, 'properties'),
      path.join(this.outputDir, 'avatars')
    ];
    
    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    }
  }

  async loadMediaData() {
    console.log('📄 Loading WordPress media data...');
    
    const mediaFile = path.join(this.dataDir, 'wp_media_2025-08-08.json');
    const mediaContent = await fs.readFile(mediaFile, 'utf8');
    this.mediaData = JSON.parse(mediaContent);
    
    console.log(`📊 Found ${this.mediaData.length} media files to process`);
  }

  async copyMediaFiles() {
    console.log('📁 Copying media files from WordPress directory...');
    
    const wpUploadsDir = '/var/www/vhosts/askforvirginia.com/httpdocs/wp-content/uploads';
    
    for (let i = 0; i < this.mediaData.length; i++) {
      const media = this.mediaData[i];
      console.log(`📋 [${i + 1}/${this.mediaData.length}] Processing: ${media.post_title}`);
      
      try {
        await this.copyFile(media, wpUploadsDir);
        this.downloadedFiles.push({
          ...media,
          new_path: this.getNewMediaPath(media),
          status: 'success'
        });
      } catch (error) {
        console.log(`❌ Failed to copy ${media.file_path}: ${error.message}`);
        this.failedDownloads.push({
          ...media,
          error: error.message
        });
      }
    }
  }

  async copyFile(media, wpUploadsDir) {
    const sourcePath = path.join(wpUploadsDir, media.file_path);
    const newPath = this.getNewMediaPath(media);
    const targetPath = path.join(this.outputDir, newPath);
    
    // Ensure target directory exists
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    
    // Check if source file exists
    try {
      await fs.access(sourcePath);
    } catch (error) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    
    // Copy file to new location
    await fs.copyFile(sourcePath, targetPath);
    console.log(`✅ Copied: ${media.file_path} → ${newPath}`);
  }

  getNewMediaPath(media) {
    // Generate new organized path structure
    const date = new Date(media.post_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get file extension
    const originalPath = media.file_path || media.url.split('/').pop();
    const extension = path.extname(originalPath);
    
    // Create clean filename
    let filename = media.slug || media.post_title.toLowerCase();
    filename = filename
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (!filename) {
      filename = `media-${media.ID}`;
    }
    
    return `blog/${year}/${month}/${filename}${extension}`;
  }

  async updateBlogPostReferences() {
    console.log('🔗 Updating blog post media references...');
    
    // This would update the blog_posts table to replace WordPress URLs with new paths
    // For now, we'll create a mapping file that can be used later
    
    const urlMappings = {};
    
    for (const file of this.downloadedFiles) {
      urlMappings[file.url] = `/uploads/${file.new_path}`;
    }
    
    // Save URL mappings for reference
    await fs.writeFile(
      path.join(__dirname, 'data', 'media_url_mappings.json'),
      JSON.stringify(urlMappings, null, 2)
    );
    
    console.log(`✅ Generated URL mappings for ${Object.keys(urlMappings).length} files`);
  }

  async generateReport() {
    const report = {
      migration_date: new Date().toISOString(),
      total_files: this.mediaData.length,
      downloaded: this.downloadedFiles.length,
      failed: this.failedDownloads.length,
      success_rate: `${Math.round((this.downloadedFiles.length / this.mediaData.length) * 100)}%`,
      downloaded_files: this.downloadedFiles,
      failed_files: this.failedDownloads,
      upload_directory: this.outputDir
    };
    
    await fs.writeFile(
      path.join(__dirname, 'data', 'media_migration_report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📊 Media Migration Report:');
    console.log(`✅ Successfully downloaded: ${report.downloaded} files`);
    console.log(`❌ Failed downloads: ${report.failed} files`);
    console.log(`📈 Success rate: ${report.success_rate}`);
    console.log(`📁 Files saved to: ${this.outputDir}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (require.main === module) {
  const migrator = new MediaMigrator();
  migrator.migrate().catch(error => {
    console.error('❌ Media migration failed:', error);
    process.exit(1);
  });
}

module.exports = MediaMigrator;