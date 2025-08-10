# WordPress to MariaDB Migration Tools

This directory contains tools and scripts for migrating content from the existing WordPress site to the new MariaDB-based system.

## Directory Structure

```
migration/
├── scripts/           # Migration scripts
├── data/             # Extracted WordPress data
├── tools/            # Utility tools
└── README.md         # This file
```

## Migration Process Overview

### Phase 1: Data Extraction
1. **WordPress Database Export**: Extract WordPress database
2. **Media Files**: Download and organize media files
3. **Content Analysis**: Analyze existing content structure

### Phase 2: Data Transformation
1. **Schema Mapping**: Map WordPress schema to MariaDB models
2. **Content Processing**: Transform and clean content
3. **Image Optimization**: Process and optimize media files

### Phase 3: Data Import
1. **Database Import**: Import transformed data to MariaDB
2. **File Migration**: Move media files to new structure
3. **Validation**: Verify successful migration

## Content Types to Migrate

### Properties
- Custom post type: `properties`
- Meta fields: address, price, details, images
- Featured images and galleries

### Blog Posts
- Post content, categories, tags
- Featured images
- Author information
- Publication dates

### Pages
- Static pages (About, Contact, etc.)
- Custom page templates
- SEO meta data

### Users
- User accounts and profiles
- Agent information
- Contact details

### Media
- Property images
- Blog post images
- Document attachments
- Optimize for web delivery

## Migration Status

- [ ] WordPress database access setup
- [ ] Content extraction scripts
- [ ] Schema mapping completed
- [ ] Data transformation pipeline
- [ ] Import validation system
- [ ] Media migration tools
- [ ] SEO data preservation

## Next Steps

1. Set up WordPress database connection
2. Build extraction scripts
3. Create transformation pipeline
4. Test with sample data
5. Full migration execution