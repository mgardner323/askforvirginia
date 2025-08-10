# Virginia Real Estate Admin Panel - Comprehensive Guide

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Security](#authentication--security)
3. [Settings Management](#settings-management)
4. [Property Management](#property-management)
5. [User Management](#user-management)
6. [Dashboard & Analytics](#dashboard--analytics)
7. [Database Configuration](#database-configuration)
8. [SMTP & Email Configuration](#smtp--email-configuration)
9. [Deployment & Production](#deployment--production)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Virginia Real Estate Admin Panel is a comprehensive content management system built with React, TypeScript, and Node.js. It provides full administrative control over the website's content, users, and system configuration.

### Key Features
- **Role-based Authentication**: JWT-based security with admin/agent roles
- **Settings Management**: Database and SMTP configuration through web interface
- **Property Management**: Complete CRUD operations for property listings
- **User Management**: User accounts, roles, and permissions
- **Dashboard Analytics**: Real-time statistics and system monitoring
- **Responsive Design**: Optimized for desktop and mobile administration

### Technology Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Express.js, TypeScript, JWT authentication
- **Database**: MariaDB 11.4.8 with Sequelize ORM
- **Security**: Encrypted sensitive settings, rate limiting, CORS protection

---

## Authentication & Security

### Admin Access
The admin panel is secured with JWT-based authentication and role verification.

**Access URL**: `http://localhost:3001/admin/login`

### Default Admin Credentials
```
Email: admin@askforvirginia.com
Password: [Set during initial setup]
```

### Security Features
- **JWT Token Authentication**: Secure session management
- **Role-Based Access Control**: Admin and agent role verification
- **Encrypted Sensitive Data**: Database passwords and SMTP credentials
- **Auto-Logout**: Session timeout for security
- **CORS Protection**: Cross-origin request security

### Authentication Flow
1. **Login**: Submit credentials at `/admin/login`
2. **Token Generation**: JWT token created with user data
3. **Token Storage**: Stored in localStorage for session persistence
4. **Route Protection**: All admin routes verify valid token
5. **Role Verification**: Admin/agent roles required for access

---

## Settings Management

### System Settings Overview
The settings management system allows configuration of database, SMTP, and system settings through a web interface instead of manual .env file editing.

**Access**: Admin Panel → Settings

### Settings Categories
1. **Database Configuration**: Connection settings, credentials
2. **SMTP Settings**: Email server configuration
3. **System Settings**: General application configuration
4. **API Configuration**: External service settings
5. **Storage Settings**: File and media storage options

### Settings Features
- **Encryption Support**: Sensitive values (passwords) are encrypted
- **Category Filtering**: Organize settings by type
- **Inline Editing**: Edit settings directly in the interface
- **Migration Tool**: Import existing .env settings
- **Password Visibility**: Toggle sensitive value display
- **Credential Management**: Secure storage for API keys and external service credentials
- **Service Integration**: Manage Google Gemini API keys and other third-party credentials
- **Auto-Discovery**: System automatically detects and suggests common credentials

### Adding New Settings
1. Click "Add Setting" button
2. Select category (database, smtp, system, api, storage)
3. Enter key name (e.g., "DB_HOST")
4. Enter value
5. Add optional description
6. Check "Encrypt this value" for sensitive data
7. Click "Add Setting"

### Editing Settings
1. Click the edit icon (pencil) next to any setting
2. Modify the value in the input field
3. Press Enter to save or Escape to cancel
4. Changes are automatically encrypted if required

### Migration from .env
The system includes a migration tool to transfer existing environment variables to the database:

1. Click "Migrate .env" button
2. Confirm the migration action
3. System automatically imports common settings:
   - Database connection details
   - SMTP configuration
   - Default email addresses

---

## Credential Management System

### Overview
The Virginia Real Estate admin panel includes a sophisticated credential management system for securely storing and managing API keys, database credentials, and third-party service authentication tokens.

**Access**: Admin Panel → Settings → Credentials

### Features
- **Encrypted Storage**: All sensitive credentials encrypted with AES-256
- **Service Integration**: Pre-configured support for common services
- **Auto-Discovery**: System detects required credentials automatically
- **Expiration Tracking**: Monitor credential expiration dates
- **Usage Monitoring**: Track when credentials were last accessed
- **Audit Trail**: Complete log of credential management actions

### Supported Services
1. **Google Gemini API**: AI content generation and analysis
2. **Database Credentials**: MariaDB connection parameters
3. **SMTP Services**: Email server authentication
4. **External APIs**: MLS, mapping, and third-party integrations
5. **Storage Services**: AWS S3, Cloudinary for media management
6. **Analytics**: Google Analytics and tracking services

### Managing Credentials

#### Adding New Credentials
1. Navigate to Settings → Credentials
2. Click "Add Credential"
3. Select service type from dropdown
4. Enter service name (e.g., "Google Gemini API")
5. Input credential data (API keys, passwords, etc.)
6. Add optional description and expiration date
7. Click "Save Credential"

#### Editing Credentials
1. Locate the credential in the list
2. Click the "Edit" button (pencil icon)
3. Modify the credential data
4. Update expiration date if needed
5. Save changes

#### Security Features
- **Encryption**: All sensitive data encrypted before storage
- **Access Control**: Admin-only credential management
- **Audit Logging**: All actions tracked with timestamps
- **Secure Display**: Credentials masked in UI (show/hide toggle)
- **Validation**: Automatic credential format validation

### Google Gemini Integration
The system includes built-in support for Google Gemini API credentials:

1. **Auto-Detection**: System checks for Gemini credentials on startup
2. **Credential Storage**: Securely stores API keys with encryption
3. **Usage Tracking**: Monitors API usage and last access times
4. **Error Handling**: Graceful fallback when credentials unavailable

#### Setting up Google Gemini
1. Obtain API key from Google AI Studio
2. Navigate to Admin → Settings → Credentials
3. Add new credential with service "google_gemini"
4. Enter API key and optional description
5. System automatically validates and activates

### Database Credential Management
Database connection credentials are managed through the settings system:

#### Configuration Parameters
- **Host**: Database server hostname
- **Port**: Connection port (default: 3306)
- **Database Name**: Target database
- **Username**: Database user account
- **Password**: Encrypted password storage
- **Connection Pool**: Pool size configuration

#### Security Measures
- **Password Encryption**: All database passwords encrypted
- **Connection Testing**: Automatic validation of credentials
- **Fallback Handling**: Graceful degradation when credentials invalid
- **Audit Trail**: Complete log of credential changes

---

## Advanced Analytics Dashboard

### Analytics Overview
The admin panel includes a comprehensive analytics dashboard with real-time monitoring, performance metrics, and business intelligence.

**Access**: Admin Panel → Analytics

### Analytics Categories

#### 1. Performance Analytics
- **Response Times**: API endpoint performance monitoring
- **System Resources**: CPU, memory, and disk usage tracking
- **Error Rates**: HTTP error code analysis
- **Database Performance**: Query execution times and optimization alerts
- **Cache Efficiency**: Hit rates, miss rates, and optimization suggestions

#### 2. Search Analytics
- **Popular Queries**: Most searched terms and phrases
- **Search Trends**: Temporal analysis of search patterns
- **Result Quality**: Click-through rates and user engagement
- **Filter Usage**: Most used property filters and criteria
- **Geographic Trends**: Location-based search analysis

#### 3. User Behavior Analytics
- **Page Views**: Most visited pages and content
- **User Journeys**: Navigation patterns and conversion funnels
- **Session Duration**: Engagement time analysis
- **Device Analytics**: Mobile vs desktop usage patterns
- **Geographic Distribution**: User location analysis

#### 4. Property Analytics
- **View Statistics**: Most viewed properties and listings
- **Inquiry Rates**: Contact form and inquiry conversion
- **Price Analysis**: Market trends and pricing insights
- **Feature Popularity**: Most searched property features
- **Geographic Performance**: Area-based property performance

### Interactive Charts and Visualizations
- **Time Series Charts**: Trend analysis over time
- **Bar Charts**: Comparative analysis between categories
- **Pie Charts**: Distribution and proportion analysis
- **Heatmaps**: Geographic and temporal pattern visualization
- **Scatter Plots**: Correlation analysis between metrics

### Real-Time Monitoring
- **Live Updates**: Automatic data refresh every 30 seconds
- **Alert System**: Configurable alerts for performance thresholds
- **Health Monitoring**: System status and uptime tracking
- **Error Tracking**: Real-time error detection and notification

### Export and Reporting
- **Data Export**: CSV and JSON export capabilities
- **Scheduled Reports**: Automated report generation
- **Custom Dashboards**: User-configurable analytics views
- **Email Reports**: Automated analytics summaries

---

## Search System Management

### Advanced Search Configuration
The admin panel provides comprehensive search system management with Elasticsearch integration and fallback database search.

**Access**: Admin Panel → Search Management

### Search Features
- **Multi-Modal Search**: Properties, blog posts, and market reports
- **Intelligent Ranking**: Relevance-based result ordering
- **Faceted Search**: Dynamic filtering and categorization
- **Autocomplete**: Real-time search suggestions
- **Fuzzy Matching**: Typo-tolerant search capabilities

### Search Analytics
- **Query Performance**: Search response times and optimization
- **Popular Terms**: Most searched keywords and phrases
- **Zero Results**: Queries with no matching results
- **Click-Through Rates**: User engagement with search results
- **Filter Usage**: Most used search filters and criteria

### Search Administration
#### Index Management
- **Reindexing**: Full content reindexing capabilities
- **Selective Updates**: Update specific content types
- **Index Health**: Monitor index status and performance
- **Content Sync**: Automatic synchronization with database

#### Configuration Settings
- **Search Weights**: Adjust field importance in ranking
- **Filter Configuration**: Enable/disable search filters
- **Suggestion Settings**: Configure autocomplete behavior
- **Performance Tuning**: Optimize search response times

---

## Property Management

### Property CRUD Operations
Complete property management with search, filtering, and pagination.

**Access**: Admin Panel → Properties

### Features
- **List View**: Paginated property listings with thumbnails
- **Search**: Search by title, address, or description
- **Filtering**: Filter by status, type, price range
- **Add New**: Create new property listings
- **Edit**: Modify existing properties
- **Delete**: Remove properties with confirmation
- **Image Management**: Upload and manage property photos

### Property Fields
- **Basic Information**: Title, description, price, status
- **Address Details**: Full address with geocoding
- **Property Details**: Bedrooms, bathrooms, square footage
- **Features**: Amenities, special features, highlights
- **Images**: Multiple photo upload with primary image selection
- **SEO**: Meta descriptions, keywords for search optimization

### Property Status Options
- **Active**: Available for sale/rent
- **Pending**: Under contract
- **Sold**: Successfully sold
- **Off Market**: Temporarily unavailable
- **Draft**: Not yet published

---

## User Management

### User Administration
Manage user accounts, roles, and permissions from the admin panel.

**Access**: Admin Panel → Users (Coming in Phase 4)

### User Roles
1. **Admin**: Full system access, can manage all content
2. **Agent**: Property and content management, limited system access
3. **Client**: Frontend access only, saved properties and searches

### User Management Features
- **User Listing**: View all registered users
- **Role Assignment**: Change user roles and permissions
- **Account Status**: Activate/deactivate user accounts
- **Profile Management**: Edit user information
- **Activity Monitoring**: Track user actions and login history

---

## Dashboard & Analytics

### Admin Dashboard
Real-time overview of website statistics and system health.

**Access**: Admin Panel → Dashboard (default view)

### Dashboard Widgets
1. **Property Statistics**: Total properties, active listings, recent activity
2. **User Statistics**: Total users, new registrations, active sessions
3. **Blog Statistics**: Published posts, views, recent comments
4. **Market Reports**: Recent reports, data freshness
5. **System Health**: Server status, database connectivity
6. **Recent Activity**: Latest admin actions and system events
7. **Performance Analytics**: Real-time system metrics and response times
8. **Search Analytics**: Popular queries, search trends, and usage patterns
9. **Cache Performance**: Cache hit rates, memory usage, and optimization metrics

### Analytics Features
- **Real-time Updates**: Live data refresh
- **Interactive Charts**: Visual data representation
- **Export Capabilities**: Download reports and statistics
- **Time Range Filtering**: View data for specific periods

---

## Database Configuration

### Database Settings Management
Configure MariaDB connection settings through the admin interface.

### Configurable Database Settings
- **DB_HOST**: Database server hostname (default: localhost)
- **DB_PORT**: Database server port (default: 3306)
- **DB_NAME**: Database name (default: virginia)
- **DB_USER**: Database username
- **DB_PASSWORD**: Database password (encrypted)
- **REDIS_URL**: Redis cache connection string

### Database Security
- **Encrypted Passwords**: Database passwords stored with AES-256 encryption
- **Connection Pooling**: Optimized database connections
- **Query Logging**: Debug mode query tracking
- **Backup Integration**: Automated backup configuration

### Connection Testing
The admin panel includes database connection testing:
1. Navigate to Settings → Database
2. Configure connection parameters
3. System automatically validates connection
4. Status indicators show connection health

---

## SMTP & Email Configuration

### Email System Configuration
Configure email server settings for contact forms and notifications.

### SMTP Settings
- **SMTP_HOST**: Mail server hostname (e.g., smtp.gmail.com)
- **SMTP_PORT**: Server port (587 for TLS, 465 for SSL)
- **SMTP_SECURE**: SSL/TLS encryption (true/false)
- **SMTP_USER**: Email account username
- **SMTP_PASS**: Email account password (encrypted)
- **FROM_EMAIL**: Default sender email address
- **FROM_NAME**: Default sender name
- **CONTACT_EMAIL**: Contact form recipient address

### Email Features
- **HTML Templates**: Rich email formatting
- **Auto-Reply**: Automatic confirmation emails
- **Contact Form Integration**: Direct form-to-email processing
- **Property Alerts**: Automated property notifications
- **User Notifications**: Account and activity updates

### SMTP Testing
Test email configuration directly from the admin panel:
1. Configure SMTP settings in Settings → SMTP
2. Use the "Test Email" feature
3. Verify email delivery and formatting
4. Check error logs for troubleshooting

---

## Deployment & Production

### Production Configuration
Guidelines for deploying the admin system in production environments.

### Environment Setup
1. **Environment Variables**: Set NODE_ENV=production
2. **Database Configuration**: Production MariaDB instance
3. **Security Settings**: Strong JWT secrets, HTTPS enforcement
4. **SMTP Configuration**: Production email service
5. **File Permissions**: Proper directory permissions

### Security Hardening
- **HTTPS Only**: Force SSL/TLS connections
- **Rate Limiting**: API request throttling
- **CORS Configuration**: Restrict cross-origin requests
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Content sanitization

### Performance Optimization
- **Database Indexing**: Optimize query performance
- **Caching Strategy**: Redis integration
- **Image Optimization**: Compress uploaded images
- **Asset Minification**: Compress CSS/JS files
- **CDN Integration**: Content delivery network

### Monitoring & Logging
- **Error Logging**: Comprehensive error tracking
- **Access Logs**: Admin action auditing
- **Performance Metrics**: Response time monitoring
- **Health Checks**: Automated system monitoring

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Admin Login Issues
**Problem**: Cannot log in to admin panel
**Solutions**:
- Verify admin credentials in database
- Check JWT_SECRET environment variable
- Clear browser localStorage
- Verify database connection

#### 2. Settings Not Saving
**Problem**: Settings changes don't persist
**Solutions**:
- Check database connection
- Verify admin permissions
- Check browser console for errors
- Restart API server

#### 3. SMTP Configuration Issues
**Problem**: Emails not sending
**Solutions**:
- Test SMTP credentials with external client
- Check firewall/port restrictions
- Verify SSL/TLS settings
- Review email service provider requirements

#### 4. Database Connection Errors
**Problem**: Cannot connect to MariaDB
**Solutions**:
- Verify database server is running
- Check connection credentials
- Test network connectivity
- Review MariaDB logs

#### 5. Permission Denied Errors
**Problem**: Access denied messages
**Solutions**:
- Verify user role (admin/agent required)
- Check JWT token validity
- Refresh browser session
- Verify API server is running

### Debug Mode
Enable debug logging for troubleshooting:
```bash
DEBUG=* npm run dev
```

### Log Files
Check log files for detailed error information:
- **API Logs**: `/var/www/vhosts/askforvirginia.com/dev2.askforvirginia.com/logs/`
- **Database Logs**: MariaDB error logs
- **Web Server Logs**: Nginx/Apache logs

### Support Resources
- **GitHub Repository**: Development and issue tracking
- **Documentation**: Comprehensive API and frontend docs
- **Database Schema**: Complete table structure reference

---

## API Endpoints Reference

### Settings API
- `GET /api/settings` - List all settings
- `GET /api/settings/categories` - Get setting categories
- `POST /api/settings` - Create new setting
- `PUT /api/settings/:id` - Update setting
- `DELETE /api/settings/:id` - Delete setting
- `POST /api/settings/migrate-env` - Migrate .env settings

### Credentials API
- `GET /api/credentials` - List all credentials
- `POST /api/credentials` - Create new credential
- `PUT /api/credentials/:id` - Update credential
- `DELETE /api/credentials/:id` - Delete credential
- `POST /api/credentials/test` - Test credential validity

### Analytics API
- `GET /api/analytics/dashboard` - Comprehensive dashboard data
- `GET /api/analytics/properties` - Property-specific analytics
- `GET /api/analytics/users` - User behavior analytics
- `GET /api/analytics/blog` - Blog and content analytics
- `GET /api/analytics/system` - System performance metrics
- `GET /api/analytics/search` - Search analytics and trends
- `POST /api/analytics/track` - Track custom events
- `POST /api/analytics/property/:id/view` - Track property views
- `GET /api/analytics/cache/stats` - Cache performance statistics
- `POST /api/analytics/cache/warm` - Warm cache with frequent data
- `DELETE /api/analytics/cache` - Clear cache with optional pattern

### Performance API
- `GET /api/performance/metrics` - Current performance summary
- `GET /api/performance/detailed` - Detailed performance metrics
- `GET /api/performance/system` - System performance metrics
- `GET /api/performance/active` - Active requests monitoring
- `GET /api/performance/alerts` - Performance alerts and warnings
- `POST /api/performance/gc` - Trigger garbage collection (admin)
- `GET /api/performance/report` - Generate performance report

### Search API
- `GET /api/search` - Advanced search with filters
- `GET /api/search/suggestions` - Search autocomplete suggestions
- `GET /api/search/popular` - Popular search terms
- `GET /api/search/filters` - Available search filters
- `POST /api/search/index/:type/:id` - Index specific document (admin)
- `DELETE /api/search/index/:type/:id` - Remove document from index (admin)
- `POST /api/search/reindex` - Reindex all content (admin)
- `GET /api/search/analytics` - Search analytics data

### Admin API
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/activity` - Admin activity logs

### Authentication API
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Token verification
- `POST /api/auth/logout` - Session logout

---

## Conclusion

The Virginia Real Estate Admin Panel provides comprehensive administrative control over the website's content and configuration. This guide covers all major features including the new credential management system, advanced analytics dashboard, performance monitoring, and search system management.

### New Features in Version 3.0
- **Advanced Credential Management**: Secure storage and management of API keys and service credentials
- **Real-time Analytics Dashboard**: Comprehensive business intelligence and performance monitoring
- **Performance Monitoring System**: Real-time system health tracking and optimization alerts
- **Advanced Search Analytics**: Search behavior analysis and optimization tools
- **Enhanced Security**: Improved encryption, audit logging, and access controls

### Enterprise Features
- **Scalable Architecture**: Built for high-traffic real estate websites
- **Professional Analytics**: Business intelligence for data-driven decisions
- **Advanced Security**: Enterprise-grade credential and access management
- **Performance Optimization**: Real-time monitoring and automated optimization
- **Comprehensive APIs**: Full programmatic access to all system features

For additional support or feature requests, consult the development team or refer to the technical documentation in the codebase.

**Last Updated**: August 2025
**Version**: 3.0
**Status**: Production Ready ✅