import { Router, Response } from 'express';
import { protect, AuthenticatedRequest } from '../middleware/auth';
import { analyticsService } from '../services/AnalyticsService';
import { cacheService } from '../services/SimpleCacheService';

const router = Router();

// Middleware to track API performance
const trackApiPerformance = (endpoint: string) => {
  return (req: AuthenticatedRequest, res: Response, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      analyticsService.trackEvent({
        event: 'api_request',
        category: 'system' as any,
        action: 'request',
        label: endpoint,
        value: responseTime,
        userId: req.user?.id,
        metadata: {
          method: req.method,
          statusCode: res.statusCode,
          responseTime
        }
      });
    });
    
    next();
  };
};

/**
 * GET /api/analytics/dashboard
 * Get comprehensive analytics dashboard data
 */
router.get('/dashboard', 
  protect,
  trackApiPerformance('/api/analytics/dashboard'),
  cacheService.middleware(60), // Cache for 1 minute
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Check user permissions (admin or agent only)
      if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or agent role required.'
        });
      }

      const dashboardData = await analyticsService.getDashboardAnalytics();
      
      res.json({
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Analytics dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics dashboard data'
      });
    }
  }
);

/**
 * GET /api/analytics/properties
 * Get property-specific analytics
 */
router.get('/properties',
  protect,
  trackApiPerformance('/api/analytics/properties'),
  cacheService.middleware(300), // Cache for 5 minutes
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or agent role required.'
        });
      }

      const propertyAnalytics = await analyticsService.getPropertyAnalytics();
      
      res.json({
        success: true,
        data: propertyAnalytics
      });
    } catch (error) {
      console.error('Property analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch property analytics'
      });
    }
  }
);

/**
 * GET /api/analytics/users
 * Get user analytics and engagement metrics
 */
router.get('/users',
  protect,
  trackApiPerformance('/api/analytics/users'),
  cacheService.middleware(180), // Cache for 3 minutes
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const userAnalytics = await analyticsService.getUserAnalytics();
      
      res.json({
        success: true,
        data: userAnalytics
      });
    } catch (error) {
      console.error('User analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user analytics'
      });
    }
  }
);

/**
 * GET /api/analytics/blog
 * Get blog and content analytics
 */
router.get('/blog',
  protect,
  trackApiPerformance('/api/analytics/blog'),
  cacheService.middleware(300), // Cache for 5 minutes
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or agent role required.'
        });
      }

      const blogAnalytics = await analyticsService.getBlogAnalytics();
      
      res.json({
        success: true,
        data: blogAnalytics
      });
    } catch (error) {
      console.error('Blog analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog analytics'
      });
    }
  }
);

/**
 * GET /api/analytics/system
 * Get system performance and health metrics
 */
router.get('/system',
  protect,
  trackApiPerformance('/api/analytics/system'),
  cacheService.middleware(30), // Cache for 30 seconds (more frequent updates)
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const systemAnalytics = await analyticsService.getSystemAnalytics();
      
      res.json({
        success: true,
        data: systemAnalytics
      });
    } catch (error) {
      console.error('System analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system analytics'
      });
    }
  }
);

/**
 * GET /api/analytics/search
 * Get search analytics and popular queries
 */
router.get('/search',
  protect,
  trackApiPerformance('/api/analytics/search'),
  cacheService.middleware(600), // Cache for 10 minutes
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or agent role required.'
        });
      }

      const searchAnalytics = await analyticsService.getSearchAnalytics();
      
      res.json({
        success: true,
        data: searchAnalytics
      });
    } catch (error) {
      console.error('Search analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch search analytics'
      });
    }
  }
);

/**
 * POST /api/analytics/track
 * Track custom analytics events
 */
router.post('/track',
  trackApiPerformance('/api/analytics/track'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { event, category, action, label, value, metadata } = req.body;
      
      if (!event || !category || !action) {
        return res.status(400).json({
          success: false,
          message: 'Event, category, and action are required'
        });
      }

      await analyticsService.trackEvent({
        event,
        category,
        action,
        label,
        value,
        userId: req.user?.id,
        sessionId: req.headers['x-session-id'] as string,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        metadata
      });

      res.json({
        success: true,
        message: 'Event tracked successfully'
      });
    } catch (error) {
      console.error('Track event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track event'
      });
    }
  }
);

/**
 * POST /api/analytics/property/:id/view
 * Track property view events
 */
router.post('/property/:id/view',
  trackApiPerformance('/api/analytics/property/view'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const propertyId = parseInt(req.params.id);
      
      if (isNaN(propertyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ID'
        });
      }

      await analyticsService.trackPropertyView(
        propertyId,
        req.user?.id,
        req.headers['x-session-id'] as string
      );

      res.json({
        success: true,
        message: 'Property view tracked successfully'
      });
    } catch (error) {
      console.error('Track property view error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track property view'
      });
    }
  }
);

/**
 * GET /api/analytics/cache/stats
 * Get cache performance statistics
 */
router.get('/cache/stats',
  protect,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const cacheStats = await cacheService.getStats();
      
      res.json({
        success: true,
        data: cacheStats
      });
    } catch (error) {
      console.error('Cache stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cache statistics'
      });
    }
  }
);

/**
 * POST /api/analytics/cache/warm
 * Warm up cache with frequently accessed data
 */
router.post('/cache/warm',
  protect,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      await cacheService.warmCache();
      
      res.json({
        success: true,
        message: 'Cache warming initiated successfully'
      });
    } catch (error) {
      console.error('Cache warm error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to warm cache'
      });
    }
  }
);

/**
 * DELETE /api/analytics/cache
 * Clear cache (with optional pattern)
 */
router.delete('/cache',
  protect,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const { pattern } = req.query;
      
      await cacheService.clear(pattern as string);
      
      res.json({
        success: true,
        message: pattern 
          ? `Cache cleared for pattern: ${pattern}`
          : 'All cache cleared successfully'
      });
    } catch (error) {
      console.error('Cache clear error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache'
      });
    }
  }
);

export default router;