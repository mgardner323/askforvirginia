import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { cronJobService } from '../services/CronJobService';
import { MLSListing, Property } from '../models';
import { Op } from 'sequelize';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const router = express.Router();

// @desc    Get cron job status
// @route   GET /api/cron/status
// @access  Private (Admin only)
router.get('/status', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const jobStatus = cronJobService.getJobStatus();
  
  // Get additional statistics
  const stats = {
    total_mls_listings: await MLSListing.count(),
    synced_listings: await MLSListing.count({ where: { sync_status: 'synced' } }),
    pending_listings: await MLSListing.count({ where: { sync_status: 'pending' } }),
    error_listings: await MLSListing.count({ where: { sync_status: 'error' } }),
    total_properties: await Property.count(),
    last_sync: await MLSListing.findOne({
      order: [['last_updated', 'DESC']],
      attributes: ['last_updated', 'mls_source']
    })
  };

  res.json({
    success: true,
    message: 'Cron job status retrieved successfully',
    data: {
      jobs: jobStatus,
      statistics: stats,
      environment: process.env.NODE_ENV,
      sync_interval: process.env.MLS_SYNC_INTERVAL || '60'
    }
  });
}));

// @desc    Trigger specific cron job manually
// @route   POST /api/cron/trigger/:jobName
// @access  Private (Admin only)
router.post('/trigger/:jobName', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { jobName } = req.params;
  
  try {
    const success = await cronJobService.triggerJob(jobName);
    
    if (success) {
      res.json({
        success: true,
        message: `Job '${jobName}' triggered successfully`,
        data: { jobName, triggeredAt: new Date().toISOString() }
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Failed to trigger job '${jobName}' - job not found or failed to execute`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error triggering job '${jobName}'`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Force start cron jobs (for development)
// @route   POST /api/cron/force-start
// @access  Private (Admin only)
router.post('/force-start', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  try {
    await cronJobService.forceStart();
    
    res.json({
      success: true,
      message: 'Cron jobs force started successfully',
      data: {
        jobs: cronJobService.getJobStatus(),
        startedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to force start cron jobs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Stop all cron jobs
// @route   POST /api/cron/stop
// @access  Private (Admin only)
router.post('/stop', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  try {
    cronJobService.stopAllJobs();
    
    res.json({
      success: true,
      message: 'All cron jobs stopped successfully',
      data: { stoppedAt: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop cron jobs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Get MLS sync statistics and recent activity
// @route   GET /api/cron/mls-stats
// @access  Private (Admin only)
router.get('/mls-stats', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  // Get recent sync activity (last 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const recentActivity = await MLSListing.findAll({
    where: {
      updated_at: { [Op.gte]: twentyFourHoursAgo }
    },
    attributes: ['mls_source', 'sync_status', 'updated_at', 'mls_id'],
    order: [['updated_at', 'DESC']],
    limit: 50
  });

  // Get sync status breakdown by source
  const syncStats = await MLSListing.findAll({
    attributes: [
      'mls_source',
      'sync_status',
      [MLSListing.sequelize!.fn('COUNT', '*'), 'count']
    ],
    group: ['mls_source', 'sync_status'],
    raw: true
  });

  // Get properties created from MLS in last 24 hours
  const recentProperties = await Property.count({
    where: {
      created_at: { [Op.gte]: twentyFourHoursAgo }
      // Note: mls_id exists for properties synced from MLS
    }
  });

  res.json({
    success: true,
    message: 'MLS sync statistics retrieved successfully',
    data: {
      recent_activity: recentActivity,
      sync_breakdown: syncStats,
      properties_created_24h: recentProperties,
      last_update: new Date().toISOString()
    }
  });
}));

// @desc    Get cron job logs (simplified version)
// @route   GET /api/cron/logs
// @access  Private (Admin only)
router.get('/logs', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { limit = 100, type = 'all' } = req.query;
  
  // In a production system, you'd want to store logs in a dedicated table
  // For now, we'll return recent MLS listing updates as a proxy for logs
  
  const whereClause: any = {};
  if (type === 'error') {
    whereClause.sync_status = 'error';
  } else if (type === 'success') {
    whereClause.sync_status = 'synced';
  }
  
  const logs = await MLSListing.findAll({
    where: whereClause,
    attributes: [
      'id',
      'mls_id', 
      'mls_source',
      'sync_status',
      'sync_errors',
      'last_updated',
      'updated_at'
    ],
    order: [['updated_at', 'DESC']],
    limit: Math.min(Number(limit), 500) // Cap at 500
  });

  res.json({
    success: true,
    message: 'Cron job logs retrieved successfully',
    data: {
      logs,
      total: logs.length,
      type: type,
      timestamp: new Date().toISOString()
    }
  });
}));

// @desc    Test CRMLS connection
// @route   POST /api/cron/test-connection
// @access  Private (Admin only)
router.post('/test-connection', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  try {
    const { createMLSService } = await import('../services/MLSIntegrationService');
    const mlsService = createMLSService('crmls');
    
    // Test authentication
    const token = await mlsService.authenticate();
    
    res.json({
      success: true,
      message: 'CRMLS connection test successful',
      data: {
        authenticated: !!token,
        timestamp: new Date().toISOString(),
        source: 'crmls'
      }
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'CRMLS connection test failed',
      error: error instanceof Error ? error.message : 'Unknown connection error'
    });
  }
}));

export { router as cronRoutes };