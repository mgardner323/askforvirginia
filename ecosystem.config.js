// PM2 Ecosystem configuration for Virginia Hodges Real Estate
// This file configures PM2 process management for production deployment

module.exports = {
  apps: [
    {
      name: 'virginia-api',
      script: './apps/api/dist/server.js',
      cwd: process.env.NODE_ENV === 'production' 
        ? '/var/www/vhosts/askforvirginia.com/askforvirginia.com'
        : '/var/www/vhosts/askforvirginia.com/dev2.askforvirginia.com',
      instances: process.env.NODE_ENV === 'production' ? 2 : 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5001,
        DB_HOST: 'localhost',
        DB_NAME: 'virginia',
        DB_USER: 'virginia',
        DB_PASSWORD: 'Pinkhamster99!1'
      },
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
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'virginia-web',
      script: 'npm',
      args: 'start',
      cwd: process.env.NODE_ENV === 'production'
        ? '/var/www/vhosts/askforvirginia.com/askforvirginia.com/apps/web'
        : '/var/www/vhosts/askforvirginia.com/dev2.askforvirginia.com/apps/web',
      instances: 1,
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXTAUTH_URL: 'https://askforvirginia.com',
        NEXT_PUBLIC_API_URL: 'https://askforvirginia.com/api'
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: process.env.PROD_USER || 'virginia',
      host: process.env.PROD_HOST || 'askforvirginia.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/virginia-real-estate.git', // Update with actual repo
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