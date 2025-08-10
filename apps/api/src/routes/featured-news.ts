import express from 'express';
import { FeaturedNews, User, sequelize } from '../models';
import { Op } from 'sequelize';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const router = express.Router();

// @desc    Get all featured news (public)
// @route   GET /api/featured-news
// @access  Public
router.get('/', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    category,
    featured_only,
    limit = 10,
    page = 1,
    include_inactive = false
  } = req.query;

  const whereClause: any = {};
  
  // Only show active and published articles for public access
  if (include_inactive !== 'true') {
    whereClause.is_active = true;
    whereClause.publish_date = { [Op.lte]: new Date() };
  }
  
  if (category) whereClause.category = category;
  if (featured_only === 'true') whereClause.is_featured = true;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const { count: total, rows: news } = await FeaturedNews.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ],
    order: [
      ['is_featured', 'DESC'],
      ['priority', 'DESC'],
      ['publish_date', 'DESC']
    ],
    limit: limitNum,
    offset
  });

  res.json({
    success: true,
    message: 'Featured news retrieved successfully',
    data: {
      news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Get featured news for home page
// @route   GET /api/featured-news/homepage
// @access  Public
router.get('/homepage', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const news = await FeaturedNews.findAll({
    where: {
      is_active: true,
      is_featured: true,
      publish_date: { [Op.lte]: new Date() }
    },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ],
    order: [
      ['priority', 'DESC'],
      ['publish_date', 'DESC']
    ],
    limit: 3
  });

  res.json({
    success: true,
    message: 'Homepage featured news retrieved successfully',
    data: { news }
  });
}));

// @desc    Get single news article
// @route   GET /api/featured-news/:identifier
// @access  Public
router.get('/:identifier', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { identifier } = req.params;
  
  // Try to find by slug first, then by ID
  const whereClause = isNaN(Number(identifier)) 
    ? { slug: identifier }
    : { id: Number(identifier) };

  const newsArticle = await FeaturedNews.findOne({
    where: {
      ...whereClause,
      is_active: true,
      publish_date: { [Op.lte]: new Date() }
    },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ]
  });

  if (!newsArticle) {
    return res.status(404).json({
      success: false,
      message: 'News article not found'
    });
  }

  // Increment view count
  if (newsArticle.analytics?.views !== undefined) {
    newsArticle.analytics.views = (newsArticle.analytics.views || 0) + 1;
    await newsArticle.save();
  }

  res.json({
    success: true,
    message: 'News article retrieved successfully',
    data: { news: newsArticle }
  });
}));

// @desc    Track news article click
// @route   POST /api/featured-news/:id/click
// @access  Public
router.post('/:id/click', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const newsArticle = await FeaturedNews.findByPk(req.params.id);

  if (!newsArticle) {
    return res.status(404).json({
      success: false,
      message: 'News article not found'
    });
  }

  await newsArticle.incrementClicks();

  res.json({
    success: true,
    message: 'Click tracked successfully'
  });
}));

// ADMIN ROUTES

// @desc    Get all news (admin)
// @route   GET /api/featured-news/admin/all
// @access  Private (Admin/Agent only)
router.get('/admin/all', protect, authorize('admin', 'agent'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    category,
    status,
    page = 1,
    limit = 20,
    search
  } = req.query;

  const whereClause: any = {};
  
  if (category) whereClause.category = category;
  if (status === 'active') whereClause.is_active = true;
  if (status === 'inactive') whereClause.is_active = false;
  if (status === 'featured') whereClause.is_featured = true;
  
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { excerpt: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } }
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const { count: total, rows: news } = await FeaturedNews.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: limitNum,
    offset
  });

  res.json({
    success: true,
    message: 'Admin news list retrieved successfully',
    data: {
      news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Create news article
// @route   POST /api/featured-news
// @access  Private (Admin/Agent only)
router.post('/', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const newsData = {
    ...req.body,
    created_by: req.user.id
  };

  // Generate slug if not provided
  if (!newsData.slug && newsData.title) {
    newsData.slug = FeaturedNews.generateSlug(newsData.title);
  }

  const news = await FeaturedNews.create(newsData);

  // Fetch the created news with associations
  const createdNews = await FeaturedNews.findByPk(news.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'News article created successfully',
    data: { news: createdNews }
  });
}));

// @desc    Update news article
// @route   PUT /api/featured-news/:id
// @access  Private (Admin/Agent only)
router.put('/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const news = await FeaturedNews.findByPk(req.params.id);

  if (!news) {
    return res.status(404).json({
      success: false,
      message: 'News article not found'
    });
  }

  // Only creator or admin can update
  if (news.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this news article'
    });
  }

  await news.update(req.body);

  // Fetch updated news with associations
  const updatedNews = await FeaturedNews.findByPk(news.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'profile']
      }
    ]
  });

  res.json({
    success: true,
    message: 'News article updated successfully',
    data: { news: updatedNews }
  });
}));

// @desc    Delete news article
// @route   DELETE /api/featured-news/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const news = await FeaturedNews.findByPk(req.params.id);

  if (!news) {
    return res.status(404).json({
      success: false,
      message: 'News article not found'
    });
  }

  await news.destroy();

  res.json({
    success: true,
    message: 'News article deleted successfully'
  });
}));

// @desc    Get news categories
// @route   GET /api/featured-news/categories
// @access  Public
router.get('/categories', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const categories = [
    { value: 'market-update', label: 'Market Updates', description: 'Latest market trends and analysis' },
    { value: 'neighborhood-spotlight', label: 'Neighborhood Spotlight', description: 'Featured communities and areas' },
    { value: 'buying-tips', label: 'Buying Tips', description: 'Advice for home buyers' },
    { value: 'selling-tips', label: 'Selling Tips', description: 'Tips for selling your home' },
    { value: 'investment', label: 'Investment', description: 'Real estate investment insights' },
    { value: 'community-news', label: 'Community News', description: 'Local community updates' },
    { value: 'other', label: 'Other', description: 'General real estate news' }
  ];

  // Get article counts per category
  const categoryCounts = await FeaturedNews.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', '*'), 'count']
    ],
    where: {
      is_active: true,
      publish_date: { [Op.lte]: new Date() }
    },
    group: 'category',
    raw: true
  }) as any[];

  const categoryMap = categoryCounts.reduce((acc: any, item: any) => {
    acc[item.category] = item.count;
    return acc;
  }, {});

  const enrichedCategories = categories.map(cat => ({
    ...cat,
    count: categoryMap[cat.value] || 0
  }));

  res.json({
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories: enrichedCategories }
  });
}));

export { router as featuredNewsRoutes };