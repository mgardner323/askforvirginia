import express from 'express';
import { MLSListing, Property } from '../models';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';
import { createMLSService } from '../services/MLSIntegrationService';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const router = express.Router();

// @desc    Get MLS sync status
// @route   GET /api/mls/status
// @access  Private (Admin only)
router.get('/status', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const syncStatus = await MLSListing.findAll({
    attributes: ['mls_source', 'sync_status', 'last_updated'],
    group: ['mls_source', 'sync_status'],
    raw: true
  });

  const totalListings = await MLSListing.count();
  const syncedListings = await MLSListing.count({
    where: { sync_status: 'synced' }
  });
  const pendingListings = await MLSListing.count({
    where: { sync_status: 'pending' }
  });
  const errorListings = await MLSListing.count({
    where: { sync_status: 'error' }
  });

  res.json({
    success: true,
    message: 'MLS sync status retrieved successfully',
    data: {
      total_listings: totalListings,
      synced: syncedListings,
      pending: pendingListings,
      errors: errorListings,
      sync_rate: totalListings > 0 ? ((syncedListings / totalListings) * 100).toFixed(2) : 0,
      by_source: syncStatus
    }
  });
}));

// @desc    Trigger manual MLS sync
// @route   POST /api/mls/sync
// @access  Private (Admin only)
router.post('/sync', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { source = 'crmls' } = req.body;

  try {
    const mlsService = createMLSService(source);
    const result = await mlsService.triggerSync();

    res.json({
      success: true,
      message: `MLS sync completed for ${source}`,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MLS sync failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Get MLS listings with sync details
// @route   GET /api/mls/listings
// @access  Private (Admin only)
router.get('/listings', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    source,
    sync_status,
    page = 1,
    limit = 20
  } = req.query;

  const whereClause: any = {};
  
  if (source) {
    whereClause.mls_source = source;
  }
  
  if (sync_status) {
    whereClause.sync_status = sync_status;
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const { count: total, rows: listings } = await MLSListing.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Property,
        as: 'property',
        attributes: ['id', 'seo', 'is_featured'],
        required: false
      }
    ],
    order: [['last_updated', 'DESC']],
    limit: limitNum,
    offset
  });

  res.json({
    success: true,
    message: 'MLS listings retrieved successfully',
    data: {
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Get single MLS listing
// @route   GET /api/mls/listings/:id
// @access  Private (Admin only)
router.get('/listings/:id', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const listing = await MLSListing.findByPk(req.params.id, {
    include: [
      {
        model: Property,
        as: 'property',
        required: false
      }
    ]
  });

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'MLS listing not found'
    });
  }

  res.json({
    success: true,
    message: 'MLS listing retrieved successfully',
    data: { listing }
  });
}));

// @desc    Force sync specific MLS listing to Property
// @route   POST /api/mls/listings/:id/sync
// @access  Private (Admin only)
router.post('/listings/:id/sync', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const listing = await MLSListing.findByPk(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'MLS listing not found'
    });
  }

  try {
    // Get agent for assignment
    const agentId = req.body.agent_id || req.user.id;
    const propertyData = listing.generatePropertyData(agentId);

    // Create or update property
    const [property, created] = await Property.upsert({
      ...propertyData,
      id: listing.property_id
    });

    // Update listing status
    await listing.update({
      property_id: property.id,
      sync_status: 'synced',
      sync_errors: []
    });

    res.json({
      success: true,
      message: `MLS listing ${created ? 'created' : 'updated'} as property successfully`,
      data: {
        property,
        listing,
        action: created ? 'created' : 'updated'
      }
    });

  } catch (error) {
    // Update listing with error
    await listing.update({
      sync_status: 'error',
      sync_errors: [error instanceof Error ? error.message : 'Sync failed']
    });

    res.status(500).json({
      success: false,
      message: 'Failed to sync MLS listing to property',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Delete MLS listing
// @route   DELETE /api/mls/listings/:id
// @access  Private (Admin only)
router.delete('/listings/:id', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const listing = await MLSListing.findByPk(req.params.id);

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: 'MLS listing not found'
    });
  }

  await listing.destroy();

  res.json({
    success: true,
    message: 'MLS listing deleted successfully'
  });
}));

// @desc    Get MLS sync configuration
// @route   GET /api/mls/config
// @access  Private (Admin only)
router.get('/config', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const config = {
    sources: ['crmls'], // Add more sources as configured
    sync_interval: process.env.MLS_SYNC_INTERVAL || '60',
    last_sync: await MLSListing.findOne({
      order: [['last_updated', 'DESC']],
      attributes: ['last_updated', 'mls_source']
    }),
    environment: process.env.NODE_ENV,
    api_endpoints: {
      crmls: {
        configured: !!(process.env.CRMLS_API_URL && process.env.CRMLS_USERNAME),
        url: process.env.CRMLS_API_URL || 'Not configured'
      }
    }
  };

  res.json({
    success: true,
    message: 'MLS configuration retrieved successfully',
    data: config
  });
}));

export { router as mlsRoutes };