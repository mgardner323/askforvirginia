import express from 'express';
import { Op } from 'sequelize';
import { User, Property, BlogPost, MarketReport } from '../models';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const router = express.Router();

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin/Agent only)
router.get('/dashboard/stats', protect, authorize('admin', 'agent'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  try {
    // Get property statistics
    const totalProperties = await Property.count();
    const activeProperties = await Property.count({
      where: { 'property_details.status': 'active' }
    });
    const soldProperties = await Property.count({
      where: { 'property_details.status': 'sold' }
    });
    const pendingProperties = await Property.count({
      where: { 'property_details.status': 'pending' }
    });

    // Get blog statistics
    const totalBlogPosts = await BlogPost.count();
    const publishedPosts = await BlogPost.count({
      where: { status: 'published' }
    });
    const draftPosts = await BlogPost.count({
      where: { status: 'draft' }
    });

    // Get user statistics
    const totalUsers = await User.count();
    const agentUsers = await User.count({
      where: { role: ['admin', 'agent'] }
    });
    const clientUsers = await User.count({
      where: { role: 'client' }
    });

    // Get market report statistics
    const totalReports = await MarketReport.count();
    const latestReport = await MarketReport.findOne({
      where: { published: true },
      order: [['report_date', 'DESC']],
      attributes: ['report_date']
    });

    const stats = {
      properties: {
        total: totalProperties,
        active: activeProperties,
        sold: soldProperties,
        pending: pendingProperties
      },
      blog: {
        total: totalBlogPosts,
        published: publishedPosts,
        draft: draftPosts
      },
      users: {
        total: totalUsers,
        agents: agentUsers,
        clients: clientUsers
      },
      market: {
        reports: totalReports,
        latest_date: latestReport?.report_date || null
      }
    };

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Get recent activity feed
// @route   GET /api/admin/dashboard/activity
// @access  Private (Admin/Agent only)
router.get('/dashboard/activity', protect, authorize('admin', 'agent'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 10);

    // Get recent properties
    const recentProperties = await Property.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.ceil(limit / 3),
      attributes: ['id', 'address', 'created_at', 'property_details'],
      include: [{
        model: User,
        as: 'agent',
        attributes: ['profile']
      }]
    });

    // Get recent blog posts
    const recentBlogPosts = await BlogPost.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.ceil(limit / 3),
      attributes: ['id', 'title', 'created_at', 'status'],
      include: [{
        model: User,
        as: 'author',
        attributes: ['profile']
      }]
    });

    // Get recent users
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.ceil(limit / 3),
      attributes: ['id', 'email', 'role', 'created_at', 'profile']
    });

    // Combine and sort all activities
    const activities = [
      ...recentProperties.map(prop => ({
        id: `property-${prop.id}`,
        type: 'property',
        action: 'New property added',
        item: `${prop.address.street}, ${prop.address.city}`,
        time: prop.created_at,
        details: {
          price: prop.property_details.price,
          status: prop.property_details.status
        }
      })),
      ...recentBlogPosts.map(post => ({
        id: `blog-${post.id}`,
        type: 'blog',
        action: post.status === 'published' ? 'Blog post published' : 'Blog post created',
        item: post.title,
        time: post.created_at,
        details: {
          status: post.status
        }
      })),
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user',
        action: 'New user registered',
        item: user.email,
        time: user.created_at,
        details: {
          role: user.role,
          name: `${user.profile.first_name} ${user.profile.last_name}`
        }
      }))
    ];

    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      message: 'Recent activity retrieved successfully',
      data: { activities: limitedActivities }
    });

  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// @desc    Get system health check
// @route   GET /api/admin/system/health
// @access  Private (Admin only)
router.get('/system/health', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  try {
    const healthChecks = {
      database: { status: 'healthy', response_time: 0 },
      api: { status: 'healthy', uptime: process.uptime() },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    // Test database connection
    const dbStart = Date.now();
    await User.findOne({ limit: 1 });
    healthChecks.database.response_time = Date.now() - dbStart;

    res.json({
      success: true,
      message: 'System health check completed',
      data: healthChecks
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export { router as adminRoutes };