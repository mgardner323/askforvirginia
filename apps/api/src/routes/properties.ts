import express from 'express';
import { Op } from 'sequelize';
import { Property, User } from '../models';
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

interface PropertySearchFilters {
  type?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_sqft?: number;
  max_sqft?: number;
  city?: string;
  zip_code?: string;
  property_type?: string;
  is_featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

const router = express.Router();

// @desc    Get all properties with filtering and pagination
// @route   GET /api/properties
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const {
    type,
    status = 'active',
    min_price,
    max_price,
    bedrooms,
    bathrooms,
    min_sqft,
    max_sqft,
    city,
    zip_code,
    property_type,
    is_featured,
    page = 1,
    limit = 12,
    sort = '-created_at'
  } = req.query as PropertySearchFilters & { [key: string]: any };

  // Build where conditions for JSON fields
  const whereConditions: any = {};

  // Status filter using JSON path
  whereConditions[Op.and] = [];
  whereConditions[Op.and].push({
    property_details: {
      status: status
    }
  });

  if (type) {
    whereConditions[Op.and].push({
      property_details: {
        type: type
      }
    });
  }

  if (property_type) {
    whereConditions[Op.and].push({
      property_details: {
        property_type: property_type
      }
    });
  }

  if (city) {
    whereConditions[Op.and].push({
      address: {
        city: {
          [Op.iLike]: `%${city}%`
        }
      }
    });
  }

  if (zip_code) {
    whereConditions[Op.and].push({
      address: {
        zip_code: zip_code
      }
    });
  }

  if (is_featured !== undefined) {
    whereConditions.is_featured = String(is_featured) === 'true';
  }

  // Price range
  if (min_price || max_price) {
    const priceCondition: any = {};
    if (min_price) priceCondition[Op.gte] = Number(min_price);
    if (max_price) priceCondition[Op.lte] = Number(max_price);
    
    whereConditions[Op.and].push({
      property_details: {
        price: priceCondition
      }
    });
  }

  // Bedrooms and bathrooms
  if (bedrooms) {
    whereConditions[Op.and].push({
      property_details: {
        bedrooms: {
          [Op.gte]: Number(bedrooms)
        }
      }
    });
  }

  if (bathrooms) {
    whereConditions[Op.and].push({
      property_details: {
        bathrooms: {
          [Op.gte]: Number(bathrooms)
        }
      }
    });
  }

  // Square footage
  if (min_sqft || max_sqft) {
    const sqftCondition: any = {};
    if (min_sqft) sqftCondition[Op.gte] = Number(min_sqft);
    if (max_sqft) sqftCondition[Op.lte] = Number(max_sqft);
    
    whereConditions[Op.and].push({
      property_details: {
        square_feet: sqftCondition
      }
    });
  }

  // Pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const offset = (pageNum - 1) * limitNum;

  // Sort handling
  let order: any = [['created_at', 'DESC']];
  if (sort) {
    if (sort === '-created_at') order = [['created_at', 'DESC']];
    else if (sort === 'created_at') order = [['created_at', 'ASC']];
    else if (sort === '-price') order = [['property_details.price', 'DESC']];
    else if (sort === 'price') order = [['property_details.price', 'ASC']];
  }

  // Execute query with includes
  const { rows: properties, count: total } = await Property.findAndCountAll({
    where: whereConditions,
    include: [{
      model: User,
      as: 'agent',
      attributes: ['id', 'email', 'profile']
    }],
    order,
    offset,
    limit: limitNum
  });

  res.json({
    success: true,
    message: 'Properties retrieved successfully',
    data: {
      properties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// @desc    Get single property by ID or slug
// @route   GET /api/properties/:identifier
// @access  Public
router.get('/:identifier', optionalAuth, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { identifier } = req.params;
  
  // Check if identifier is numeric ID or slug
  const isNumericId = /^\d+$/.test(identifier);
  const whereCondition = isNumericId 
    ? { id: parseInt(identifier) }
    : { seo: { slug: identifier } };

  const property = await Property.findOne({
    where: whereCondition,
    include: [{
      model: User,
      as: 'agent',
      attributes: ['id', 'email', 'profile']
    }]
  });

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Get similar properties (same city, similar price range)
  const priceRange = property.property_details.price * 0.2; // 20% price range
  const similarProperties = await Property.findAll({
    where: {
      id: {
        [Op.ne]: property.id
      },
      address: {
        city: property.address.city
      },
      property_details: {
        price: {
          [Op.between]: [
            property.property_details.price - priceRange,
            property.property_details.price + priceRange
          ]
        },
        status: 'active'
      }
    },
    attributes: ['id', 'images', 'seo', 'property_details', 'address'],
    limit: 4
  });

  res.json({
    success: true,
    message: 'Property retrieved successfully',
    data: {
      property,
      similar_properties: similarProperties
    }
  });
}));

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Admin/Agent only)
router.post('/', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  // Set agent_id to current user if not provided
  if (!req.body.agent_id) {
    req.body.agent_id = req.user.id;
  }

  const property = await Property.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: { property }
  });
}));

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Admin/Agent only - own properties)
router.put('/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  let property = await Property.findByPk(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if user owns property or is admin
  if (property.agent_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this property'
    });
  }

  await property.update(req.body);

  res.json({
    success: true,
    message: 'Property updated successfully',
    data: { property }
  });
}));

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Admin/Agent only - own properties)
router.delete('/:id', protect, authorize('admin', 'agent'), asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const property = await Property.findByPk(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check if user owns property or is admin
  if (property.agent_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this property'
    });
  }

  await property.destroy();

  res.json({
    success: true,
    message: 'Property deleted successfully'
  });
}));

// @desc    Get featured properties
// @route   GET /api/properties/featured/list
// @access  Public
router.get('/featured/list', asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { limit = 6 } = req.query;

  const properties = await Property.findAll({
    where: {
      is_featured: true,
      property_details: {
        status: 'active'
      }
    },
    include: [{
      model: User,
      as: 'agent',
      attributes: ['id', 'profile']
    }],
    order: [['created_at', 'DESC']],
    limit: Number(limit)
  });

  res.json({
    success: true,
    message: 'Featured properties retrieved successfully',
    data: { properties }
  });
}));

// @desc    Search properties by location/address
// @route   GET /api/properties/search/location
// @access  Public
router.get('/search/location', asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { query, limit = 10 } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const searchTerm = `%${query}%`;
  
  const properties = await Property.findAll({
    where: {
      [Op.and]: [
        {
          [Op.or]: [
            { address: { street: { [Op.iLike]: searchTerm } } },
            { address: { city: { [Op.iLike]: searchTerm } } },
            { address: { zip_code: { [Op.iLike]: searchTerm } } },
            { neighborhood: { name: { [Op.iLike]: searchTerm } } }
          ]
        },
        {
          property_details: {
            status: 'active'
          }
        }
      ]
    },
    attributes: ['id', 'address', 'images', 'property_details', 'seo'],
    limit: Number(limit)
  });

  res.json({
    success: true,
    message: 'Location search completed',
    data: { properties }
  });
}));

export { router as propertyRoutes };