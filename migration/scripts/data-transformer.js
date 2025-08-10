#!/usr/bin/env node

/**
 * Data Transformer
 * Transforms WordPress extracted data to MariaDB schema format
 */

const fs = require('fs').promises;
const path = require('path');

class DataTransformer {
  constructor() {
    this.transformedData = {
      users: [],
      properties: [],
      blog_posts: [],
      market_reports: []
    };
  }

  /**
   * Load extracted WordPress data
   */
  async loadExtractedData(dataDir) {
    console.log('📂 Loading extracted WordPress data...');
    
    const files = await fs.readdir(dataDir);
    const dataFiles = files.filter(f => f.endsWith('.json') && !f.includes('summary'));
    
    const extractedData = {};
    
    for (const file of dataFiles) {
      const filePath = path.join(dataDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Extract data type from filename
      const dataType = file.split('_')[0];
      extractedData[dataType] = data;
      console.log(`📄 Loaded ${data.length} ${dataType} records`);
    }
    
    return extractedData;
  }

  /**
   * Transform WordPress users to MariaDB user schema
   */
  transformUsers(wpUsers) {
    console.log('👥 Transforming users...');
    
    return wpUsers.map(wpUser => ({
      // Don't include ID - let MariaDB auto-generate
      email: wpUser.email,
      // Password will need to be reset - WordPress uses different hashing
      password: '$2a$10$defaultHashForMigration', // Placeholder - users will need to reset
      role: wpUser.role,
      profile: {
        first_name: wpUser.profile.first_name || 'Unknown',
        last_name: wpUser.profile.last_name || 'User',
        bio: wpUser.profile.bio || '',
        avatar_url: null, // Will be updated if avatars are migrated
        license_number: null,
        specializations: [],
        areas_served: []
      },
      preferences: {
        property_types: [],
        price_range: { min: null, max: null },
        locations: []
      },
      saved_properties: [],
      saved_searches: [],
      last_login: null,
      is_verified: wpUser.status === '0', // WordPress 0 = active
      is_active: true,
      // WordPress ID for reference during migration
      _wp_id: wpUser.id
    }));
  }

  /**
   * Transform WordPress posts to MariaDB blog_posts schema
   */
  transformBlogPosts(wpPosts, wpUsers) {
    console.log('📝 Transforming blog posts...');
    
    return wpPosts
      .filter(post => post.status === 'publish') // Only published posts
      .map(wpPost => {
        // Find author in transformed users
        const author = wpUsers.find(u => u.id === wpPost.author.id);
        const authorId = author ? author._wp_id : 1; // Default to admin if not found

        // Map WordPress categories to our enum
        const categoryMap = {
          'market-news': 'market-news',
          'buying-tips': 'buying-tips', 
          'selling-tips': 'selling-tips',
          'lifestyle': 'lifestyle',
          'community': 'community'
        };

        let category = 'lifestyle'; // Default category
        if (wpPost.categories.length > 0) {
          const wpCategory = wpPost.categories[0].slug;
          category = categoryMap[wpCategory] || 'lifestyle';
        }

        return {
          title: this.cleanText(wpPost.title),
          slug: this.generateSlug(wpPost.slug || wpPost.title),
          content: this.cleanContent(wpPost.content),
          excerpt: this.cleanText(wpPost.excerpt || this.generateExcerpt(wpPost.content)),
          featured_image: this.extractFeaturedImage(wpPost.meta),
          category: category,
          tags: wpPost.tags.map(tag => tag.name).slice(0, 10), // Limit tags
          author_id: authorId, // Will be updated after user import
          seo: {
            meta_title: this.cleanText(wpPost.title),
            meta_description: this.cleanText(wpPost.excerpt || this.generateExcerpt(wpPost.content)),
            schema_markup: null
          },
          status: 'published',
          published_at: new Date(wpPost.published_at),
          view_count: 0,
          _wp_id: wpPost.id
        };
      });
  }

  /**
   * Transform WordPress properties to MariaDB properties schema
   */
  transformProperties(wpProperties, wpUsers) {
    console.log('🏠 Transforming properties...');
    
    return wpProperties
      .filter(prop => prop.status === 'publish')
      .map(wpProp => {
        const author = wpUsers.find(u => u.id === wpProp.author.id);
        const agentId = author ? author._wp_id : 1;

        // Extract property details from meta fields
        const meta = wpProp.meta;
        
        return {
          mls_id: meta._property_id || `WP${wpProp.id}`,
          address: {
            street: meta._property_address || 'Address Not Available',
            city: meta._property_city || 'Unknown City',
            state: meta._property_state || 'CA',
            zip_code: meta._property_zip || '00000',
            coordinates: {
              lat: parseFloat(meta._property_lat) || 34.0522,
              lng: parseFloat(meta._property_lng) || -118.2437
            }
          },
          property_details: {
            type: this.mapPropertyType(meta._property_type),
            status: this.mapPropertyStatus(wpProp.property_statuses),
            price: parseInt(meta._property_price) || 0,
            bedrooms: parseInt(meta._property_bedrooms) || 0,
            bathrooms: parseInt(meta._property_bathrooms) || 0,
            square_feet: parseInt(meta._property_size) || 0,
            lot_size: parseInt(meta._property_lot_size) || 0,
            year_built: parseInt(meta._property_year) || null,
            garage_spaces: parseInt(meta._property_garage) || 0,
            stories: parseInt(meta._property_stories) || 1
          },
          images: this.extractPropertyImages(meta),
          description: this.cleanContent(wpProp.content),
          features: this.extractPropertyFeatures(meta),
          schools: {
            elementary: meta._property_elementary || null,
            middle: meta._property_middle || null,
            high: meta._property_high || null,
            district: meta._property_district || null
          },
          neighborhood: {
            name: meta._property_neighborhood || null,
            description: null,
            amenities: []
          },
          seo: {
            slug: this.generateSlug(wpProp.slug || wpProp.title),
            meta_title: this.cleanText(wpProp.title),
            meta_description: this.generatePropertyDescription(wpProp, meta),
            schema_markup: null
          },
          agent_id: agentId,
          is_featured: meta._property_featured === 'yes',
          virtual_tour_url: meta._property_virtual_tour || null,
          _wp_id: wpProp.id
        };
      });
  }

  /**
   * Helper methods for data transformation
   */
  cleanText(text) {
    if (!text) return '';
    return text.replace(/\r\n/g, '\n').trim();
  }

  cleanContent(content) {
    if (!content) return '';
    
    // Remove WordPress shortcodes
    content = content.replace(/\[.*?\]/g, '');
    
    // Clean up HTML
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/\r\n/g, '\n');
    
    return content.trim();
  }

  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  generateExcerpt(content, length = 160) {
    if (!content) return '';
    
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  extractFeaturedImage(meta) {
    return meta._thumbnail_id ? `/wp-content/uploads/featured-${meta._thumbnail_id}.jpg` : null;
  }

  extractPropertyImages(meta) {
    const images = [];
    
    // Look for gallery images
    if (meta._property_gallery) {
      const gallery = meta._property_gallery.split(',');
      gallery.forEach((imageId, index) => {
        images.push({
          url: `/wp-content/uploads/property-${imageId.trim()}.jpg`,
          alt: `Property Image ${index + 1}`,
          is_primary: index === 0
        });
      });
    }

    // If no gallery, create placeholder
    if (images.length === 0) {
      images.push({
        url: '/images/placeholder-property.jpg',
        alt: 'Property Image',
        is_primary: true
      });
    }

    return images;
  }

  extractPropertyFeatures(meta) {
    const features = {
      interior: [],
      exterior: [],
      community: []
    };

    // Map common WordPress property features
    if (meta._property_features) {
      const featuresList = meta._property_features.split(',');
      featuresList.forEach(feature => {
        const cleanFeature = feature.trim();
        if (cleanFeature) {
          features.interior.push(cleanFeature);
        }
      });
    }

    return features;
  }

  mapPropertyType(wpType) {
    const typeMap = {
      'single-family': 'residential',
      'condo': 'residential', 
      'townhouse': 'residential',
      'multi-family': 'residential',
      'commercial': 'commercial',
      'land': 'land'
    };
    
    return typeMap[wpType] || 'residential';
  }

  mapPropertyStatus(statuses) {
    if (!statuses || statuses.length === 0) return 'active';
    
    const status = statuses[0].toLowerCase();
    const statusMap = {
      'for-sale': 'active',
      'sold': 'sold',
      'pending': 'pending',
      'off-market': 'inactive'
    };
    
    return statusMap[status] || 'active';
  }

  generatePropertyDescription(wpProp, meta) {
    const details = meta;
    const bedrooms = details._property_bedrooms || 0;
    const bathrooms = details._property_bathrooms || 0;
    const price = details._property_price || 0;
    const city = details._property_city || '';
    
    return `${bedrooms} bedroom, ${bathrooms} bathroom property in ${city} priced at $${price.toLocaleString()}. ${this.generateExcerpt(wpProp.content, 100)}`;
  }

  /**
   * Save transformed data
   */
  async saveTransformedData(outputDir) {
    console.log('💾 Saving transformed data...');
    
    // Ensure output directory exists
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString().split('T')[0];
    
    for (const [key, data] of Object.entries(this.transformedData)) {
      if (data.length > 0) {
        const filename = path.join(outputDir, `${key}_transformed_${timestamp}.json`);
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`💾 Saved ${data.length} transformed ${key} to ${filename}`);
      }
    }

    // Save transformation summary
    const summary = {
      transformation_date: new Date().toISOString(),
      totals: Object.fromEntries(
        Object.entries(this.transformedData).map(([key, data]) => [key, data.length])
      )
    };

    const summaryFile = path.join(outputDir, `transformation_summary_${timestamp}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📋 Saved transformation summary to ${summaryFile}`);
  }

  /**
   * Run full transformation process
   */
  async transform(dataDir, outputDir) {
    console.log('🔄 Starting data transformation...\n');
    
    try {
      const extractedData = await this.loadExtractedData(dataDir);
      
      // Transform each data type
      if (extractedData.users) {
        this.transformedData.users = this.transformUsers(extractedData.users);
      }
      
      if (extractedData.posts) {
        this.transformedData.blog_posts = this.transformBlogPosts(
          extractedData.posts, 
          extractedData.users || []
        );
      }
      
      if (extractedData.properties) {
        this.transformedData.properties = this.transformProperties(
          extractedData.properties,
          extractedData.users || []
        );
      }

      await this.saveTransformedData(outputDir);
      
      console.log('\n✅ Data transformation completed successfully!');
      console.log('📁 Check the migration/data/transformed directory for processed files');
      
    } catch (error) {
      console.error('❌ Transformation failed:', error.message);
      console.error(error.stack);
    }
  }
}

// Run transformation if called directly
if (require.main === module) {
  const dataDir = path.join(__dirname, '../data');
  const outputDir = path.join(__dirname, '../data/transformed');
  
  const transformer = new DataTransformer();
  transformer.transform(dataDir, outputDir).catch(console.error);
}

module.exports = DataTransformer;