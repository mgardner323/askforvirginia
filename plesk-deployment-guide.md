# Plesk Deployment Guide - Virginia Hodges Real Estate

## Plesk Environment Considerations

### 1. SSL Certificates
✅ **Handled by Plesk automatically** - No additional configuration needed
- Plesk will auto-renew Let's Encrypt certificates
- Force HTTPS redirect can be enabled in Plesk panel
- SSL certificates will be applied to both dev and production domains

### 2. File Permissions & Ownership
**Important for Plesk environments:**

```bash
# Set proper ownership (run on both dev and production)
sudo chown -R $(whoami):psacln /var/www/vhosts/askforvirginia.com/
sudo chmod -R 755 /var/www/vhosts/askforvirginia.com/
sudo chmod -R 775 /var/www/vhosts/askforvirginia.com/*/public/uploads/
```

### 3. Node.js Configuration in Plesk
**Production Site Setup:**
1. In Plesk Panel → Domains → askforvirginia.com
2. Go to "Node.js" 
3. Set:
   - **Node.js version**: 18.x or higher
   - **Document root**: `/httpdocs`
   - **Application root**: `/`
   - **Application startup file**: `apps/api/dist/server.js`
   - **Package.json path**: `/`

**Environment Variables in Plesk:**
Add these in Node.js settings:
```
NODE_ENV=production
PORT=3000
```

### 4. Database Configuration
**MariaDB/MySQL in Plesk:**
- Database host: `localhost` 
- Use Plesk-generated database credentials
- Ensure UTF8 character set: `utf8mb4_unicode_ci`

### 5. Process Management
**PM2 Configuration for Production:**

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'virginia-api',
      script: './apps/api/dist/server.js',
      cwd: '/var/www/vhosts/askforvirginia.com/askforvirginia.com',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'virginia-web',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/vhosts/askforvirginia.com/askforvirginia.com/apps/web',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true
    }
  ]
};
```

### 6. Nginx Configuration (Plesk-managed)
**Custom Nginx directives in Plesk:**

Add to "Additional directives for HTTP":
```nginx
# API proxy
location /api/ {
    proxy_pass http://localhost:5001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Next.js proxy
location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied expired no-cache no-store private must-revalidate auth;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
```

### 7. Cron Jobs (Optional)
**For automated tasks in Plesk:**

1. Go to "Scheduled Tasks" in Plesk
2. Add cron jobs for:

**Database backup (daily at 2 AM):**
```bash
0 2 * * * cd /var/www/vhosts/askforvirginia.com/askforvirginia.com && node -e "require('./apps/api/dist/services/DeploymentService.js').deploymentService.createProductionBackup()"
```

**Log cleanup (weekly):**
```bash
0 3 * * 0 find /var/www/vhosts/askforvirginia.com/askforvirginia.com/logs -name "*.log" -mtime +7 -delete
```

### 8. Email Configuration
**SMTP through Plesk:**
- Use Plesk's built-in SMTP server
- Or configure external SMTP (Gmail) as currently set up
- Ensure SPF/DKIM records are configured in Plesk DNS

### 9. Security Best Practices
**Plesk Security Extensions:**
1. Install "Plesk Security Core"
2. Enable "Fail2Ban" for SSH protection
3. Configure "ModSecurity" for web application firewall
4. Enable "ImunifyAV" for malware scanning

**File Security:**
```bash
# Restrict access to sensitive files
echo "deny from all" > /var/www/vhosts/askforvirginia.com/askforvirginia.com/.htaccess
echo "deny from all" > /var/www/vhosts/askforvirginia.com/dev2.askforvirginia.com/.htaccess
```

### 10. Monitoring & Logs
**Plesk Monitoring:**
- Enable "Resource Usage" monitoring
- Set up "Health Monitor" notifications
- Configure log rotation in "Log Manager"

**Application Logs:**
```bash
# Create log directory
mkdir -p /var/www/vhosts/askforvirginia.com/askforvirginia.com/logs
mkdir -p /var/www/vhosts/askforvirginia.com/dev2.askforvirginia.com/logs

# Set permissions
chmod 755 /var/www/vhosts/askforvirginia.com/*/logs
```

### 11. Deployment Checklist for Plesk
**Before deploying to production:**

- [ ] SSL certificate active in Plesk
- [ ] Node.js configured with correct startup file
- [ ] Database credentials configured
- [ ] File permissions set correctly
- [ ] Nginx directives added
- [ ] Environment variables configured
- [ ] PM2 processes running
- [ ] Cron jobs scheduled (if needed)
- [ ] Security extensions enabled
- [ ] Monitoring configured

### 12. Troubleshooting
**Common Plesk Issues:**

**Node.js app not starting:**
```bash
# Check Plesk Node.js logs
tail -f /var/www/vhosts/system/askforvirginia.com/logs/nodejs_error.log

# Restart Node.js in Plesk
# Go to Domains → askforvirginia.com → Node.js → Restart
```

**Permission issues:**
```bash
# Fix ownership
sudo chown -R askforvirginia:psacln /var/www/vhosts/askforvirginia.com/
```

**Database connection issues:**
```bash
# Test database connection
mysql -h localhost -u virginia_prod -p virginia_prod
```

## Next Steps
1. Configure production database credentials in Plesk
2. Set up Node.js application in Plesk panel
3. Add Nginx directives for API and web proxies
4. Test deployment using the admin deployment center
5. Monitor application logs and performance

This guide ensures your Virginia Hodges Real Estate site runs optimally in the Plesk environment!