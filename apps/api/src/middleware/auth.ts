import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { asyncHandler } from './error';
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

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
  let token: string | undefined;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Get JWT secret from database
    const jwtSecret = await getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'JWT secret not configured'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { id: number };
    
    // Get user from token
    const user = await User.findOne({ 
      where: { id: decoded.id },
      attributes: { include: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token invalid - user not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid'
    });
  }
});

// Authorize specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized.`
      });
    }

    next();
  };
};

// Optional auth - sets user if token is valid but doesn't require it
export const optionalAuth = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const jwtSecret = await getJwtSecret();
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret) as { id: number };
        const user = await User.findByPk(decoded.id);
        
        if (user && user.is_active) {
          req.user = user;
        }
      }
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  next();
});