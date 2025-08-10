import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { analyticsService } from '../services/AnalyticsService';
import { cacheService } from '../services/SimpleCacheService';
import os from 'os';
import v8 from 'v8';

interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  userId?: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
  memoryUsage?: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
  errorMessage?: string;
  slowQuery?: boolean;
  cacheHit?: boolean;
}

interface SystemMetrics {
  timestamp: number;
  cpu: {
    loadAverage: number[];
    usage: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };
  heap: {
    used: number;
    total: number;
    limit: number;
  };
  uptime: number;
  activeRequests: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private activeRequests: Map<string, PerformanceMetrics> = new Map();
  private slowQueryThreshold = 1000; // 1 second
  private maxMetricsHistory = 1000;
  private systemMetricsInterval?: NodeJS.Timeout;
  
  constructor() {
    this.startSystemMonitoring();
  }

  private startSystemMonitoring() {
    // Collect system metrics every 30 seconds
    this.systemMetricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);
  }

  private collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    const loadAvg = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const systemMetric: SystemMetrics = {
      timestamp: Date.now(),
      cpu: {
        loadAverage: loadAvg,
        usage: loadAvg[0] / os.cpus().length * 100
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        usage: (usedMem / totalMem) * 100
      },
      heap: {
        used: heapStats.used_heap_size,
        total: heapStats.total_heap_size,
        limit: heapStats.heap_size_limit
      },
      uptime: process.uptime(),
      activeRequests: this.activeRequests.size
    };

    this.systemMetrics.push(systemMetric);
    
    // Keep only recent system metrics
    if (this.systemMetrics.length > 288) { // 24 hours at 5-minute intervals
      this.systemMetrics = this.systemMetrics.slice(-288);
    }

    // Cache recent system metrics
    cacheService.set('performance:system_metrics', systemMetric, { ttl: 60 });
  }

  async trackRequest(req: AuthenticatedRequest): Promise<string> {
    const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
    const startTime = Date.now();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metric: PerformanceMetrics = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      startTime,
      memoryUsage: memUsage,
      cpuUsage: {
        user: cpuUsage.user / 1000, // Convert to milliseconds
        system: cpuUsage.system / 1000
      }
    };

    this.activeRequests.set(requestId, metric);
    return requestId;
  }

  async completeRequest(requestId: string, res: Response, error?: Error): Promise<void> {
    const metric = this.activeRequests.get(requestId);
    if (!metric) return;

    const endTime = Date.now();
    const duration = endTime - metric.startTime;
    const responseSize = res.get('content-length') ? parseInt(res.get('content-length')!) : 0;

    // Update metric
    metric.endTime = endTime;
    metric.duration = duration;
    metric.statusCode = res.statusCode;
    metric.responseSize = responseSize;
    metric.slowQuery = duration > this.slowQueryThreshold;
    
    if (error) {
      metric.errorMessage = error.message;
    }

    // Remove from active requests
    this.activeRequests.delete(requestId);

    // Add to metrics history
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Track in analytics service
    await this.trackInAnalytics(metric);

    // Cache recent performance data
    await this.cachePerformanceData();

    // Log slow queries
    if (metric.slowQuery) {
      console.warn(`Slow query detected: ${metric.method} ${metric.url} - ${duration}ms`);
    }
  }

  private async trackInAnalytics(metric: PerformanceMetrics): Promise<void> {
    try {
      await analyticsService.trackEvent({
        event: 'api_performance',
        category: 'system',
        action: 'request_completed',
        label: `${metric.method} ${metric.url}`,
        value: metric.duration,
        userId: metric.userId,
        metadata: {
          method: metric.method,
          statusCode: metric.statusCode,
          duration: metric.duration,
          responseSize: metric.responseSize,
          memoryUsage: metric.memoryUsage,
          slowQuery: metric.slowQuery,
          errorMessage: metric.errorMessage
        }
      });
    } catch (error) {
      console.error('Failed to track performance in analytics:', error);
    }
  }

  private async cachePerformanceData(): Promise<void> {
    try {
      const recentMetrics = this.metrics.slice(-100);
      const avgResponseTime = recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / recentMetrics.length
        : 0;

      const errorRate = recentMetrics.length > 0
        ? (recentMetrics.filter(m => m.statusCode && m.statusCode >= 400).length / recentMetrics.length) * 100
        : 0;

      const slowQueries = recentMetrics.filter(m => m.slowQuery).length;

      const performanceSummary = {
        recentMetrics,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        slowQueries,
        activeRequests: this.activeRequests.size,
        totalRequests: this.metrics.length,
        timestamp: Date.now()
      };

      await cacheService.set('performance:summary', performanceSummary, { ttl: 60 });
    } catch (error) {
      console.error('Failed to cache performance data:', error);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getSystemMetrics(): SystemMetrics[] {
    return [...this.systemMetrics];
  }

  getActiveRequests(): Map<string, PerformanceMetrics> {
    return new Map(this.activeRequests);
  }

  getPerformanceSummary() {
    const recent = this.metrics.slice(-100);
    const avgResponseTime = recent.length > 0 
      ? recent.reduce((sum, m) => sum + (m.duration || 0), 0) / recent.length
      : 0;

    const errorRate = recent.length > 0
      ? (recent.filter(m => m.statusCode && m.statusCode >= 400).length / recent.length) * 100
      : 0;

    const endpointStats = this.getEndpointStats(recent);

    return {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      totalRequests: this.metrics.length,
      activeRequests: this.activeRequests.size,
      slowQueries: recent.filter(m => m.slowQuery).length,
      endpointStats,
      systemMetrics: this.systemMetrics.slice(-1)[0] // Latest system metrics
    };
  }

  private getEndpointStats(metrics: PerformanceMetrics[]) {
    const endpoints = new Map<string, {
      count: number;
      totalTime: number;
      errors: number;
      avgTime: number;
      errorRate: number;
    }>();

    metrics.forEach(metric => {
      const key = `${metric.method} ${metric.url}`;
      const existing = endpoints.get(key) || { count: 0, totalTime: 0, errors: 0, avgTime: 0, errorRate: 0 };
      
      existing.count++;
      existing.totalTime += metric.duration || 0;
      
      if (metric.statusCode && metric.statusCode >= 400) {
        existing.errors++;
      }
      
      existing.avgTime = existing.totalTime / existing.count;
      existing.errorRate = (existing.errors / existing.count) * 100;
      
      endpoints.set(key, existing);
    });

    return Array.from(endpoints.entries())
      .map(([endpoint, stats]) => ({ endpoint, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  cleanup() {
    if (this.systemMetricsInterval) {
      clearInterval(this.systemMetricsInterval);
    }
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

// Middleware for tracking request performance
export const performanceMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const requestId = await performanceMonitor.trackRequest(req);
    
    // Add request ID to response headers for debugging
    res.setHeader('X-Request-ID', requestId);
    
    // Track response completion
    const originalEnd = res.end;
    res.end = function(this: Response, ...args: any[]) {
      performanceMonitor.completeRequest(requestId, res);
      return (originalEnd as any).apply(this, args);
    };

    // Track errors
    res.on('error', (error) => {
      performanceMonitor.completeRequest(requestId, res, error);
    });

    next();
  } catch (error) {
    console.error('Performance middleware error:', error);
    next(); // Continue even if performance tracking fails
  }
};

// Middleware for tracking errors
export const performanceErrorMiddleware = (error: Error, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const requestId = res.getHeader('X-Request-ID') as string;
  if (requestId) {
    performanceMonitor.completeRequest(requestId, res, error);
  }
  next(error);
};

// Real-time performance monitoring endpoints
export const performanceEndpoints = {
  // Get current performance metrics
  getMetrics: (req: AuthenticatedRequest, res: Response) => {
    try {
      const summary = performanceMonitor.getPerformanceSummary();
      res.json({
        success: true,
        data: summary,
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get performance metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get detailed metrics
  getDetailedMetrics: (req: AuthenticatedRequest, res: Response) => {
    try {
      const { limit = 100 } = req.query;
      const metrics = performanceMonitor.getMetrics().slice(-Number(limit));
      
      res.json({
        success: true,
        data: {
          metrics,
          summary: performanceMonitor.getPerformanceSummary()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get detailed metrics'
      });
    }
  },

  // Get system metrics
  getSystemMetrics: (req: AuthenticatedRequest, res: Response) => {
    try {
      const systemMetrics = performanceMonitor.getSystemMetrics().slice(-24); // Last 24 data points
      
      res.json({
        success: true,
        data: systemMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get system metrics'
      });
    }
  },

  // Get active requests
  getActiveRequests: (req: AuthenticatedRequest, res: Response) => {
    try {
      const activeRequests = Array.from(performanceMonitor.getActiveRequests().entries())
        .map(([id, metric]) => ({
          id,
          ...metric,
          duration: Date.now() - metric.startTime
        }));

      res.json({
        success: true,
        data: activeRequests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get active requests'
      });
    }
  }
};

export { performanceMonitor };
export default performanceMonitor;