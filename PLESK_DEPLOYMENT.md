# Plesk Node.js Deployment Guide - Virginia Real Estate

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Node.js Configuration](#nodejs-configuration)
4. [Environment Variables](#environment-variables)
5. [NGINX Reverse Proxy Setup](#nginx-reverse-proxy-setup)
6. [SSL Configuration](#ssl-configuration)
7. [Database Configuration](#database-configuration)
8. [File Upload and Management](#file-upload-and-management)
9. [Production Deployment](#production-deployment)
10. [Monitoring and Logs](#monitoring-and-logs)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements
- **Plesk Version**: Plesk Obsidian (Latest) or Plesk Onyx
- **Operating System**: Linux (Ubuntu 20.04+ or CentOS 7+) recommended
- **Node.js Support**: Node.js Toolkit extension must be installed
- **Web Server**: NGINX with reverse proxy capability
- **Database**: MariaDB 10.4+ or MySQL 8.0+

### Required Extensions
1. **Node.js Toolkit**: Available from Plesk Extensions Catalog (Free)
2. **Git**: For code deployment from repositories
3. **SSL It!**: For free SSL certificate management (Let's Encrypt)

### Before You Start
- Verify Node.js Toolkit is installed in Plesk Extensions
- Ensure your domain is properly configured in Plesk
- Have your application code ready (with package.json)
- Database credentials and configuration ready

---

## Initial Setup

### 1. Install Node.js Toolkit Extension
1. Log into Plesk admin panel
2. Navigate to **Extensions** → **Extensions Catalog**
3. Search for "Node.js Toolkit"
4. Click **Get it free** and install
5. Verify installation under **Extensions** → **My Extensions**

### 2. Domain Configuration
1. Go to **Websites & Domains**
2. Select your domain (e.g., askforvirginia.com)
3. Verify domain is active and properly configured
4. Note the document root path

### 3. File Upload Methods
Choose one of the following methods:

#### Method A: File Manager Upload
1. Go to **Files** → **File Manager**
2. Navigate to your domain's directory
3. Upload your Node.js application files
4. Extract if uploaded as archive

#### Method B: Git Repository (Recommended)
1. Go to **Git** (if Git extension installed)
2. Add repository URL
3. Configure deployment key if private repo
4. Clone repository to domain directory

#### Method C: FTP/SFTP
1. Use FTP client with Plesk credentials
2. Upload files to domain directory
3. Ensure proper file permissions

---

## Node.js Configuration

### 1. Enable Node.js for Domain
1. Navigate to **Websites & Domains** → [Your Domain]
2. Click **Node.js** or create new **Website** → **Node.js**
3. Configure the following settings:

#### Basic Configuration
- **Node.js Version**: Select appropriate version (18.x+ recommended)
- **Package Manager**: Choose between npm or Yarn
- **Application Mode**: Development or Production
- **Document Root**: `/var/www/vhosts/askforvirginia.com/askforvirginia.com/public`
- **Application Root**: `/var/www/vhosts/askforvirginia.com/askforvirginia.com`

#### Application Settings
- **Application Startup File**: `dist/server.js` (for our built application)
- **Application URL**: Leave blank for root domain
- **Passenger Log Level**: Set to appropriate level (info for production)

### 2. Virginia Real Estate Specific Configuration
```javascript
// Application Root Structure
/var/www/vhosts/askforvirginia.com/askforvirginia.com/
├── apps/
│   ├── api/           // Backend API
│   └── web/           // Frontend Next.js
├── public/            // Static files (Document Root)
├── dist/              // Built application
├── package.json       // Root package.json
├── ecosystem.config.js // PM2 configuration
└── .env              // Environment variables
```

### 3. Install Dependencies
1. Click **NPM Install** or **Yarn Install** in Node.js settings
2. Wait for package installation to complete
3. Check for any installation errors in logs

---

## Environment Variables

### Linux Configuration (Recommended)
For Plesk on Linux, use the built-in environment variables interface:

1. Go to **Node.js** settings for your domain
2. Scroll to **Custom Environment Variables**
3. Click **Add Variable** and configure:

#### Production Environment Variables
```bash
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://askforvirginia.com

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=virginia_prod
DB_USER=virginia_prod
DB_PASSWORD=your-production-password

# JWT Configuration
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@askforvirginia.com
SMTP_PASS=your-app-password
FROM_EMAIL=support@askforvirginia.com
FROM_NAME=Virginia Hodges Real Estate
CONTACT_EMAIL=jenny@askforvirginia.com

# API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=virginia-real-estate-assets
```

### Windows Configuration (Alternative)
For Plesk on Windows, environment variables aren't supported in the UI. Use:

#### Method 1: .env File
1. Create `.env` file in application root
2. Use dotenv package to load variables
3. Ensure .env is not in public directory

#### Method 2: Package.json Scripts
```json
{
  "scripts": {
    "start": "export $(cat .env | xargs) && node dist/server.js",
    "prod": "NODE_ENV=production PORT=5001 node dist/server.js"
  }
}
```

---

## NGINX Reverse Proxy Setup

### 1. Enable NGINX Reverse Proxy
1. Go to **Tools & Settings** → **Services Management**
2. Ensure **Reverse Proxy Server (nginx)** is enabled
3. Start the service if not running

### 2. Domain NGINX Configuration
1. Navigate to **Websites & Domains** → [Your Domain]
2. Go to **Apache & Nginx Settings**
3. Ensure **Proxy mode** is **DISABLED**
4. Add configuration to **Additional nginx directives**:

### 3. Virginia Real Estate NGINX Configuration

#### Basic Reverse Proxy Configuration
```nginx
# Force HTTPS
if ($scheme = http) {
    return 301 https://askforvirginia.com$request_uri;
}

# API Routes
location /api/ {
    proxy_pass http://127.0.0.1:5001;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
    
    # Handle WebSocket connections
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Admin Panel Routes
location /admin/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
    
    # Handle WebSocket for Next.js hot reload
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
}

# Static file serving
location /uploads/ {
    root /var/www/vhosts/askforvirginia.com/askforvirginia.com/public;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location /images/ {
    root /var/www/vhosts/askforvirginia.com/askforvirginia.com/public;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Main application routes
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
    
    # Handle WebSocket connections
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}

# Security - Block access to sensitive files
location ~ /\. {
    deny all;
}

location ~ \.(env|md|json)$ {
    deny all;
}
```

#### Advanced Configuration with Caching
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    
    # Fallback to Node.js if file not found
    try_files $uri @nodejs;
}

# Fallback location for dynamic content
location @nodejs {
    proxy_pass http://127.0.0.1:3001;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 4. Index File Configuration Workaround
If you encounter issues with index file conflicts:
1. Go to **Apache & Nginx Settings**
2. In **Index files** section, select **Enter custom value**
3. Replace the value with a single space character " "
4. Save configuration

---

## SSL Configuration

### 1. Let's Encrypt SSL (Free)
1. Go to **Websites & Domains** → [Your Domain]
2. Click **SSL/TLS Certificates**
3. Click **Get free certificate**
4. Select **Let's Encrypt**
5. Configure:
   - Include www subdomain
   - Include mail subdomain (if needed)
   - Auto-renewal enabled

### 2. Force HTTPS Redirect
1. In **Apache & Nginx Settings**
2. Enable **Permanent SEO-safe 301 redirect from HTTP to HTTPS**
3. Or use NGINX directive (already included in configuration above)

### 3. SSL Security Headers
Add to NGINX configuration:
```nginx
# SSL Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## Database Configuration

### 1. MariaDB Setup
1. Go to **Databases**
2. Click **Add Database**
3. Configure database:
   - **Database name**: `virginia_prod`
   - **User**: `virginia_prod`
   - **Password**: Strong password
   - **Host**: `localhost`

### 2. Database User Permissions
Ensure the database user has:
- SELECT, INSERT, UPDATE, DELETE privileges
- CREATE, ALTER, DROP for migrations
- INDEX for performance optimization

### 3. Connection Testing
Test database connection using Plesk MySQL/MariaDB interface:
```sql
-- Test connection
SELECT 1+1 as test;

-- Verify database
SHOW DATABASES;
USE virginia_prod;
SHOW TABLES;
```

### 4. Database Import
If migrating from development:
1. Export development database
2. Use **phpMyAdmin** in Plesk to import
3. Update connection strings
4. Run any production-specific migrations

---

## File Upload and Management

### 1. Upload Application Files
Ensure your application structure is:
```
/var/www/vhosts/askforvirginia.com/askforvirginia.com/
├── apps/
│   ├── api/
│   │   ├── dist/           # Built API code
│   │   ├── src/            # Source code
│   │   └── package.json
│   └── web/
│       ├── .next/          # Built Next.js code
│       ├── pages/          # Source pages
│       └── package.json
├── public/                 # Static files (NGINX document root)
│   ├── images/
│   └── uploads/
├── dist/                   # Built application entry point
├── package.json            # Root package.json
├── ecosystem.config.js     # PM2 configuration
└── .env                    # Production environment variables
```

### 2. File Permissions
Set appropriate permissions:
```bash
# Application files
chmod -R 755 /var/www/vhosts/askforvirginia.com/askforvirginia.com/
chmod -R 644 /var/www/vhosts/askforvirginia.com/askforvirginia.com/*.js
chmod -R 644 /var/www/vhosts/askforvirginia.com/askforvirginia.com/*.json

# Writable directories
chmod -R 777 /var/www/vhosts/askforvirginia.com/askforvirginia.com/public/uploads/
chmod -R 777 /var/www/vhosts/askforvirginia.com/askforvirginia.com/logs/
```

### 3. Git Integration (Recommended)
1. Install Git extension in Plesk
2. Configure repository:
   - **Repository URL**: Your GitHub/GitLab repository
   - **Branch**: `main` or `production`
   - **Deployment path**: Domain root directory
3. Set up deployment hooks for automatic updates

---

## Production Deployment

### 1. Build Process
Before deploying to Plesk, build your application:

```bash
# Local development
npm run build              # Build both API and web
npm run build:api          # Build API only
npm run build:web          # Build web only

# Upload built files to Plesk
# Or use Git hooks to build on server
```

### 2. Process Management with PM2
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'virginia-api',
      script: './apps/api/dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      max_memory_restart: '1G'
    },
    {
      name: 'virginia-web',
      script: 'npm',
      args: 'start',
      cwd: './apps/web',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log'
    }
  ]
};
```

### 3. Plesk Node.js vs PM2
Choose deployment method:

#### Option A: Plesk Node.js (Simpler)
- Use Plesk's built-in Node.js management
- Automatic restart and monitoring
- Integrated with Plesk interface

#### Option B: PM2 (Advanced)
- More control over process management
- Better for multi-application deployments
- Advanced monitoring and clustering

### 4. Start Application
1. Go to **Node.js** settings
2. Click **Enable Node.js**
3. Click **Restart App** after configuration changes
4. Monitor logs for startup issues

---

## Monitoring and Logs

### 1. Application Logs
Access logs through multiple methods:

#### Plesk Log Viewer
1. Go to **Websites & Domains** → [Domain]
2. Click **Logs**
3. View error logs and access logs

#### Node.js Application Logs
1. Go to **Node.js** settings
2. View application logs directly
3. Check for startup and runtime errors

#### Command Line Access
```bash
# SSH into server
tail -f /var/www/vhosts/askforvirginia.com/askforvirginia.com/logs/api-combined.log
tail -f /var/www/vhosts/askforvirginia.com/askforvirginia.com/logs/web-combined.log

# System logs
tail -f /var/log/plesk/httpd/vhosts/askforvirginia.com/error_log
```

### 2. Performance Monitoring
Set up monitoring for:
- **Response times**: Track API performance
- **Memory usage**: Monitor application memory
- **CPU usage**: Server resource utilization
- **Database performance**: Query execution times
- **SSL certificate expiry**: Automatic renewal status

### 3. Health Check Endpoints
Ensure your application includes health check endpoints:
```javascript
// In your API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 4. Automated Monitoring
Set up external monitoring services:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Performance monitoring
- **New Relic**: Application performance monitoring

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
**Symptoms**: 502/503 errors, application not responding

**Solutions**:
1. Check Node.js version compatibility
2. Verify environment variables
3. Check application logs for errors
4. Ensure all dependencies installed
5. Verify file permissions

#### 2. Database Connection Issues
**Symptoms**: Database connection errors, 500 errors

**Solutions**:
1. Test database credentials in phpMyAdmin
2. Verify database user permissions
3. Check network connectivity
4. Validate connection string format

#### 3. NGINX Configuration Issues
**Symptoms**: 404 errors, reverse proxy not working

**Solutions**:
1. Check NGINX syntax
2. Restart web server service
3. Verify proxy_pass URLs are correct
4. Check application ports are listening

#### 4. SSL Certificate Problems
**Symptoms**: SSL warnings, certificate errors

**Solutions**:
1. Renew Let's Encrypt certificate
2. Check certificate chain
3. Verify domain DNS settings
4. Update certificate if domain changed

#### 5. File Permission Issues
**Symptoms**: Cannot write files, upload errors

**Solutions**:
```bash
# Fix common permission issues
chown -R user:psacln /var/www/vhosts/askforvirginia.com/
chmod -R 755 /var/www/vhosts/askforvirginia.com/
chmod -R 777 /var/www/vhosts/askforvirginia.com/askforvirginia.com/public/uploads/
```

### Debug Commands
```bash
# Check if Node.js is running
ps aux | grep node

# Check port usage
netstat -tlnp | grep :5001
netstat -tlnp | grep :3001

# Check NGINX configuration
nginx -t

# Check Plesk services
service psa status
service nginx status
service mariadb status

# Application-specific debugging
cd /var/www/vhosts/askforvirginia.com/askforvirginia.com/
npm run debug
node --inspect dist/server.js
```

### Emergency Recovery
If the site goes down:

1. **Check Plesk Services**
   - Restart web server
   - Restart Node.js application
   - Check database status

2. **Rollback Procedure**
   - Revert to last working Git commit
   - Restore database backup
   - Clear application cache

3. **Contact Information**
   - Plesk hosting provider support
   - Domain registrar support
   - Database administrator

---

## Production Checklist

### Pre-Deployment
- [ ] Node.js Toolkit installed
- [ ] Domain configured in Plesk
- [ ] SSL certificate installed
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] NGINX reverse proxy configured

### Application Setup
- [ ] Dependencies installed
- [ ] Application built for production
- [ ] File permissions set correctly
- [ ] Logs directory created
- [ ] Health check endpoints working

### Security
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Database user has minimal permissions
- [ ] Sensitive files blocked from web access
- [ ] Environment variables secured

### Performance
- [ ] Static file caching enabled
- [ ] Database indexes optimized
- [ ] Application monitoring configured
- [ ] Backup procedures established

### Post-Deployment
- [ ] All pages loading correctly
- [ ] API endpoints responding
- [ ] Contact forms working
- [ ] Admin panel accessible
- [ ] Search functionality working
- [ ] Performance monitoring active

---

## Conclusion

This guide provides comprehensive instructions for deploying the Virginia Real Estate Node.js application on Plesk hosting. The configuration supports both the API backend and Next.js frontend with proper reverse proxy setup, SSL termination, and production optimization.

For additional support:
- Check Plesk documentation
- Contact your hosting provider
- Review application logs
- Consult the development team

**Last Updated**: August 2025  
**Plesk Version**: Obsidian (Latest)  
**Node.js Version**: 18.x+  
**Status**: Production Ready ✅