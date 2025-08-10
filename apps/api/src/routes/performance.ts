import { Router } from 'express';
import { protect, AuthenticatedRequest } from '../middleware/auth';
import { performanceEndpoints } from '../middleware/performance';
import { cacheService } from '../services/SimpleCacheService';

const router = Router();

/**
 * GET /api/performance/metrics
 * Get current performance summary
 */
router.get('/metrics', protect, performanceEndpoints.getMetrics);

/**
 * GET /api/performance/detailed
 * Get detailed performance metrics
 */
router.get('/detailed', protect, performanceEndpoints.getDetailedMetrics);

/**
 * GET /api/performance/system
 * Get system performance metrics
 */
router.get('/system', protect, performanceEndpoints.getSystemMetrics);

/**
 * GET /api/performance/active
 * Get active requests
 */
router.get('/active', protect, performanceEndpoints.getActiveRequests);

/**
 * GET /api/performance/alerts
 * Get performance alerts and warnings
 */
router.get('/alerts', protect, async (req: AuthenticatedRequest, res) => {
  try {
    // Check user permissions (admin only)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const summary = await cacheService.get<any>('performance:summary');
    const systemMetrics = await cacheService.get<any>('performance:system_metrics');
    
    const alerts = [];
    const warnings = [];

    if (summary) {
      // Check for slow response times
      if (summary.avgResponseTime > 2000) {
        alerts.push({
          type: 'slow_response',
          severity: 'high',
          message: `Average response time is ${summary.avgResponseTime}ms (threshold: 2000ms)`,
          timestamp: Date.now()
        });
      } else if (summary.avgResponseTime > 1000) {
        warnings.push({
          type: 'slow_response',
          severity: 'medium',
          message: `Average response time is ${summary.avgResponseTime}ms (threshold: 1000ms)`,
          timestamp: Date.now()
        });
      }

      // Check for high error rate
      if (summary.errorRate > 5) {
        alerts.push({
          type: 'high_error_rate',
          severity: 'high',
          message: `Error rate is ${summary.errorRate}% (threshold: 5%)`,
          timestamp: Date.now()
        });
      } else if (summary.errorRate > 2) {
        warnings.push({
          type: 'high_error_rate',
          severity: 'medium',
          message: `Error rate is ${summary.errorRate}% (threshold: 2%)`,
          timestamp: Date.now()
        });
      }

      // Check for too many slow queries
      if (summary.slowQueries > 10) {
        warnings.push({
          type: 'slow_queries',
          severity: 'medium',
          message: `${summary.slowQueries} slow queries detected in recent requests`,
          timestamp: Date.now()
        });
      }
    }

    if (systemMetrics) {
      // Check memory usage
      if (systemMetrics.memory.usage > 90) {
        alerts.push({
          type: 'high_memory',
          severity: 'high',
          message: `Memory usage is ${systemMetrics.memory.usage.toFixed(1)}% (threshold: 90%)`,
          timestamp: Date.now()
        });
      } else if (systemMetrics.memory.usage > 80) {
        warnings.push({
          type: 'high_memory',
          severity: 'medium',
          message: `Memory usage is ${systemMetrics.memory.usage.toFixed(1)}% (threshold: 80%)`,
          timestamp: Date.now()
        });
      }

      // Check CPU usage
      if (systemMetrics.cpu.usage > 80) {
        alerts.push({
          type: 'high_cpu',
          severity: 'high',
          message: `CPU usage is ${systemMetrics.cpu.usage.toFixed(1)}% (threshold: 80%)`,
          timestamp: Date.now()
        });
      } else if (systemMetrics.cpu.usage > 60) {
        warnings.push({
          type: 'high_cpu',
          severity: 'medium',
          message: `CPU usage is ${systemMetrics.cpu.usage.toFixed(1)}% (threshold: 60%)`,
          timestamp: Date.now()
        });
      }

      // Check heap usage
      const heapUsagePercent = (systemMetrics.heap.used / systemMetrics.heap.limit) * 100;
      if (heapUsagePercent > 85) {
        alerts.push({
          type: 'heap_pressure',
          severity: 'high',
          message: `Heap usage is ${heapUsagePercent.toFixed(1)}% of limit (threshold: 85%)`,
          timestamp: Date.now()
        });
      } else if (heapUsagePercent > 70) {
        warnings.push({
          type: 'heap_pressure',
          severity: 'medium',
          message: `Heap usage is ${heapUsagePercent.toFixed(1)}% of limit (threshold: 70%)`,
          timestamp: Date.now()
        });
      }
    }

    res.json({
      success: true,
      data: {
        alerts,
        warnings,
        summary: {
          alertCount: alerts.length,
          warningCount: warnings.length,
          totalIssues: alerts.length + warnings.length,
          lastChecked: Date.now()
        }
      }
    });
  } catch (error) {
    console.error('Performance alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance alerts'
    });
  }
});

