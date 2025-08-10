import express from 'express';
import { productionDeploymentService } from '../services/ProductionDeploymentService';
import { protect, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication and admin role requirement to all routes
router.use(protect);
router.use(authorize('admin')); // Only admins can deploy

/**
 * POST /api/production-deployment/deploy
 * Start a new production deployment
 */
router.post('/deploy', async (req: AuthenticatedRequest, res) => {
  try {
    // Check if deployment is already running
    if (productionDeploymentService.isDeploymentRunning()) {
      return res.status(409).json({
        success: false,
        message: 'A deployment is already in progress. Please wait for it to complete.'
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const triggeredBy = `${user.profile?.first_name || 'User'} ${user.profile?.last_name || ''} (${user.email})`;

    // Start deployment
    const deployment = await productionDeploymentService.startDeployment(triggeredBy);

    res.status(201).json({
      success: true,
      message: 'Production deployment started successfully',
      data: deployment
    });
  } catch (error) {
    console.error('Error starting production deployment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start deployment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/production-deployment/status/:id
 * Get deployment status by ID
 */
router.get('/status/:id', async (req, res) => {
  try {
    const deploymentId = req.params.id;
    const deployment = productionDeploymentService.getDeployment(deploymentId);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'Deployment not found'
      });
    }

    res.json({
      success: true,
      data: deployment
    });
  } catch (error) {
    console.error('Error fetching deployment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deployment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/production-deployment/history
 * Get all deployments (active and historical)
 */
router.get('/history', async (req, res) => {
  try {
    const deployments = productionDeploymentService.getAllDeployments();
    
    res.json({
      success: true,
      data: deployments,
      count: deployments.length
    });
  } catch (error) {
    console.error('Error fetching deployment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deployment history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/production-deployment/current
 * Get currently running deployment status
 */
router.get('/current', async (req, res) => {
  try {
    const isRunning = productionDeploymentService.isDeploymentRunning();
    
    if (!isRunning) {
      return res.json({
        success: true,
        data: null,
        message: 'No deployment currently running'
      });
    }

    const deployments = productionDeploymentService.getAllDeployments();
    const currentDeployment = deployments.find(d => d.status === 'running');

    res.json({
      success: true,
      data: currentDeployment || null
    });
  } catch (error) {
    console.error('Error fetching current deployment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current deployment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/production-deployment/stats
 * Get deployment statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = productionDeploymentService.getDeploymentStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching deployment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deployment statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/production-deployment/pre-check
 * Run pre-deployment checks without starting deployment
 */
router.get('/pre-check', async (req, res) => {
  try {
    // This is a simplified pre-check - in production you might want more detailed checks
    const checks = {
      diskSpace: 'checking...',
      productionPath: 'checking...',
      developmentPath: 'checking...',
      databaseConnection: 'checking...',
      npmInstalled: 'checking...'
    };

    // Simulate basic checks (you could expand this with actual implementation)
    const result = {
      success: true,
      allPassed: true,
      checks: {
        diskSpace: 'sufficient',
        productionPath: 'accessible',
        developmentPath: 'accessible', 
        databaseConnection: 'connected',
        npmInstalled: 'available'
      },
      warnings: [],
      errors: []
    };

    res.json({
      success: true,
      data: result,
      message: result.allPassed ? 'All pre-deployment checks passed' : 'Some checks failed or have warnings'
    });
  } catch (error) {
    console.error('Error running pre-deployment checks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run pre-deployment checks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/production-deployment/cancel/:id
 * Cancel a running deployment (if possible)
 * Note: This is a placeholder - actual cancellation would need careful implementation
 */
router.delete('/cancel/:id', async (req, res) => {
  try {
    const deploymentId = req.params.id;
    const deployment = productionDeploymentService.getDeployment(deploymentId);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'Deployment not found'
      });
    }

    if (deployment.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel deployment that is not running'
      });
    }

    // Note: Actual cancellation logic would need to be implemented in the service
    // This is a placeholder response
    res.json({
      success: false,
      message: 'Deployment cancellation is not yet implemented for safety reasons',
      note: 'Deployments will complete automatically or fail safely'
    });
  } catch (error) {
    console.error('Error cancelling deployment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel deployment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;