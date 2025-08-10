import express from 'express';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';
import { deploymentService } from '../services/DeploymentService';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const router = express.Router();

// @desc    Get deployment system status
// @route   GET /api/deployment/status
// @access  Private (Admin only)
router.get('/status', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const status = await deploymentService.getSystemStatus();

  res.json({
    success: true,
    message: 'System status retrieved successfully',
    data: status
  });
}));

// @desc    Test production connection
// @route   POST /api/deployment/test-connection
// @access  Private (Admin only)
router.post('/test-connection', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const connectionResult = await deploymentService.testConnection();

  res.json({
    success: connectionResult.success,
    message: connectionResult.message,
    data: { connected: connectionResult.success }
  });
}));

// @desc    Create production backup
// @route   POST /api/deployment/backup
// @access  Private (Admin only)
router.post('/backup', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const backupResult = await deploymentService.createProductionBackup();

  res.json({
    success: backupResult.success,
    message: backupResult.message,
    data: backupResult.success ? { backupFile: backupResult.backupFile } : null
  });
}));

// @desc    Sync database from dev to production
// @route   POST /api/deployment/sync-database
// @access  Private (Admin only)
router.post('/sync-database', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    includeContent = true,
    includeUsers = false,
    includeProperties = true,
    includeBlog = true,
    includeNews = true,
    includeMarketReports = true,
    includeEmailTemplates = true,
    backupFirst = true,
    dryRun = false
  } = req.body;

  const syncOptions = {
    includeContent,
    includeUsers,
    includeProperties,
    includeBlog,
    includeNews,
    includeMarketReports,
    includeEmailTemplates,
    includeFiles: false, // Files handled separately
    backupFirst,
    dryRun
  };

  const result = await deploymentService.syncDatabase(syncOptions);

  res.json({
    success: result.success,
    message: result.message,
    data: {
      details: result.details,
      errors: result.errors,
      duration: result.duration,
      timestamp: result.timestamp
    }
  });
}));

// @desc    Sync files from dev to production
// @route   POST /api/deployment/sync-files
// @access  Private (Admin only)
router.post('/sync-files', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    includeUploads = true,
    dryRun = false
  } = req.body;

  const result = await deploymentService.syncFiles({
    includeUploads,
    dryRun
  });

  res.json({
    success: result.success,
    message: result.message,
    data: {
      details: result.details,
      errors: result.errors,
      duration: result.duration,
      timestamp: result.timestamp
    }
  });
}));

// @desc    Full deployment (database + files)
// @route   POST /api/deployment/deploy
// @access  Private (Admin only)
router.post('/deploy', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    includeContent = true,
    includeUsers = false,
    includeProperties = true,
    includeBlog = true,
    includeNews = true,
    includeMarketReports = true,
    includeEmailTemplates = true,
    includeFiles = true,
    backupFirst = true,
    dryRun = false
  } = req.body;

  const deploymentOptions = {
    includeContent,
    includeUsers,
    includeProperties,
    includeBlog,
    includeNews,
    includeMarketReports,
    includeEmailTemplates,
    includeFiles,
    backupFirst,
    dryRun
  };

  const result = await deploymentService.fullDeployment(deploymentOptions);

  res.json({
    success: result.success,
    message: result.message,
    data: {
      details: result.details,
      errors: result.errors,
      duration: result.duration,
      timestamp: result.timestamp
    }
  });
}));

// @desc    Get deployment history
// @route   GET /api/deployment/history
// @access  Private (Admin only)
router.get('/history', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const history = deploymentService.getDeploymentHistory();

  res.json({
    success: true,
    message: 'Deployment history retrieved successfully',
    data: { deployments: history }
  });
}));

// @desc    Get deployment configuration
// @route   GET /api/deployment/config
// @access  Private (Admin only)
router.get('/config', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const config = {
    production: {
      host: process.env.PROD_HOST || 'askforvirginia.com',
      path: process.env.PROD_PATH || '/var/www/vhosts/askforvirginia.com/askforvirginia.com',
      configured: !!(process.env.PROD_HOST && process.env.PROD_USER && process.env.PROD_DB_PASS)
    },
    development: {
      path: process.env.DEV_PATH || '/var/www/vhosts/askforvirginia.com/dev2.askforvirginia.com',
      database: process.env.DB_NAME || 'virginia'
    },
    features: {
      databaseSync: true,
      fileSync: true,
      backupSupport: true,
      dryRunMode: true,
      historyTracking: true
    }
  };

  res.json({
    success: true,
    message: 'Deployment configuration retrieved successfully',
    data: config
  });
}));

export { router as deploymentRoutes };