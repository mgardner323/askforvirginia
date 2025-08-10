import express from 'express';
import { Op } from 'sequelize';
import { User, Property } from '../models';
import { asyncHandler } from '../middleware/error';
import { protect, authorize } from '../middleware/auth';

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

const router = express.Router();

// @desc    Get user's saved properties
// @route   GET /api/users/saved-properties
// @access  Private
router.get('/saved-properties', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['saved_properties']
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get the saved properties with agent information
  const properties = await Property.findAll({
    where: {
      id: { [Op.in]: user.saved_properties }
    },
    include: [{
      model: User,
      as: 'agent',
      attributes: ['id', 'profile']
    }]
  });

  res.json({
    success: true,
    message: 'Saved properties retrieved successfully',
    data: {
      properties
    }
  });
}));

// @desc    Add property to saved list
// @route   POST /api/users/saved-properties/:propertyId
// @access  Private
router.post('/saved-properties/:propertyId', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { propertyId } = req.params;

  // Check if property exists
  const property = await Property.findByPk(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Get user and add to saved properties if not already saved
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const savedProperties = user.saved_properties || [];
  if (!savedProperties.includes(Number(propertyId))) {
    savedProperties.push(Number(propertyId));
    await user.update({ saved_properties: savedProperties });
  }

  res.json({
    success: true,
    message: 'Property added to saved list',
    data: {
      saved_properties: user.saved_properties
    }
  });
}));

// @desc    Remove property from saved list
// @route   DELETE /api/users/saved-properties/:propertyId
// @access  Private
router.delete('/saved-properties/:propertyId', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { propertyId } = req.params;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const savedProperties = user.saved_properties || [];
  const updatedProperties = savedProperties.filter(id => id !== Number(propertyId));
  await user.update({ saved_properties: updatedProperties });

  res.json({
    success: true,
    message: 'Property removed from saved list',
    data: {
      saved_properties: updatedProperties
    }
  });
}));

// @desc    Get user's saved searches
// @route   GET /api/users/saved-searches
// @access  Private
router.get('/saved-searches', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['saved_searches']
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'Saved searches retrieved successfully',
    data: {
      searches: user.saved_searches
    }
  });
}));

// @desc    Create saved search
// @route   POST /api/users/saved-searches
// @access  Private
router.post('/saved-searches', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { name, criteria, notifications = true } = req.body;

  if (!name || !criteria) {
    return res.status(400).json({
      success: false,
      message: 'Name and criteria are required'
    });
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const savedSearches = user.saved_searches || [];
  savedSearches.push({ name, criteria, notifications });
  await user.update({ saved_searches: savedSearches });

  res.status(201).json({
    success: true,
    message: 'Search saved successfully',
    data: {
      searches: user.saved_searches
    }
  });
}));

// @desc    Update saved search
// @route   PUT /api/users/saved-searches/:searchId
// @access  Private
router.put('/saved-searches/:searchId', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { searchId } = req.params;
  const { name, criteria, notifications } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const savedSearches = user.saved_searches || [];
  const searchIndex = savedSearches.findIndex((_, index) => index.toString() === searchId);
  
  if (searchIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  savedSearches[searchIndex] = { name, criteria, notifications };
  await user.update({ saved_searches: savedSearches });

  res.json({
    success: true,
    message: 'Saved search updated successfully',
    data: {
      searches: user.saved_searches
    }
  });
}));

// @desc    Delete saved search
// @route   DELETE /api/users/saved-searches/:searchId
// @access  Private
router.delete('/saved-searches/:searchId', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { searchId } = req.params;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const savedSearches = user.saved_searches || [];
  const updatedSearches = savedSearches.filter((_, index) => index.toString() !== searchId);
  await user.update({ saved_searches: updatedSearches });

  res.json({
    success: true,
    message: 'Saved search deleted successfully',
    data: {
      searches: updatedSearches
    }
  });
}));

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let dashboardData: any = {};

  if (userRole === 'client') {
    // Client dashboard
    const user = await User.findByPk(userId, {
      attributes: ['saved_properties', 'saved_searches']
    });
    
    const recentSavedPropertyIds = (user?.saved_properties || []).slice(-3);
    const recentSavedProperties = recentSavedPropertyIds.length > 0 
      ? await Property.findAll({
          where: { id: { [Op.in]: recentSavedPropertyIds } },
          attributes: ['id', 'images', 'address', 'property_details', 'seo']
        })
      : [];

    const recommendations = await Property.findAll({
      where: { 'property_details.status': 'active' },
      attributes: ['id', 'images', 'address', 'property_details', 'seo'],
      limit: 3
    });
    
    dashboardData = {
      saved_properties_count: user?.saved_properties.length || 0,
      saved_searches_count: user?.saved_searches.length || 0,
      recent_saved_properties: recentSavedProperties,
      recommendations
    };
  } else if (userRole === 'agent' || userRole === 'admin') {
    // Agent/Admin dashboard
    const whereClause = userRole === 'admin' ? {} : { agent_id: userId };
    
    const propertiesCount = await Property.count({ where: whereClause });
    
    const activeProperties = await Property.count({
      where: { ...whereClause, 'property_details.status': 'active' }
    });

    const soldProperties = await Property.count({
      where: { ...whereClause, 'property_details.status': 'sold' }
    });

    const recentProperties = await Property.findAll({
      where: whereClause,
      attributes: ['id', 'images', 'address', 'property_details', 'seo', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    dashboardData = {
      total_properties: propertiesCount,
      active_properties: activeProperties,
      sold_properties: soldProperties,
      recent_properties: recentProperties
    };
  }

  res.json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: dashboardData
  });
}));

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const {
    role,
    is_active,
    is_verified,
    page = 1,
    limit = 20,
    sort = '-created_at'
  } = req.query;

  const whereClause: any = {};
  
  if (role) whereClause.role = role;
  if (is_active !== undefined) whereClause.is_active = is_active === 'true';
  if (is_verified !== undefined) whereClause.is_verified = is_verified === 'true';

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  // Parse sort parameter
  let order: any = [['created_at', 'DESC']];
  if (sort && typeof sort === 'string') {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? 'DESC' : 'ASC';
    order = [[sortField, sortDirection]];
  }

  const { count: total, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['password', 'saved_properties', 'saved_searches'] },
    order,
    limit: limitNum,
    offset,
    distinct: true
  });

  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Update user status (Admin only)
// @route   PUT /api/users/:userId/status
// @access  Private (Admin only)
router.put('/:userId/status', protect, authorize('admin'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { userId } = req.params;
  const { is_active, is_verified } = req.body;

  const updateFields: any = {};
  if (is_active !== undefined) updateFields.is_active = is_active;
  if (is_verified !== undefined) updateFields.is_verified = is_verified;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.update(updateFields);
  
  // Return user without sensitive fields
  const sanitizedUser = user.toJSON() as any;
  delete sanitizedUser.saved_properties;
  delete sanitizedUser.saved_searches;

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: { user: sanitizedUser }
  });
}));

export { router as userRoutes };