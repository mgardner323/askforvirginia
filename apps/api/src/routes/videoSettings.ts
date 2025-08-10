import express, { Request } from 'express';
import { VideoSettings } from '../models';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'apps/web/public/uploads/videos');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${timestamp}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, WebM, and OGG videos are allowed.'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// @desc    Get all video settings
// @route   GET /api/video-settings
// @access  Private (Admin/Agent)
router.get('/', protect, authorize('admin', 'agent'), asyncHandler(async (req: Request, res: express.Response<ApiResponse>) => {
  const videoSettings = await VideoSettings.findAll({
    order: [['location', 'ASC']]
  });

  res.status(200).json({
    success: true,
    message: 'Video settings retrieved successfully',
    data: {
      video_settings: videoSettings,
      count: videoSettings.length
    }
  });
}));

// @desc    Get video setting by location
// @route   GET /api/video-settings/:location
// @access  Public
router.get('/:location', asyncHandler(async (req: Request, res: express.Response<ApiResponse>) => {
  const { location } = req.params;

  const videoSetting = await VideoSettings.findOne({
    where: { 
      location,
      is_active: true
    }
  });

  if (!videoSetting) {
    return res.status(404).json({
      success: false,
      message: `No active video setting found for location: ${location}`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Video setting retrieved successfully',
    data: videoSetting
  });
}));

// @desc    Create or update video setting
// @route   POST /api/video-settings
// @access  Private (Admin/Agent)
router.post('/', protect, authorize('admin', 'agent'), upload.single('video'), asyncHandler(async (req: RequestWithFile, res: express.Response<ApiResponse>) => {
  const {
    location,
    poster_image_url,
    alt_text,
    is_active = true,
    autoplay = true,
    muted = true,
    loop = true,
    controls = false
  } = req.body;

  if (!location) {
    return res.status(400).json({
      success: false,
      message: 'Location is required'
    });
  }

  let video_url = req.body.video_url;

  // If a file was uploaded, use the uploaded file path
  if (req.file) {
    video_url = `/uploads/videos/${req.file.filename}`;
  }

  if (!video_url) {
    return res.status(400).json({
      success: false,
      message: 'Video URL or uploaded video file is required'
    });
  }

  try {
    // Check if setting exists
    const existingSetting = await VideoSettings.findOne({ where: { location } });

    if (existingSetting) {
      // Update existing setting
      await existingSetting.update({
        video_url,
        poster_image_url,
        alt_text,
        is_active: Boolean(is_active),
        autoplay: Boolean(autoplay),
        muted: Boolean(muted),
        loop: Boolean(loop),
        controls: Boolean(controls)
      });

      res.status(200).json({
        success: true,
        message: 'Video setting updated successfully',
        data: existingSetting
      });
    } else {
      // Create new setting
      const newSetting = await VideoSettings.create({
        location,
        video_url,
        poster_image_url,
        alt_text,
        is_active: Boolean(is_active),
        autoplay: Boolean(autoplay),
        muted: Boolean(muted),
        loop: Boolean(loop),
        controls: Boolean(controls)
      });

      res.status(201).json({
        success: true,
        message: 'Video setting created successfully',
        data: newSetting
      });
    }
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'A video setting for this location already exists'
      });
    }
    throw error;
  }
}));

// @desc    Update video setting
// @route   PUT /api/video-settings/:id
// @access  Private (Admin/Agent)
router.put('/:id', protect, authorize('admin', 'agent'), upload.single('video'), asyncHandler(async (req: RequestWithFile, res: express.Response<ApiResponse>) => {
  const { id } = req.params;
  const {
    video_url: bodyVideoUrl,
    poster_image_url,
    alt_text,
    is_active,
    autoplay,
    muted,
    loop,
    controls
  } = req.body;

  const videoSetting = await VideoSettings.findByPk(id);

  if (!videoSetting) {
    return res.status(404).json({
      success: false,
      message: 'Video setting not found'
    });
  }

  let video_url = bodyVideoUrl;

  // If a file was uploaded, use the uploaded file path
  if (req.file) {
    video_url = `/uploads/videos/${req.file.filename}`;
  }

  const updateData: any = {};
  if (video_url !== undefined) updateData.video_url = video_url;
  if (poster_image_url !== undefined) updateData.poster_image_url = poster_image_url;
  if (alt_text !== undefined) updateData.alt_text = alt_text;
  if (is_active !== undefined) updateData.is_active = Boolean(is_active);
  if (autoplay !== undefined) updateData.autoplay = Boolean(autoplay);
  if (muted !== undefined) updateData.muted = Boolean(muted);
  if (loop !== undefined) updateData.loop = Boolean(loop);
  if (controls !== undefined) updateData.controls = Boolean(controls);

  await videoSetting.update(updateData);

  res.status(200).json({
    success: true,
    message: 'Video setting updated successfully',
    data: videoSetting
  });
}));

// @desc    Delete video setting
// @route   DELETE /api/video-settings/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req: Request, res: express.Response<ApiResponse>) => {
  const { id } = req.params;

  const videoSetting = await VideoSettings.findByPk(id);

  if (!videoSetting) {
    return res.status(404).json({
      success: false,
      message: 'Video setting not found'
    });
  }

  await videoSetting.destroy();

  res.status(200).json({
    success: true,
    message: 'Video setting deleted successfully'
  });
}));

// @desc    Toggle video setting status
// @route   PATCH /api/video-settings/:id/toggle
// @access  Private (Admin/Agent)
router.patch('/:id/toggle', protect, authorize('admin', 'agent'), asyncHandler(async (req: Request, res: express.Response<ApiResponse>) => {
  const { id } = req.params;

  const videoSetting = await VideoSettings.findByPk(id);

  if (!videoSetting) {
    return res.status(404).json({
      success: false,
      message: 'Video setting not found'
    });
  }

  await videoSetting.update({ is_active: !videoSetting.is_active });

  res.status(200).json({
    success: true,
    message: `Video setting ${videoSetting.is_active ? 'activated' : 'deactivated'} successfully`,
    data: videoSetting
  });
}));

export default router;