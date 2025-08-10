#!/usr/bin/env node

/**
 * Master Migration Script
 * Orchestrates the complete WordPress to MariaDB migration process
 */

const path = require('path');
const fs = require('fs').promises;
const WordPressExtractor = require('./wp-extractor');
const DataTransformer = require('./data-transformer');
const MariaDBImporter = require('./mariadb-importer');

class MigrationOrchestrator {
  constructor() {
    this.config = this.loadConfig();
    this.migrationDir = path.join(__dirname, '..');
    this.dataDir = path.join(this.migrationDir, 'data');
    this.transformedDir = path.join(this.dataDir, 'transformed');
    
    this.steps = [
      { name: 'WordPress Extraction', enabled: true, key: 'extract' },
      { name: 'Data Transformation', enabled: true, key: 'transform' },
      { name: 'MariaDB Import', enabled: true, key: 'import' }
    ];
  }

  loadConfig() {
    // Load configuration from environment variables
    return {
      wordpress: {
        host: process.env.WP_DB_HOST || 'localhost',
        user: process.env.WP_DB_USER,
        password: process.env.WP_DB_PASS,
        database: process.env.WP_DB_NAME,
        port: process.env.WP_DB_PORT || 3306
      },
      options: {
        skipExtraction: process.env.SKIP_EXTRACTION === 'true',
        skipTransformation: process.env.SKIP_TRANSFORMATION === 'true',
        skipImport: process.env.SKIP_IMPORT === 'true',
        syncDatabase: process.env.SYNC_DATABASE === 'true',
        dryRun: process.env.DRY_RUN === 'true'
      }
    };
  }

  async validateConfig() {
    console.log('🔍 Validating configuration...');
    
    const requiredWPConfig = ['host', 'user', 'password', 'database'];
    const missing = requiredWPConfig.filter(key => !this.config.wordpress[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing WordPress database configuration: ${missing.join(', ')}`);
    }

    console.log('✅ Configuration validated');
    console.log(`   WordPress DB: ${this.config.wordpress.host}:${this.config.wordpress.port}/${this.config.wordpress.database}`);
    console.log(`   Skip extraction: ${this.config.options.skipExtraction}`);
    console.log(`   Skip transformation: ${this.config.options.skipTransformation}`);
    console.log(`   Skip import: ${this.config.options.skipImport}`);
    console.log(`   Dry run: ${this.config.options.dryRun}`);
  }

  async createDirectories() {
    console.log('📁 Creating migration directories...');
    
    const directories = [this.dataDir, this.transformedDir];
    
    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }

  async extractWordPressData() {
    if (this.config.options.skipExtraction) {
      console.log('⏭️  Skipping WordPress extraction (SKIP_EXTRACTION=true)');
      return;
    }

    console.log('\n🔍 STEP 1: WordPress Data Extraction');
    console.log('=====================================');
    
    const extractor = new WordPressExtractor(this.config.wordpress);
    await extractor.extract();
    
    console.log('✅ WordPress extraction completed');
  }

  async transformData() {
    if (this.config.options.skipTransformation) {
      console.log('⏭️  Skipping data transformation (SKIP_TRANSFORMATION=true)');
      return;
    }

    console.log('\n🔄 STEP 2: Data Transformation');
    console.log('===============================');
    
    const transformer = new DataTransformer();
    await transformer.transform(this.dataDir, this.transformedDir);
    
    console.log('✅ Data transformation completed');
  }

  async importToMariaDB() {
    if (this.config.options.skipImport) {
      console.log('⏭️  Skipping MariaDB import (SKIP_IMPORT=true)');
      return;
    }

    if (this.config.options.dryRun) {
      console.log('🔍 DRY RUN: Would import data to MariaDB');
      return;
    }

    console.log('\n📥 STEP 3: MariaDB Import');
    console.log('=========================');
    
    const importer = new MariaDBImporter();
    await importer.import(this.transformedDir, {
      sync: this.config.options.syncDatabase
    });
    
    console.log('✅ MariaDB import completed');
  }

  async generateMigrationReport() {
    console.log('\n📊 Generating Migration Report');
    console.log('==============================');

    const report = {
      migration_date: new Date().toISOString(),
      configuration: this.config,
      steps_completed: [],
      data_summary: {},
      recommendations: []
    };

    // Check for data files and get counts
    try {
      const dataFiles = await fs.readdir(this.dataDir);
      const transformedFiles = await fs.readdir(this.transformedDir);
      
      report.data_files = {
        extracted: dataFiles.filter(f => f.endsWith('.json') && !f.includes('summary')).length,
        transformed: transformedFiles.filter(f => f.includes('_transformed_')).length
      };

      // Load latest summary files for counts
      const summaryFiles = dataFiles.filter(f => f.includes('summary'));
      if (summaryFiles.length > 0) {
        const latestSummary = summaryFiles.sort().reverse()[0];
        const summaryPath = path.join(this.dataDir, latestSummary);
        const summaryContent = await fs.readFile(summaryPath, 'utf8');
        const summary = JSON.parse(summaryContent);
        report.data_summary = summary.totals || {};
      }

    } catch (error) {
      console.warn('⚠️  Could not read data directories for report');
    }

    // Add recommendations
    if (!this.config.options.skipExtraction && !this.config.options.skipTransformation && !this.config.options.skipImport) {
      report.recommendations.push('Complete migration executed - verify data integrity');
    }
    
    if (this.config.options.dryRun) {
      report.recommendations.push('This was a dry run - execute without DRY_RUN=true to perform actual import');
    }

    report.recommendations.push('Update user passwords - WordPress passwords need to be reset');
    report.recommendations.push('Verify media file paths and update as needed');
    report.recommendations.push('Test frontend functionality with migrated data');

    // Save report
    const reportFile = path.join(this.migrationDir, `migration_report_${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📋 Migration report saved: ${reportFile}`);
    return report;
  }

  async run() {
    console.log('🚀 Starting WordPress to MariaDB Migration');
    console.log('===========================================');
    console.log(`📅 Started at: ${new Date().toISOString()}\n`);

    const startTime = Date.now();

    try {
      await this.validateConfig();
      await this.createDirectories();
      await this.extractWordPressData();
      await this.transformData();
      await this.importToMariaDB();
      
      const report = await this.generateMigrationReport();
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      console.log('\n🎉 Migration Completed Successfully!');
      console.log('====================================');
      console.log(`⏱️  Duration: ${duration} seconds`);
      console.log(`📊 Data Summary:`, report.data_summary);
      console.log(`📁 Files: ${report.data_files?.extracted || 0} extracted, ${report.data_files?.transformed || 0} transformed`);
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, i) => {
          console.log(`   ${i + 1}. ${rec}`);
        });
      }

    } catch (error) {
      console.error('\n❌ Migration Failed!');
      console.error('===================');
      console.error(`Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
      
      process.exit(1);
    }
  }
}

// Command line interface
if (require.main === module) {
  const orchestrator = new MigrationOrchestrator();
  orchestrator.run().catch(error => {
    console.error('Migration orchestrator failed:', error);
    process.exit(1);
  });
}

module.exports = MigrationOrchestrator;