/**
 * POST /api/performance/gc
 * Trigger garbage collection (admin only)
 */
router.post('/gc', protect, async (req: AuthenticatedRequest, res) => {
  try {
    // Check user permissions (admin only)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const beforeGC = process.memoryUsage();
    
    // Trigger garbage collection if available
    if (global.gc) {
      global.gc();
      const afterGC = process.memoryUsage();
      
      res.json({
        success: true,
        message: 'Garbage collection triggered successfully',
        data: {
          before: beforeGC,
          after: afterGC,
          freed: {
            rss: beforeGC.rss - afterGC.rss,
            heapUsed: beforeGC.heapUsed - afterGC.heapUsed,
            heapTotal: beforeGC.heapTotal - afterGC.heapTotal,
            external: beforeGC.external - afterGC.external
          }
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Garbage collection not available. Start Node.js with --expose-gc flag.'
      });
    }
  } catch (error) {
    console.error('Garbage collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger garbage collection'
    });
  }
});

/**
 * GET /api/performance/report
 * Generate performance report
 */
router.get('/report', protect, async (req: AuthenticatedRequest, res) => {
  try {
    // Check user permissions (admin only)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { timeRange = '1h' } = req.query;
    
    const summary = await cacheService.get<any>('performance:summary');
    const systemMetrics = await cacheService.get<any>('performance:system_metrics');
    
    const report = {
      timestamp: Date.now(),
      timeRange,
      performance: summary || null,
      system: systemMetrics || null,
      recommendations: [] as any[]
    };

    // Generate recommendations based on metrics
    if (summary) {
      if (summary.avgResponseTime > 1000) {
        report.recommendations.push({
          type: 'performance',
          priority: 'high',
          title: 'Optimize Response Times',
          description: `Average response time is ${summary.avgResponseTime}ms. Consider database query optimization, caching improvements, or load balancing.`
        });
      }

      if (summary.errorRate > 2) {
        report.recommendations.push({
          type: 'reliability',
          priority: 'high',
          title: 'Reduce Error Rate',
          description: `Error rate is ${summary.errorRate}%. Review application logs and implement better error handling.`
        });
      }

      if (summary.slowQueries > 5) {
        report.recommendations.push({
          type: 'database',
          priority: 'medium',
          title: 'Optimize Database Queries',
          description: `${summary.slowQueries} slow queries detected. Consider adding database indexes or query optimization.`
        });
      }
    }

    if (systemMetrics) {
      if (systemMetrics.memory.usage > 80) {
        report.recommendations.push({
          type: 'infrastructure',
          priority: 'high',
          title: 'Memory Usage Optimization',
          description: `Memory usage is ${systemMetrics.memory.usage.toFixed(1)}%. Consider memory optimization or scaling up resources.`
        });
      }

      if (systemMetrics.cpu.usage > 60) {
        report.recommendations.push({
          type: 'infrastructure',
          priority: 'medium',
          title: 'CPU Usage Monitoring',
          description: `CPU usage is ${systemMetrics.cpu.usage.toFixed(1)}%. Monitor for potential bottlenecks.`
        });
      }
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Performance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate performance report'
    });
  }
});

export { router as performanceRoutes };
export default router;