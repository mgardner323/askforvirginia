import express from 'express';
import { Op } from 'sequelize';
import { BlogPost, User } from '../models';
import { sequelize } from '../config/database';
import { asyncHandler } from '../middleware/error';
import { protect, authorize, optionalAuth } from '../middleware/auth';

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

interface BlogSearchFilters {
  category?: string;
  tags?: string[];
  author_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

const router = express.Router();

// @desc    Get all blog posts with filtering and pagination
// @route   GET /api/blog
// @access  Public (admin=true query param for admin access)
router.get('/', optionalAuth, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const {
    category,
    tags,
    author_id,
    status = 'published',
    page = 1,
    limit = 10,
    sort = '-published_at',
    admin = false
  } = req.query as BlogSearchFilters & { [key: string]: any };

  // Check admin access
  const isAdmin = admin === 'true' && req.user && (req.user.role === 'admin' || req.user.role === 'agent');
  
  // Build where clause
  const whereClause: any = {};
  
  // For admin access, allow any status, for public access only published
  if (isAdmin) {
    if (status && status !== 'all') whereClause.status = status;
  } else {
    whereClause.status = 'published';
    whereClause.published_at = { [Op.lte]: new Date() };
  }

  if (category && category !== 'all') whereClause.category = category;
  if (author_id) whereClause.author_id = author_id;
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    whereClause.tags = {
      [Op.overlap]: tagArray
    };
  }

  // Pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  // Parse sort parameter
  let order: any = [['published_at', 'DESC']];
  if (sort && typeof sort === 'string') {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? 'DESC' : 'ASC';
    order = [[sortField, sortDirection]];
  }

  // Execute query
  const { count: total, rows: posts } = await BlogPost.findAndCountAll({
    where: whereClause,
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'profile']
    }],
    attributes: { exclude: ['content'] }, // Exclude full content in list view
    order,
    limit: limitNum,
    offset,
    distinct: true
  });

  res.json({
    success: true,
    message: 'Blog posts retrieved successfully',
    data: {
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Get single blog post by ID or slug
// @route   GET /api/blog/:identifier
// @access  Public (admin=true query param for admin access)
router.get('/:identifier', optionalAuth, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { identifier } = req.params;
  const { admin = false } = req.query;
  
  // Check if identifier is numeric ID or slug
  const isNumericId = /^\d+$/.test(identifier);
  const whereClause: any = isNumericId ? { id: identifier } : { slug: identifier };

  // Check admin access
  const isAdmin = admin === 'true' && req.user && (req.user.role === 'admin' || req.user.role === 'agent');
  
  // Add published status filter for public access
  if (!isAdmin) {
    whereClause.status = 'published';
    whereClause.published_at = { [Op.lte]: new Date() };
  }

  const post = await BlogPost.findOne({
    where: whereClause,
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'profile']
    }]
  });

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Blog post not found'
    });
  }

  // Increment view count if not author viewing their own post
  if (!req.user || req.user.id !== post.author_id) {
    await post.increment('view_count');
  }

  // Get related posts
  const relatedPosts = await BlogPost.findAll({
    where: {
      id: { [Op.ne]: post.id },
      [Op.or]: [
        { category: post.category },
        { tags: { [Op.overlap]: post.tags } }
      ],
      status: 'published',
      published_at: { [Op.lte]: new Date() }
    },
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'profile']
    }],
    attributes: { exclude: ['content'] },
    order: [['published_at', 'DESC']],
    limit: 3
  });

  res.json({
    success: true,
    message: 'Blog post retrieved successfully',
    data: {
      post,
      related_posts: relatedPosts
    }
  });
}));

// @desc    Create new blog post
// @route   POST /api/blog
// @access  Private (Admin/Agent only)
router.post('/', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  // Set author_id to current user
  req.body.author_id = req.user.id;

  const post = await BlogPost.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Blog post created successfully',
    data: { post }
  });
}));

// @desc    Update blog post
// @route   PUT /api/blog/:id
// @access  Private (Admin/Agent only - own posts)
router.put('/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const post = await BlogPost.findByPk(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Blog post not found'
    });
  }

  // Check if user owns post or is admin
  if (post.author_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this post'
    });
  }

  await post.update(req.body);

  res.json({
    success: true,
    message: 'Blog post updated successfully',
    data: { post }
  });
}));

// @desc    Delete blog post
// @route   DELETE /api/blog/:id
// @access  Private (Admin/Agent only - own posts)
router.delete('/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const post = await BlogPost.findByPk(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Blog post not found'
    });
  }

  // Check if user owns post or is admin
  if (post.author_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this post'
    });
  }

  await post.destroy();

  res.json({
    success: true,
    message: 'Blog post deleted successfully'
  });
}));

// @desc    Get featured/latest blog posts
// @route   GET /api/blog/featured/list
// @access  Public
router.get('/featured/list', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { limit = 6 } = req.query;

  const posts = await BlogPost.findAll({
    where: {
      status: 'published',
      published_at: { [Op.lte]: new Date() }
    },
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'profile']
    }],
    attributes: { exclude: ['content'] },
    order: [['published_at', 'DESC']],
    limit: Number(limit)
  });

  res.json({
    success: true,
    message: 'Featured blog posts retrieved successfully',
    data: { posts }
  });
}));

// @desc    Get blog categories with post counts
// @route   GET /api/blog/categories
// @access  Public
router.get('/categories', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const categories = await BlogPost.findAll({
    where: {
      status: 'published',
      published_at: { [Op.lte]: new Date() }
    },
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['category'],
    order: [[sequelize.literal('count'), 'DESC']],
    raw: true
  });

  res.json({
    success: true,
    message: 'Blog categories retrieved successfully',
    data: { categories }
  });
}));

// @desc    Search blog posts
// @route   GET /api/blog/search
// @access  Public
router.get('/search', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { query, limit = 10 } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const searchTerm = `%${query}%`;
  
  const posts = await BlogPost.findAll({
    where: {
      [Op.and]: [
        {
          [Op.or]: [
            { title: { [Op.like]: searchTerm } },
            { excerpt: { [Op.like]: searchTerm } },
            { content: { [Op.like]: searchTerm } },
            { tags: { [Op.overlap]: [query as string] } }
          ]
        },
        { status: 'published' },
        { published_at: { [Op.lte]: new Date() } }
      ]
    },
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'profile']
    }],
    attributes: { exclude: ['content'] },
    order: [['published_at', 'DESC']],
    limit: Number(limit)
  });

  res.json({
    success: true,
    message: 'Blog search completed',
    data: { posts }
  });
}));

// @desc    Get blog statistics for admin
// @route   GET /api/blog/stats
// @access  Private (Admin/Agent only)
router.get('/stats', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const totalPosts = await BlogPost.count();
  const publishedPosts = await BlogPost.count({ where: { status: 'published' } });
  const draftPosts = await BlogPost.count({ where: { status: 'draft' } });
  
  const totalViewsResult = await BlogPost.sum('view_count');
  const totalViews = totalViewsResult || 0;

  const stats = {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews: Number(totalViews)
  };

  res.json({
    success: true,
    message: 'Blog statistics retrieved successfully',
    data: stats
  });
}));

export { router as blogRoutes };