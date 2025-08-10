# 🚀 Plesk Deployment Checklist - Virginia Hodges Real Estate

## Pre-Deployment Setup

### ✅ **Plesk Panel Configuration**
- [ ] SSL Certificate enabled and auto-renewing (Let's Encrypt)
- [ ] Force HTTPS redirect enabled
- [ ] Node.js extension installed and configured
- [ ] Database created with proper credentials
- [ ] File permissions set correctly (755 for files, 775 for upload directories)

### ✅ **Domain & DNS Configuration**
- [ ] Main domain: `askforvirginia.com` configured
- [ ] Test subdomain: `dev.askforvirginia.com` configured (for test deployment)
- [ ] Dev subdomain: `dev2.askforvirginia.com` configured (for development)
- [ ] A records pointing to correct IP address
- [ ] MX records configured for email (if using Plesk mail)
- [ ] SPF/DKIM records configured for email deliverability

### ✅ **Database Setup**
- [ ] Production database created: `virginia_prod`
- [ ] Database user created: `virginia_prod` 
- [ ] User permissions granted to database
- [ ] Character set: `utf8mb4_unicode_ci`
- [ ] Database backup scheduled in Plesk

### ✅ **Node.js Configuration in Plesk**
- [ ] Node.js version: 18.x or higher
- [ ] Document root: `/httpdocs`
- [ ] Application root: `/`
- [ ] Startup file: `ecosystem.config.js`
- [ ] Environment variables configured:
  - `NODE_ENV=production`
  - `PORT=5001` (API)
  - Database credentials
  - SMTP settings

## Security Configuration

### ✅ **Security Extensions**
- [ ] Plesk Security Core installed
- [ ] Fail2Ban configured for SSH protection
- [ ] ModSecurity enabled (Web Application Firewall)
- [ ] ImunifyAV installed (malware scanning)
- [ ] Security headers configured in Nginx

### ✅ **File Security**
- [ ] `.htaccess` files protecting sensitive directories
- [ ] File permissions: 755 for directories, 644 for files
- [ ] Upload directory permissions: 775
- [ ] Log directory created and writable
- [ ] Environment files (.env) secured

### ✅ **Network Security**
- [ ] Firewall rules configured
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Non-standard SSH port (optional but recommended)

## Application Deployment

### ✅ **Code Deployment**
- [ ] SSH keys generated for deployment user
- [ ] Production server accessible via SSH
- [ ] Git repository accessible (if using git deployment)
- [ ] PM2 installed globally on production
- [ ] Build process tested

### ✅ **Environment Configuration**
- [ ] Production `.env` file configured with:
  - [ ] Database credentials
  - [ ] JWT secrets (unique for production)
  - [ ] SMTP configuration
  - [ ] reCAPTCHA production keys
  - [ ] API keys (Google Maps, MLS, etc.)
  - [ ] File storage configuration

### ✅ **Dependencies & Build**
- [ ] Node.js modules installed: `npm install --production`
- [ ] Application built: `npm run build`
- [ ] PM2 processes configured and started
- [ ] Log files created and permissions set

## Nginx/Apache Configuration

### ✅ **Plesk Nginx Directives**
Add to "Additional directives for HTTP":

```nginx
# API proxy configuration
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
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Next.js application proxy
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
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com;" always;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json image/svg+xml;
```

## Process Management

### ✅ **PM2 Configuration**
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Ecosystem file configured: `ecosystem.config.js`
- [ ] Processes started: `pm2 start ecosystem.config.js --env production`
- [ ] PM2 startup script: `pm2 startup` and `pm2 save`
- [ ] Process monitoring enabled
- [ ] Auto-restart on crash configured

### ✅ **Log Management**
- [ ] Log directory created: `/logs`
- [ ] Log rotation configured
- [ ] Error logs monitored
- [ ] Access logs enabled (if needed)

## Monitoring & Maintenance

### ✅ **Health Checks**
- [ ] API health endpoint accessible: `/api/health`
- [ ] Database connectivity verified
- [ ] SMTP configuration tested
- [ ] reCAPTCHA functionality tested
- [ ] File upload functionality tested

### ✅ **Performance Optimization**
- [ ] Node.js memory limits configured
- [ ] Database query optimization
- [ ] Static file caching enabled
- [ ] Image compression configured
- [ ] CDN configured (optional)

### ✅ **Backup Strategy**
- [ ] Database backups automated (daily)
- [ ] File backups scheduled
- [ ] Backup retention policy defined
- [ ] Backup restoration tested

## Scheduled Tasks (Cron Jobs)

### ✅ **Optional Cron Jobs in Plesk**
- [ ] **Daily Database Backup** (2:00 AM):
  ```bash
  0 2 * * * mysqldump -u virginia_prod -p[password] virginia_prod > /var/backups/db-$(date +\%Y\%m\%d).sql
  ```

- [ ] **Weekly Log Cleanup** (3:00 AM Sunday):
  ```bash
  0 3 * * 0 find /var/www/vhosts/askforvirginia.com/askforvirginia.com/logs -name "*.log" -mtime +7 -delete
  ```

- [ ] **SSL Certificate Check** (6:00 AM daily):
  ```bash
  0 6 * * * /usr/local/psa/bin/site --check-certificate -domain askforvirginia.com
  ```

## Testing & Validation

### ✅ **Functional Testing**
- [ ] Website loads correctly
- [ ] All pages accessible
- [ ] Contact form works with captcha
- [ ] Admin login functional
- [ ] Database operations working
- [ ] Email sending operational
- [ ] File uploads working

### ✅ **Performance Testing**
- [ ] Page load times acceptable (<3 seconds)
- [ ] API response times fast (<500ms)
- [ ] Database queries optimized
- [ ] Memory usage within limits
- [ ] CPU usage reasonable under load

### ✅ **Security Testing**
- [ ] SSL certificate valid and properly configured
- [ ] Security headers present
- [ ] No sensitive information exposed
- [ ] Authentication working properly
- [ ] Rate limiting functional
- [ ] File upload restrictions working

## Post-Deployment

### ✅ **Monitoring Setup**
- [ ] Plesk monitoring enabled
- [ ] Email notifications configured for:
  - [ ] High resource usage
  - [ ] Service failures
  - [ ] SSL certificate expiration
  - [ ] Disk space warnings

### ✅ **Documentation**
- [ ] Production environment documented
- [ ] Database schema documented
- [ ] Deployment process documented
- [ ] Emergency procedures documented

### ✅ **Team Access**
- [ ] Admin credentials shared securely
- [ ] Plesk panel access configured
- [ ] SSH access configured for team members
- [ ] Deployment system tested by team

## Emergency Procedures

### ✅ **Rollback Plan**
- [ ] Database backup available
- [ ] Previous code version tagged
- [ ] Rollback procedure documented and tested
- [ ] Emergency contacts defined

### ✅ **Incident Response**
- [ ] 24/7 monitoring alerts configured
- [ ] Incident response plan documented
- [ ] Emergency contact list available
- [ ] Service status page (optional)

---

## 🎯 **Final Deployment Command**

Once all checklist items are completed:

```bash
# From development server, use the admin deployment center:
1. Log in to admin dashboard
2. Go to Deployment section
3. Test connection to production
4. Create production backup
5. Run full deployment (start with dry-run)
6. Monitor logs and verify functionality
```

## 📞 **Support Information**

- **Plesk Support**: Available through hosting provider
- **Application Support**: Virginia Hodges Real Estate development team
- **Emergency Contact**: [Your emergency contact info]

---

**✅ All items completed? Ready for production deployment!**