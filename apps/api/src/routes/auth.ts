import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { asyncHandler } from '../middleware/error';
import { protect } from '../middleware/auth';
import { getJwtSecret } from '../utils/credentialsHelper';

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

// Generate JWT token
const generateToken = async (id: number): Promise<string> => {
  const secret = await getJwtSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in credentials');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '7d' // Default expiration, can be made configurable later
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { email, password, first_name, last_name, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    email,
    password,
    profile: {
      first_name,
      last_name,
      phone,
      specializations: [],
      areas_served: []
    },
    preferences: {
      property_types: [],
      price_range: {},
      locations: []
    },
    saved_properties: [],
    saved_searches: [],
    role: role || 'client',
    is_verified: false,
    is_active: true
  });

  const token = await generateToken(user.id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        is_verified: user.is_verified
      }
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check for user and include password
  const user = await User.findOne({ 
    where: { email },
    attributes: { include: ['password'] }
  });
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  await user.updateLastLogin();

  const token = await generateToken(user.id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        is_verified: user.is_verified,
        last_login: user.last_login
      }
    }
  });
}));

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const user = req.user;

  res.json({
    success: true,
    message: 'User profile retrieved',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        saved_properties: user.saved_properties,
        saved_searches: user.saved_searches,
        is_verified: user.is_verified,
        last_login: user.last_login,
        created_at: user.created_at
      }
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const updateData: any = {};
  
  if (req.body.first_name || req.body.last_name || req.body.phone || req.body.bio) {
    updateData.profile = {
      ...req.user.profile,
      ...(req.body.first_name && { first_name: req.body.first_name }),
      ...(req.body.last_name && { last_name: req.body.last_name }),
      ...(req.body.phone && { phone: req.body.phone }),
      ...(req.body.bio && { bio: req.body.bio })
    };
  }
  
  if (req.body.preferences) {
    updateData.preferences = req.body.preferences;
  }

  await User.update(updateData, { where: { id: req.user.id } });
  const user = await User.findByPk(req.user.id);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password'
    });
  }

  const user = await User.findOne({ 
    where: { id: req.user.id },
    attributes: { include: ['password'] }
  });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}));

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', protect, asyncHandler(async (req: any, res: express.Response<ApiResponse>) => {
  try {
    // User is already attached by the protect middleware
    const user = req.user;
    
    res.json({
      success: true,
      message: 'Token verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Token verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export { router as authRoutes };