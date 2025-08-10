import express from 'express';
import multer from 'multer';
import { headerMediaService } from '../services/HeaderMediaService';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Apply authentication and admin role requirement to all routes except public ones
router.use('/admin', protect);
router.use('/admin', authorize('admin', 'agent'));

/**
 * GET /api/header-media/current
 * Get currently active header media (public endpoint)
 */
router.get('/current', async (req, res) => {
  try {
    const activeMedia = await headerMediaService.getActiveMedia();
    
    res.json({
      success: true,
      data: activeMedia
    });
  } catch (error) {
    console.error('Error fetching active header media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active header media',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/header-media/admin
 * Get all header media files (admin only)
 */
router.get('/admin', async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const media = await headerMediaService.getAllMedia(includeInactive);
    
    res.json({
      success: true,
      data: media,
      count: media.length
    });
  } catch (error) {
    console.error('Error fetching header media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch header media',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/header-media/admin/upload
 * Upload new header media file (admin only)
 */
router.post('/admin/upload', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Validate file
    const validation = headerMediaService.validateFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Upload and save media
    const media = await headerMediaService.uploadMedia(req.file);

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: media
    });
  } catch (error) {
    console.error('Error uploading header media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/header-media/admin/:id/activate
 * Set a media file as active (admin only)
 */
router.put('/admin/:id/activate', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid media ID'
      });
    }

    const media = await headerMediaService.setActiveMedia(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      message: 'Media activated successfully',
      data: media
    });
  } catch (error) {
    console.error('Error activating header media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate media',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/header-media/admin/:id
 * Get specific media file details (admin only)
 */
router.get('/admin/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid media ID'
      });
    }

    const media = await headerMediaService.getMediaById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Error fetching header media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/header-media/admin/:id
 * Delete a media file (admin only)
 */
router.delete('/admin/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid media ID'
      });
    }

    const success = await headerMediaService.deleteMedia(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Media not found or could not be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting header media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/header-media/admin/stats
 * Get storage statistics (admin only)
 */
router.get('/admin/stats', async (req, res) => {
  try {
    const stats = await headerMediaService.getStorageStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching header media stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/header-media/admin/cleanup
 * Clean up old inactive files (admin only)
 */
router.post('/admin/cleanup', async (req, res) => {
  try {
    const olderThanDays = parseInt(req.body.olderThanDays) || 30;
    const deletedCount = await headerMediaService.cleanupOldFiles(olderThanDays);
    
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old files`,
      data: { deletedCount, olderThanDays }
    });
  } catch (error) {
    console.error('Error cleaning up header media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;