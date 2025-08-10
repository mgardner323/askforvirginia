import express, { Request } from 'express';
import { BlogMedia, User } from '../models';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

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

interface AuthenticatedRequest extends Request {
  user?: User;
}

interface RequestWithFile extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

// Configure multer for blog media uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'apps/web/public/uploads/blog');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    cb(null, `${name}-${timestamp}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Get all blog media
// @route   GET /api/blog-media
// @access  Private (Admin/Agent)
router.get('/', protect, authorize('admin', 'agent'), asyncHandler(async (req: AuthenticatedRequest, res: express.Response<ApiResponse>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const mimeType = req.query.type as string;
  const offset = (page - 1) * limit;

  const whereConditions: any = { is_active: true };

  if (search) {
    whereConditions.original_name = {
      $like: `%${search}%`
    };
  }

  if (mimeType) {
    whereConditions.mime_type = {
      $like: `${mimeType}%`
    };
  }

  const { rows: media, count: total } = await BlogMedia.findAndCountAll({
    where: whereConditions,
    include: [{
      model: User,
      as: 'uploader',
      attributes: ['email', 'profile']
    }],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  const mediaWithUrls = media.map(item => ({
    ...item.toJSON(),
    publicUrl: item.getPublicUrl(),
    formattedFileSize: item.getFormattedFileSize(),
    displaySize: item.getDisplaySize()
  }));

  res.status(200).json({
    success: true,
    message: 'Blog media retrieved successfully',
    data: {
      media: mediaWithUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Upload blog media
// @route   POST /api/blog-media/upload
// @access  Private (Admin/Agent)
router.post('/upload', protect, authorize('admin', 'agent'), upload.single('media'), asyncHandler(async (req: RequestWithFile, res: express.Response<ApiResponse>) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const { alt_text, caption } = req.body;
  
  let width, height;

  // Get image dimensions if it's an image
  if (req.file.mimetype.startsWith('image/')) {
    try {
      const metadata = await sharp(req.file.path).metadata();
      width = metadata.width;
      height = metadata.height;
    } catch (error) {
      console.warn('Could not get image dimensions:', error);
    }
  }

  const blogMedia = await BlogMedia.create({
    filename: req.file.filename,
    original_name: req.file.originalname,
    file_path: req.file.path,
    file_size: req.file.size,
    mime_type: req.file.mimetype,
    width,
    height,
    alt_text: alt_text || '',
    caption: caption || '',
    uploaded_by: req.user!.id,
    is_active: true
  });

  const mediaWithUrl = {
    ...blogMedia.toJSON(),
    publicUrl: blogMedia.getPublicUrl(),
    formattedFileSize: blogMedia.getFormattedFileSize(),
    displaySize: blogMedia.getDisplaySize()
  };

  res.status(201).json({
    success: true,
    message: 'Media uploaded successfully',
    data: mediaWithUrl
  });
}));

// @desc    Update blog media
// @route   PUT /api/blog-media/:id
// @access  Private (Admin/Agent)
router.put('/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: AuthenticatedRequest, res: express.Response<ApiResponse>) => {
  const { id } = req.params;
  const { alt_text, caption, is_active } = req.body;

  const blogMedia = await BlogMedia.findByPk(id);

  if (!blogMedia) {
    return res.status(404).json({
      success: false,
      message: 'Media not found'
    });
  }

  const updateData: any = {};
  if (alt_text !== undefined) updateData.alt_text = alt_text;
  if (caption !== undefined) updateData.caption = caption;
  if (is_active !== undefined) updateData.is_active = Boolean(is_active);

  await blogMedia.update(updateData);

  const mediaWithUrl = {
    ...blogMedia.toJSON(),
    publicUrl: blogMedia.getPublicUrl(),
    formattedFileSize: blogMedia.getFormattedFileSize(),
    displaySize: blogMedia.getDisplaySize()
  };

  res.status(200).json({
    success: true,
    message: 'Media updated successfully',
    data: mediaWithUrl
  });
}));

// @desc    Delete blog media
// @route   DELETE /api/blog-media/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req: AuthenticatedRequest, res: express.Response<ApiResponse>) => {
  const { id } = req.params;

  const blogMedia = await BlogMedia.findByPk(id);

  if (!blogMedia) {
    return res.status(404).json({
      success: false,
      message: 'Media not found'
    });
  }

  // Delete the physical file
  try {
    await fs.unlink(blogMedia.file_path);
  } catch (error) {
    console.warn('Could not delete physical file:', error);
  }

  await blogMedia.destroy();

  res.status(200).json({
    success: true,
    message: 'Media deleted successfully'
  });
}));

// @desc    Get blog media statistics
// @route   GET /api/blog-media/stats
// @access  Private (Admin/Agent)
router.get('/stats', protect, authorize('admin', 'agent'), asyncHandler(async (req: AuthenticatedRequest, res: express.Response<ApiResponse>) => {
  const totalFiles = await BlogMedia.count({
    where: { is_active: true }
  });

  const totalSize = await BlogMedia.sum('file_size', {
    where: { is_active: true }
  }) || 0;

  const imageFiles = await BlogMedia.count({
    where: { 
      is_active: true,
      mime_type: { $like: 'image%' }
    }
  });

  const recentUploads = await BlogMedia.count({
    where: { 
      is_active: true,
      created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }
  });

  res.status(200).json({
    success: true,
    message: 'Media statistics retrieved successfully',
    data: {
      totalFiles,
      totalSize,
      imageFiles,
      recentUploads,
      formattedTotalSize: formatFileSize(totalSize)
    }
  });
}));

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;