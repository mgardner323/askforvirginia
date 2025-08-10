# Admin Panel Development to Production Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Admin Panel Deployment Features](#admin-panel-deployment-features)
3. [Development Environment Setup](#development-environment-setup)
4. [Production Deployment Process](#production-deployment-process)
5. [Database Migration Management](#database-migration-management)
6. [Environment Configuration](#environment-configuration)
7. [Code Deployment Workflow](#code-deployment-workflow)
8. [Monitoring and Rollback](#monitoring-and-rollback)
9. [Automated Deployment Scripts](#automated-deployment-scripts)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Virginia Real Estate admin panel provides comprehensive deployment management capabilities, allowing administrators to deploy code changes from development to production environments securely and efficiently.

### Key Features
- **Environment Management**: Switch between development and production configurations
- **Database Migration Control**: Manage database schema changes through the admin interface
- **Code Deployment**: Deploy application updates via admin panel
- **Configuration Management**: Update environment variables and settings
- **Rollback Capabilities**: Revert deployments if issues occur
- **Deployment Monitoring**: Track deployment status and health

### Deployment Architecture
```
Development (dev2.askforvirginia.com) → Production (askforvirginia.com)
├── Code Changes (Git-based)
├── Database Migrations (Admin-controlled)
├── Environment Configuration (Settings panel)
├── Asset Management (File uploads)
└── Service Restart (Process management)
```

---

## Admin Panel Deployment Features

### 1. Deployment Dashboard
**Access**: Admin Panel → Deployment

The deployment dashboard provides:
- **Current Status**: Development vs Production environment status
- **Pending Changes**: List of changes ready for deployment
- **Deployment History**: Previous deployments with timestamps and status
- **Health Monitoring**: System health checks and status indicators

### 2. Environment Switcher
- **Environment Selection**: Toggle between dev and production modes
- **Configuration Preview**: See environment-specific settings before deployment
- **Safety Checks**: Prevent accidental production deployments
- **Backup Creation**: Automatic backups before major deployments

### 3. Database Migration Manager
- **Migration Status**: View pending and completed migrations
- **Migration Preview**: See SQL changes before execution
- **Rollback Capability**: Revert specific database changes
- **Data Integrity Checks**: Validate data before and after migrations

---

## Development Environment Setup

### 1. Development Server Configuration
The development environment runs on `dev2.askforvirginia.com`:

#### Server Setup
- **API Server**: Port 5001 (development mode)
- **Web Server**: Port 3001 (Next.js development)
- **Database**: `virginia` database (development data)
- **File Storage**: Local file system

#### Environment Variables (Development)
```bash
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://dev2.askforvirginia.com:3001
DB_NAME=virginia
DB_USER=virginia
DB_PASSWORD=Pinkhamster99!1
```

### 2. Development Workflow
1. **Code Changes**: Make changes in development environment
2. **Testing**: Verify functionality on dev2 subdomain
3. **Admin Review**: Use admin panel to review changes
4. **Staging**: Prepare changes for production deployment
5. **Deployment**: Execute deployment through admin panel

### 3. Development Tools Integration
- **Git Integration**: Track changes and commits
- **Hot Reload**: Automatic code refresh during development
- **Debug Mode**: Enhanced logging and error reporting
- **Database Seeding**: Test data management

---

## Production Deployment Process

### 1. Pre-Deployment Checklist
Before deploying to production, complete these steps:

#### Code Quality Checks
- [ ] All tests passing
- [ ] Code review completed
- [ ] No console.log statements in production code
- [ ] Environment variables configured
- [ ] Build process successful

#### Database Preparation
- [ ] Database migrations reviewed
- [ ] Backup created
- [ ] Migration rollback plan prepared
- [ ] Data integrity verified

#### Infrastructure Readiness
- [ ] Production server accessible
- [ ] SSL certificates valid
- [ ] DNS configuration correct
- [ ] Monitoring systems active

### 2. Deployment Execution via Admin Panel

#### Step 1: Access Deployment Manager
1. Log into admin panel at `https://askforvirginia.com/admin`
2. Navigate to **System** → **Deployment**
3. Verify admin role permissions

#### Step 2: Review Changes
1. Click **Review Pending Changes**
2. Examine code differences
3. Review database migration scripts
4. Check environment variable changes
5. Validate asset updates

#### Step 3: Create Backup
1. Click **Create Pre-Deployment Backup**
2. Backup includes:
   - Database snapshot
   - Current code version
   - Configuration files
   - Uploaded media files
3. Verify backup completion

#### Step 4: Execute Deployment
1. Click **Start Deployment**
2. Select deployment type:
   - **Full Deployment**: Complete application update
   - **Code Only**: Application code without database changes
   - **Database Only**: Schema updates without code changes
   - **Configuration Only**: Environment and settings updates

#### Step 5: Monitor Deployment
1. Watch deployment progress in real-time
2. Monitor service status indicators
3. Check health check endpoints
4. Verify application functionality

### 3. Post-Deployment Verification
After deployment completion:

#### Automated Checks
- **Health Endpoints**: API and web server response
- **Database Connectivity**: Connection and query tests
- **SSL Certificate**: HTTPS functionality
- **Core Functionality**: Critical feature tests

#### Manual Verification
- [ ] Home page loads correctly
- [ ] User authentication working
- [ ] Property search functional
- [ ] Contact forms operational
- [ ] Admin panel accessible
- [ ] Performance metrics acceptable

---

## Database Migration Management

### 1. Migration Planning
Database changes require careful planning:

#### Migration Types
- **Schema Changes**: Table structure modifications
- **Data Updates**: Bulk data transformations
- **Index Management**: Performance optimizations
- **Constraint Updates**: Relationship changes

#### Migration Strategy
1. **Backward Compatibility**: Ensure changes don't break existing code
2. **Rollback Preparation**: Plan reversal procedures
3. **Data Validation**: Verify data integrity
4. **Performance Impact**: Assess migration duration

### 2. Migration Execution via Admin Panel

#### Step 1: Migration Review
1. Go to **Database** → **Migrations**
2. Review pending migrations:
   ```sql
   -- Example migration
   ALTER TABLE properties ADD COLUMN virtual_tour_url VARCHAR(500);
   ALTER TABLE users ADD COLUMN phone VARCHAR(20);
   CREATE INDEX idx_properties_price ON properties(price);
   ```

#### Step 2: Migration Testing
1. Click **Test Migration** (dry run)
2. Review execution plan
3. Check for potential conflicts
4. Estimate execution time

#### Step 3: Execute Migration
1. Click **Execute Migration**
2. Monitor progress in real-time
3. View SQL execution logs
4. Confirm completion status

#### Step 4: Validation
1. Run post-migration checks
2. Verify data integrity
3. Test application functionality
4. Check performance impact

### 3. Migration Rollback
If issues occur:

#### Automatic Rollback
1. Click **Rollback Migration**
2. Select rollback point
3. Confirm rollback execution
4. Verify system restoration

#### Manual Rollback
1. Access rollback scripts
2. Execute reversal SQL
3. Restore backup data
4. Restart services

---

## Environment Configuration

### 1. Configuration Management
The admin panel provides centralized configuration management:

#### Settings Categories
- **Database**: Connection parameters and credentials
- **SMTP**: Email server configuration
- **API Keys**: Third-party service credentials
- **Security**: JWT secrets and encryption keys
- **Performance**: Cache and optimization settings

#### Configuration Deployment
1. Go to **Settings** → **Environment Configuration**
2. Compare development vs production settings
3. Update production values
4. Test configuration changes
5. Apply changes to production

### 2. Environment Variable Management
Secure management of sensitive configuration:

#### Variable Types
- **Public**: Non-sensitive configuration values
- **Private**: Encrypted sensitive data (passwords, API keys)
- **System**: Server-specific settings

#### Deployment Process
1. **Development**: Test new variables in dev environment
2. **Validation**: Ensure required variables are defined
3. **Encryption**: Secure sensitive values
4. **Deployment**: Apply to production environment
5. **Verification**: Test application with new configuration

### 3. Configuration Backup and Recovery
- **Automatic Backups**: Before each configuration change
- **Version History**: Track configuration changes over time
- **Rollback Capability**: Revert to previous configurations
- **Export/Import**: Backup configurations to files

---

## Code Deployment Workflow

### 1. Git-Based Deployment
The admin panel integrates with Git for code deployment:

#### Repository Management
- **Primary Repository**: Main codebase on GitHub/GitLab
- **Development Branch**: `dev` or `development`
- **Production Branch**: `main` or `production`
- **Feature Branches**: Individual feature development

#### Deployment Process
1. **Code Review**: Review changes in development
2. **Merge Preparation**: Prepare code for production branch
3. **Deployment Trigger**: Initiate deployment via admin panel
4. **Build Process**: Compile and optimize code for production
5. **Service Update**: Replace running code with new version

### 2. Build and Deployment Pipeline

#### Build Process
```bash
# 1. Install dependencies
npm ci --production

# 2. Build API
cd apps/api
npm run build

# 3. Build Web application
cd ../web
npm run build

# 4. Create deployment package
cd ../..
npm run build:production
```

#### Deployment Steps
1. **Pre-deployment**: Stop current services
2. **Code Update**: Replace application files
3. **Dependency Install**: Update npm packages
4. **Database Migration**: Apply schema changes
5. **Service Restart**: Start updated services
6. **Health Check**: Verify application health

### 3. Zero-Downtime Deployment
For high-availability deployments:

#### Blue-Green Deployment
1. **Blue Environment**: Current production
2. **Green Environment**: New version deployment
3. **Testing**: Verify green environment
4. **Switch**: Route traffic to green environment
5. **Monitoring**: Ensure stable performance

#### Rolling Deployment
1. **Staged Rollout**: Deploy to subset of servers
2. **Health Monitoring**: Verify each deployment stage
3. **Full Rollout**: Complete deployment to all servers
4. **Rollback Ready**: Quick rollback if issues occur

---

## Monitoring and Rollback

### 1. Deployment Monitoring
Real-time monitoring during and after deployment:

#### Health Metrics
- **Response Time**: API and web server performance
- **Error Rate**: Application error frequency
- **Database Performance**: Query execution times
- **Memory Usage**: Server resource utilization
- **User Activity**: User engagement and functionality

#### Monitoring Tools
- **Admin Dashboard**: Real-time metrics display
- **Automated Alerts**: Email/SMS notifications for issues
- **Log Aggregation**: Centralized log analysis
- **External Monitoring**: Third-party uptime monitoring

### 2. Rollback Procedures
Quick recovery options for deployment issues:

#### Automatic Rollback Triggers
- **High Error Rate**: >5% error rate for 5 minutes
- **Performance Degradation**: >2x normal response time
- **Health Check Failures**: Core functionality not responding
- **Database Issues**: Connection or query failures

#### Manual Rollback Process
1. **Access Admin Panel**: Emergency admin access
2. **Rollback Initiation**: Click "Emergency Rollback"
3. **Select Rollback Point**: Choose previous stable version
4. **Execute Rollback**: Automated rollback execution
5. **Verification**: Confirm system restoration

### 3. Incident Response
Structured response to deployment issues:

#### Response Team
- **Technical Lead**: Deployment coordination
- **Database Administrator**: Database issue resolution
- **System Administrator**: Server and infrastructure
- **Quality Assurance**: Functionality verification

#### Response Procedure
1. **Issue Detection**: Monitoring alerts or user reports
2. **Severity Assessment**: Impact evaluation
3. **Rollback Decision**: Rollback vs fix-forward decision
4. **Communication**: Stakeholder notification
5. **Resolution**: Issue resolution and verification
6. **Post-Mortem**: Analysis and improvement planning

---

## Automated Deployment Scripts

### 1. PM2 Ecosystem Configuration
Production process management with PM2:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'virginia-api',
      script: './apps/api/dist/server.js',
      cwd: '/var/www/vhosts/askforvirginia.com/askforvirginia.com',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        DB_HOST: 'localhost',
        DB_NAME: 'virginia_prod',
        DB_USER: 'virginia_prod',
        DB_PASSWORD: process.env.PROD_DB_PASS
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
      cwd: '/var/www/vhosts/askforvirginia.com/askforvirginia.com/apps/web',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXTAUTH_URL: 'https://askforvirginia.com',
        NEXT_PUBLIC_API_URL: 'https://askforvirginia.com/api'
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log'
    }
  ],

  deploy: {
    production: {
      user: process.env.PROD_USER || 'virginia',
      host: process.env.PROD_HOST || 'askforvirginia.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-repo/virginia-real-estate.git',
      path: '/var/www/vhosts/askforvirginia.com/askforvirginia.com',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
```

### 2. Deployment Scripts

#### Production Deployment Script
```bash
#!/bin/bash
# deploy.sh - Production deployment script

set -e

echo "🚀 Starting production deployment..."

# 1. Backup current version
echo "📦 Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="/backups/virginia_backup_$timestamp"
mkdir -p "$backup_dir"
cp -r /var/www/vhosts/askforvirginia.com/askforvirginia.com "$backup_dir/"

# 2. Database backup
echo "💾 Backing up database..."
mysqldump -u virginia_prod -p$PROD_DB_PASS virginia_prod > "$backup_dir/database_backup.sql"

# 3. Pull latest code
echo "📝 Pulling latest code..."
cd /var/www/vhosts/askforvirginia.com/askforvirginia.com
git pull origin main

# 4. Install dependencies
echo "📋 Installing dependencies..."
npm ci --production

# 5. Build application
echo "🔨 Building application..."
npm run build

# 6. Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate:prod

# 7. Restart services
echo "🔄 Restarting services..."
pm2 reload ecosystem.config.js --env production

# 8. Health check
echo "🏥 Running health checks..."
sleep 10
curl -f http://localhost:5001/api/health || exit 1
curl -f http://localhost:3001/api/health || exit 1

echo "✅ Deployment completed successfully!"
echo "📊 Deployment summary:"
echo "  - Backup created: $backup_dir"
echo "  - Services restarted: $(date)"
echo "  - Health checks: PASSED"
```

#### Rollback Script
```bash
#!/bin/bash
# rollback.sh - Emergency rollback script

set -e

echo "⚠️ Starting emergency rollback..."

# Get latest backup
latest_backup=$(ls -t /backups/virginia_backup_* | head -1)

if [ -z "$latest_backup" ]; then
    echo "❌ No backup found!"
    exit 1
fi

echo "📦 Rolling back to: $latest_backup"

# 1. Stop services
echo "🛑 Stopping services..."
pm2 stop all

# 2. Restore code
echo "📝 Restoring application code..."
rm -rf /var/www/vhosts/askforvirginia.com/askforvirginia.com/*
cp -r "$latest_backup"/* /var/www/vhosts/askforvirginia.com/askforvirginia.com/

# 3. Restore database (optional - be careful)
# echo "💾 Restoring database..."
# mysql -u virginia_prod -p$PROD_DB_PASS virginia_prod < "$latest_backup/database_backup.sql"

# 4. Restart services
echo "🔄 Starting services..."
pm2 restart all

# 5. Health check
echo "🏥 Running health checks..."
sleep 10
curl -f http://localhost:5001/api/health || exit 1
curl -f http://localhost:3001/api/health || exit 1

echo "✅ Rollback completed successfully!"
```

### 3. Automated Testing Scripts

#### Integration Tests
```bash
#!/bin/bash
# test-deployment.sh - Post-deployment testing

echo "🧪 Running deployment tests..."

# Test API endpoints
api_base="https://askforvirginia.com/api"
web_base="https://askforvirginia.com"

# Health checks
curl -f "$api_base/health" > /dev/null || (echo "❌ API health check failed" && exit 1)
echo "✅ API health check passed"

# Authentication test
auth_response=$(curl -s -X POST "$api_base/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}')
echo "✅ Authentication endpoint responding"

# Database connectivity
curl -f "$api_base/properties?limit=1" > /dev/null || (echo "❌ Database connection failed" && exit 1)
echo "✅ Database connectivity verified"

# Frontend tests
curl -f "$web_base" > /dev/null || (echo "❌ Frontend not accessible" && exit 1)
echo "✅ Frontend accessibility verified"

# Performance test
response_time=$(curl -o /dev/null -s -w '%{time_total}' "$web_base")
if (( $(echo "$response_time > 2.0" | bc -l) )); then
    echo "⚠️ Slow response time: ${response_time}s"
else
    echo "✅ Response time acceptable: ${response_time}s"
fi

echo "🎉 All deployment tests passed!"
```

---

## Troubleshooting

### 1. Common Deployment Issues

#### Issue: Deployment Fails During Build
**Symptoms**: Build process errors, missing dependencies

**Solutions**:
1. Check Node.js version compatibility
2. Verify package.json dependencies
3. Clear npm cache: `npm cache clean --force`
4. Reinstall node_modules: `rm -rf node_modules && npm install`

#### Issue: Database Migration Errors
**Symptoms**: Migration scripts fail, database schema issues

**Solutions**:
1. Check database user permissions
2. Verify migration script syntax
3. Check for data conflicts
4. Restore from backup and retry

#### Issue: Service Startup Failures
**Symptoms**: PM2 services not starting, port conflicts

**Solutions**:
1. Check port availability: `netstat -tlnp | grep :5001`
2. Verify environment variables
3. Check application logs
4. Restart PM2: `pm2 restart all`

#### Issue: SSL Certificate Problems
**Symptoms**: HTTPS not working, certificate warnings

**Solutions**:
1. Renew SSL certificate
2. Update NGINX configuration
3. Check domain DNS settings
4. Verify certificate chain

### 2. Emergency Procedures

#### Complete System Recovery
```bash
# Emergency recovery procedure
# 1. Stop all services
pm2 stop all
sudo systemctl stop nginx

# 2. Restore from backup
latest_backup=$(ls -t /backups/virginia_backup_* | head -1)
rm -rf /var/www/vhosts/askforvirginia.com/askforvirginia.com/*
cp -r "$latest_backup"/* /var/www/vhosts/askforvirginia.com/askforvirginia.com/

# 3. Restore database
mysql -u virginia_prod -p$PROD_DB_PASS virginia_prod < "$latest_backup/database_backup.sql"

# 4. Restart services
sudo systemctl start nginx
pm2 start ecosystem.config.js --env production

# 5. Verify recovery
curl -f https://askforvirginia.com/api/health
```

#### Contact Information
- **Technical Lead**: [Your contact info]
- **System Administrator**: [Server admin contact]
- **Database Administrator**: [DBA contact]
- **Hosting Provider**: [Hosting support contact]

### 3. Monitoring and Alerting

#### Key Metrics to Monitor
- **Response Time**: < 2 seconds average
- **Error Rate**: < 1% of requests
- **Memory Usage**: < 80% of available
- **CPU Usage**: < 70% average
- **Database Connections**: Monitor connection pool

#### Alert Configuration
Set up alerts for:
- Service downtime (immediate)
- High error rates (5 minutes)
- Performance degradation (10 minutes)
- Resource exhaustion (15 minutes)
- SSL certificate expiry (7 days advance)

---

## Conclusion

The admin panel deployment system provides comprehensive tools for managing development to production deployments safely and efficiently. Key benefits include:

### Deployment Advantages
- **Centralized Control**: All deployment operations through admin interface
- **Safety Mechanisms**: Automated backups and rollback capabilities
- **Monitoring Integration**: Real-time deployment monitoring
- **Audit Trail**: Complete deployment history and change tracking
- **Emergency Response**: Quick rollback and recovery procedures

### Best Practices Summary
1. **Always test deployments** in development environment first
2. **Create backups** before every production deployment
3. **Monitor deployments** in real-time during and after execution
4. **Have rollback plan** ready for every deployment
5. **Document changes** and communicate with stakeholders
6. **Verify functionality** after every deployment
7. **Keep deployment scripts** updated and tested

### Security Considerations
- **Access Control**: Limit deployment access to administrators
- **Audit Logging**: Track all deployment activities
- **Secure Credentials**: Encrypt all sensitive deployment configuration
- **Network Security**: Use secure channels for all deployment operations

This deployment system ensures reliable, trackable, and reversible deployments while maintaining system stability and security.

**Last Updated**: August 2025  
**Version**: 3.0  
**Status**: Production Ready ✅