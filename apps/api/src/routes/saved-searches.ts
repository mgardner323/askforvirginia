import express from 'express';
import { User, Property } from '../models';
import { Op } from 'sequelize';
import { asyncHandler } from '../middleware/error';
import { protect } from '../middleware/auth';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface SavedSearchCriteria {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  cities?: string[];
  features?: string[];
  square_feet_min?: number;
  square_feet_max?: number;
  year_built_min?: number;
  year_built_max?: number;
}

const router = express.Router();

// @desc    Get all saved searches for user
// @route   GET /api/saved-searches
// @access  Private
router.get('/', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const user = await User.findByPk(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Enrich saved searches with property counts
  const enrichedSearches = await Promise.all(
    user.saved_searches.map(async (search: any) => {
      const matchingCount = await getMatchingPropertiesCount(search.criteria);
      const recentMatches = await getRecentMatches(search.criteria, 7); // Last 7 days
      
      return {
        ...search,
        matching_properties: matchingCount,
        new_matches_this_week: recentMatches
      };
    })
  );

  res.json({
    success: true,
    message: 'Saved searches retrieved successfully',
    data: { saved_searches: enrichedSearches }
  });
}));

// @desc    Create new saved search
// @route   POST /api/saved-searches
// @access  Private
router.post('/', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { name, criteria, notifications = true } = req.body;

  if (!name || !criteria) {
    return res.status(400).json({
      success: false,
      message: 'Search name and criteria are required'
    });
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const newSearch = {
    id: Date.now().toString(),
    name,
    criteria,
    notifications,
    created_at: new Date().toISOString(),
    last_notified: null
  };

  const updatedSearches = [...user.saved_searches, newSearch];

  await user.update({
    saved_searches: updatedSearches
  });

  // Get property count for the new search
  const matchingCount = await getMatchingPropertiesCount(criteria);

  res.status(201).json({
    success: true,
    message: 'Saved search created successfully',
    data: { 
      saved_search: {
        ...newSearch,
        matching_properties: matchingCount
      }
    }
  });
}));

// @desc    Update saved search
// @route   PUT /api/saved-searches/:searchId
// @access  Private
router.put('/:searchId', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { searchId } = req.params;
  const { name, criteria, notifications } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const searchIndex = user.saved_searches.findIndex((search: any) => search.id === searchId);
  if (searchIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  const updatedSearches = [...user.saved_searches];
  updatedSearches[searchIndex] = {
    ...updatedSearches[searchIndex],
    ...(name && { name }),
    ...(criteria && { criteria }),
    ...(notifications !== undefined && { notifications }),
    updated_at: new Date().toISOString()
  };

  await user.update({
    saved_searches: updatedSearches
  });

  res.json({
    success: true,
    message: 'Saved search updated successfully',
    data: { saved_search: updatedSearches[searchIndex] }
  });
}));

// @desc    Delete saved search
// @route   DELETE /api/saved-searches/:searchId
// @access  Private
router.delete('/:searchId', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { searchId } = req.params;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const updatedSearches = user.saved_searches.filter((search: any) => search.id !== searchId);

  if (updatedSearches.length === user.saved_searches.length) {
    return res.status(404).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  await user.update({
    saved_searches: updatedSearches
  });

  res.json({
    success: true,
    message: 'Saved search deleted successfully'
  });
}));

// @desc    Get properties matching saved search
// @route   GET /api/saved-searches/:searchId/properties
// @access  Private
router.get('/:searchId/properties', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { searchId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const savedSearch = user.saved_searches.find((search: any) => search.id === searchId);
  if (!savedSearch) {
    return res.status(404).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  const whereClause = buildPropertyWhereClause(savedSearch.criteria);

  const { count: total, rows: properties } = await Property.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: limitNum,
    offset
  });

  res.json({
    success: true,
    message: 'Properties retrieved successfully',
    data: {
      properties,
      saved_search: savedSearch,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Test saved search criteria
// @route   POST /api/saved-searches/test
// @access  Private
router.post('/test', protect, asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { criteria } = req.body;

  if (!criteria) {
    return res.status(400).json({
      success: false,
      message: 'Search criteria are required'
    });
  }

  const matchingCount = await getMatchingPropertiesCount(criteria);
  const recentMatches = await getRecentMatches(criteria, 7);

  // Get a few sample properties
  const whereClause = buildPropertyWhereClause(criteria);
  const sampleProperties = await Property.findAll({
    where: whereClause,
    limit: 5,
    order: [['created_at', 'DESC']],
    attributes: ['id', 'address', 'property_details', 'seo']
  });

  res.json({
    success: true,
    message: 'Search test completed successfully',
    data: {
      matching_properties: matchingCount,
      new_matches_this_week: recentMatches,
      sample_properties: sampleProperties
    }
  });
}));

// Helper function to count matching properties
async function getMatchingPropertiesCount(criteria: SavedSearchCriteria): Promise<number> {
  const whereClause = buildPropertyWhereClause(criteria);
  return await Property.count({ where: whereClause });
}

// Helper function to get recent matches
async function getRecentMatches(criteria: SavedSearchCriteria, days: number): Promise<number> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  const whereClause = {
    ...buildPropertyWhereClause(criteria),
    created_at: { [Op.gte]: sinceDate }
  };

  return await Property.count({ where: whereClause });
}

// Helper function to build Sequelize where clause from search criteria
function buildPropertyWhereClause(criteria: SavedSearchCriteria): any {
  const whereClause: any = {
    'property_details.status': 'active'
  };

  if (criteria.min_price) {
    whereClause['property_details.price'] = { [Op.gte]: criteria.min_price };
  }

  if (criteria.max_price) {
    if (whereClause['property_details.price']) {
      whereClause['property_details.price'][Op.lte] = criteria.max_price;
    } else {
      whereClause['property_details.price'] = { [Op.lte]: criteria.max_price };
    }
  }

  if (criteria.bedrooms) {
    whereClause['property_details.bedrooms'] = { [Op.gte]: criteria.bedrooms };
  }

  if (criteria.bathrooms) {
    whereClause['property_details.bathrooms'] = { [Op.gte]: criteria.bathrooms };
  }

  if (criteria.property_type) {
    whereClause['property_details.property_type'] = criteria.property_type;
  }

  if (criteria.cities?.length) {
    whereClause['address.city'] = { [Op.in]: criteria.cities };
  }

  if (criteria.square_feet_min) {
    whereClause['property_details.square_feet'] = { [Op.gte]: criteria.square_feet_min };
  }

  if (criteria.square_feet_max) {
    if (whereClause['property_details.square_feet']) {
      whereClause['property_details.square_feet'][Op.lte] = criteria.square_feet_max;
    } else {
      whereClause['property_details.square_feet'] = { [Op.lte]: criteria.square_feet_max };
    }
  }

  if (criteria.year_built_min) {
    whereClause['property_details.year_built'] = { [Op.gte]: criteria.year_built_min };
  }

  if (criteria.year_built_max) {
    if (whereClause['property_details.year_built']) {
      whereClause['property_details.year_built'][Op.lte] = criteria.year_built_max;
    } else {
      whereClause['property_details.year_built'] = { [Op.lte]: criteria.year_built_max };
    }
  }

  if (criteria.features?.length) {
    // Search for properties that have any of the specified features
    whereClause.features = {
      [Op.overlap]: criteria.features
    };
  }

  return whereClause;
}

export { router as savedSearchesRoutes };