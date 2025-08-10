#!/usr/bin/env node

/**
 * WordPress Pages Analyzer
 * Analyzes WordPress pages and recommends migration strategy
 */

const fs = require('fs').promises;
const path = require('path');

class PageAnalyzer {
  constructor() {
    this.pagesData = null;
    this.recommendations = [];
  }

  async analyze() {
    console.log('📄 Analyzing WordPress pages for migration strategy...\n');
    
    // Load pages data
    await this.loadPagesData();
    
    // Analyze each page
    for (const page of this.pagesData) {
      this.analyzePage(page);
    }
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Save analysis report
    await this.saveReport();
  }

  async loadPagesData() {
    const pagesFile = path.join(__dirname, 'data', 'transformed', 'pages_transformed_2025-08-08.json');
    const pagesContent = await fs.readFile(pagesFile, 'utf8');
    this.pagesData = JSON.parse(pagesContent);
    
    console.log(`📊 Loaded ${this.pagesData.length} WordPress pages\n`);
  }

  analyzePage(page) {
    const analysis = {
      id: page.wp_id,
      title: page.title,
      slug: page.slug,
      template: page.template,
      content_length: page.content.length,
      has_content: page.content.length > 100,
      recommendation: 'skip',
      reason: '',
      action: ''
    };

    // Analyze based on page characteristics
    if (page.slug === 'home') {
      analysis.recommendation = 'convert_to_component';
      analysis.reason = 'Home page content should be integrated into existing React home components';
      analysis.action = 'Extract content and integrate into HeroSection, AboutVirginia, etc.';
      
    } else if (page.slug === 'about-us') {
      analysis.recommendation = 'create_about_page';
      analysis.reason = 'About page is important for business and SEO';
      analysis.action = 'Create /pages/about.tsx with this content';
      
    } else if (page.slug === 'contact-us') {
      analysis.recommendation = 'create_contact_page';
      analysis.reason = 'Contact page is essential for business';
      analysis.action = 'Create /pages/contact.tsx (may already exist)';
      
    } else if (page.slug.includes('properties')) {
      analysis.recommendation = 'skip';
      analysis.reason = 'Properties functionality already built in new system';
      analysis.action = 'Use existing /properties pages';
      
    } else if (['new-listings', 'search', 'the-market', 'community-report'].includes(page.slug)) {
      analysis.recommendation = 'create_specialized_page';
      analysis.reason = 'Real estate specific page with valuable content';
      analysis.action = `Create /pages/${page.slug.replace('-', '_')}.tsx`;
      
    } else if (['lifestyle', 'home-improvement', 'real-estate-news'].includes(page.slug)) {
      analysis.recommendation = 'convert_to_blog_category';
      analysis.reason = 'Content-focused page better served as blog category';
      analysis.action = `Use existing blog with category filter: /blog?category=${page.slug}`;
      
    } else if (page.content.length < 100) {
      analysis.recommendation = 'skip';
      analysis.reason = 'Very little content, not worth migrating';
      analysis.action = 'Delete or ignore';
      
    } else if (['hub', 'sample-page', 'simplyrets-listings'].includes(page.slug)) {
      analysis.recommendation = 'skip';
      analysis.reason = 'Demo/test page not needed in production';
      analysis.action = 'Delete';
      
    } else {
      analysis.recommendation = 'create_static_page';
      analysis.reason = 'Has substantial content worth preserving';
      analysis.action = `Create /pages/${page.slug.replace(/-/g, '_')}.tsx`;
    }

    this.recommendations.push(analysis);

    // Console output
    console.log(`📝 ${page.title} (${page.slug})`);
    console.log(`   Content: ${page.content.length} characters`);
    console.log(`   Recommendation: ${analysis.recommendation}`);
    console.log(`   Reason: ${analysis.reason}`);
    console.log(`   Action: ${analysis.action}\n`);
  }

  generateRecommendations() {
    const summary = {
      total_pages: this.pagesData.length,
      recommendations: {
        create_about_page: this.recommendations.filter(r => r.recommendation === 'create_about_page').length,
        create_contact_page: this.recommendations.filter(r => r.recommendation === 'create_contact_page').length,
        create_specialized_page: this.recommendations.filter(r => r.recommendation === 'create_specialized_page').length,
        create_static_page: this.recommendations.filter(r => r.recommendation === 'create_static_page').length,
        convert_to_component: this.recommendations.filter(r => r.recommendation === 'convert_to_component').length,
        convert_to_blog_category: this.recommendations.filter(r => r.recommendation === 'convert_to_blog_category').length,
        skip: this.recommendations.filter(r => r.recommendation === 'skip').length
      }
    };

    console.log('📊 MIGRATION SUMMARY');
    console.log('===================');
    console.log(`Total WordPress pages: ${summary.total_pages}`);
    console.log(`\n📄 Recommended actions:`);
    console.log(`  🏠 Create About page: ${summary.recommendations.create_about_page}`);
    console.log(`  📞 Create Contact page: ${summary.recommendations.create_contact_page}`);
    console.log(`  🏘️ Create specialized pages: ${summary.recommendations.create_specialized_page}`);
    console.log(`  📄 Create static pages: ${summary.recommendations.create_static_page}`);
    console.log(`  ⚛️ Convert to React components: ${summary.recommendations.convert_to_component}`);
    console.log(`  📚 Convert to blog categories: ${summary.recommendations.convert_to_blog_category}`);
    console.log(`  ⏭️ Skip/ignore: ${summary.recommendations.skip}`);

    console.log(`\n📋 PRIORITY ACTIONS:`);
    const priorities = this.recommendations
      .filter(r => ['create_about_page', 'create_contact_page', 'create_specialized_page'].includes(r.recommendation))
      .sort((a, b) => {
        const order = {'create_about_page': 1, 'create_contact_page': 2, 'create_specialized_page': 3};
        return order[a.recommendation] - order[b.recommendation];
      });

    priorities.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} → ${p.action}`);
    });
  }

  async saveReport() {
    const report = {
      analysis_date: new Date().toISOString(),
      total_pages: this.pagesData.length,
      recommendations: this.recommendations,
      summary: {
        pages_to_migrate: this.recommendations.filter(r => r.recommendation !== 'skip').length,
        pages_to_skip: this.recommendations.filter(r => r.recommendation === 'skip').length
      }
    };

    await fs.writeFile(
      path.join(__dirname, 'data', 'pages_analysis_report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log(`\n📁 Detailed analysis saved to: pages_analysis_report.json`);
  }
}

if (require.main === module) {
  const analyzer = new PageAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('❌ Page analysis failed:', error);
    process.exit(1);
  });
}

module.exports = PageAnalyzer;