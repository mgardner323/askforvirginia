import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { 
  securityMiddleware, 
  productionRateLimit, 
  productionCors, 
  productionLogger,
  healthCheck,
  requestId
} from './middleware/security';

import { connectDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/error';
import { authRoutes } from './routes/auth';
import { propertyRoutes } from './routes/properties';
import { blogRoutes } from './routes/blog';
import { marketRoutes } from './routes/market';
import { userRoutes } from './routes/users';
import { contactRoutes } from './routes/contact';
import { adminRoutes } from './routes/admin';
import { mlsRoutes } from './routes/mls';
import { emailRoutes } from './routes/email';
import { savedSearchesRoutes } from './routes/saved-searches';
import { featuredNewsRoutes } from './routes/featured-news';
import { deploymentRoutes } from './routes/deployment';
import productionDeploymentRoutes from './routes/production-deployment';
import mortgageRoutes from './routes/mortgage';
import settingsRoutes from './routes/settings';
import credentialsRoutes from './routes/credentials';
import videoSettingsRoutes from './routes/videoSettings';
import headerMediaRoutes from './routes/header-media';
import aiContentRoutes from './routes/ai-content';
import blogMediaRoutes from './routes/blogMedia';
import analyticsRoutes from './routes/analytics';
import { cronRoutes } from './routes/cron';
import { performanceRoutes } from './routes/performance';
import { performanceMiddleware, performanceErrorMiddleware } from './middleware/performance';
import { searchRoutes } from './routes/search';
import { createMLSService } from './services/MLSIntegrationService';
import { createEmailMarketingService } from './services/EmailMarketingService';
import { cronJobService } from './services/CronJobService';
import { cacheService } from './services/SimpleCacheService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';

// Request ID middleware
app.use(requestId);

// Security middleware
if (isProduction) {
  app.use(securityMiddleware());
  app.use(cors(productionCors));
  app.use(rateLimit(productionRateLimit));
} else {
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
  }));
  
  // Rate limiting for development
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);
}

// General middleware
app.use(compression());

// Logging
if (isProduction) {
  app.use(productionLogger);
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring middleware (before routes)
app.use(performanceMiddleware);

// Health check endpoint
app.get('/api/health', healthCheck);
app.get('/health', healthCheck); // Alternative endpoint for load balancers

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mls', mlsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/saved-searches', savedSearchesRoutes);
app.use('/api/featured-news', featuredNewsRoutes);
app.use('/api/deployment', deploymentRoutes);
app.use('/api/production-deployment', productionDeploymentRoutes);
app.use('/api/mortgage', mortgageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/video-settings', videoSettingsRoutes);
app.use('/api/header-media', headerMediaRoutes);
app.use('/api/ai-content', aiContentRoutes);
app.use('/api/blog-media', blogMediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware (performance error tracking before general error handling)
app.use(performanceErrorMiddleware);
app.use(notFound);
app.use(errorHandler);

// Start server and advanced services
async function startServer() {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Virginia Real Estate API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
      
      // Start advanced services in production
      if (process.env.NODE_ENV === 'production') {
        startAdvancedServices();
      } else {
        console.log(`⚡ Advanced services disabled in ${process.env.NODE_ENV} mode`);
        console.log(`   To enable: Set NODE_ENV=production`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize advanced services
async function startAdvancedServices() {
  try {
    console.log('⚡ Starting advanced services...');
    
    // Start Cron Job Service (includes MLS sync)
    await cronJobService.startAllJobs();
    
    // Legacy MLS Integration (if cron service not handling)
    if (!cronJobService.getJobStatus().some(job => job.name === 'mls-sync')) {
      if (process.env.CRMLS_API_URL && process.env.CRMLS_USERNAME) {
        const mlsService = createMLSService('crmls');
        mlsService.startScheduledSync();
        console.log('✅ Legacy MLS sync service started');
      } else {
        console.log('⚠️  MLS service disabled (missing configuration)');
      }
    }
    
    // Start Email Marketing
    try {
      const emailService = await createEmailMarketingService();
      emailService.startPropertyAlerts();
      console.log('✅ Property alerts service started');
    } catch (error) {
      console.log('⚠️  Email service disabled (SMTP configuration not available):', error);
    }
    
    // Initialize cache warming
    try {
      console.log('🔥 Starting cache warming...');
      await cacheService.warmCache();
      console.log('✅ Cache warming completed');
    } catch (error) {
      console.log('⚠️  Cache warming failed:', error);
    }
    
    console.log('🎉 Advanced services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to start advanced services:', error);
    // Don't exit - allow server to run without advanced features
  }
}

startServer();

export default app;