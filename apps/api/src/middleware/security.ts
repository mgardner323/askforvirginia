import express from 'express';
import helmet from 'helmet';

// Enhanced security middleware for production
export const securityMiddleware = () => {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net"
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Needed for Next.js
          "'unsafe-eval'", // Needed for development
          "https://www.google.com/recaptcha/",
          "https://www.gstatic.com/recaptcha/"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "http:", // For development
          "*.googleapis.com",
          "*.gstatic.com"
        ],
        connectSrc: [
          "'self'",
          "https://api.askforvirginia.com",
          "https://dev.askforvirginia.com"
        ],
        frameSrc: [
          "https://www.google.com/recaptcha/"
        ]
      },
    },
    
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    // X-Frame-Options
    frameguard: {
      action: 'sameorigin'
    },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // X-XSS-Protection
    xssFilter: true,
    
    // Referrer Policy
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin"
    },
    
    // Remove X-Powered-By header
    hidePoweredBy: true
  });
};

// Rate limiting for production
export const productionRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More restrictive in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: express.Request) => {
    // Skip rate limiting for admin users (if authenticated)
    return req.path.startsWith('/api/admin') && !!req.headers.authorization;
  }
};

// CORS configuration for production
export const productionCors = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://askforvirginia.com',
      'https://www.askforvirginia.com',
      'https://dev2.askforvirginia.com', // Development
      'http://localhost:3001', // Local development
      'http://localhost:3000'  // Local development
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Request logging for production
export const productionLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    };
    
    // Log errors and slow requests
    if (res.statusCode >= 400 || duration > 1000) {
      console.error('Request:', JSON.stringify(logData));
    } else if (process.env.NODE_ENV === 'development') {
      console.log('Request:', JSON.stringify(logData));
    }
  });
  
  next();
};

// Health check endpoint
export const healthCheck = (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
};

// Request ID middleware for tracking
export const requestId = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requestId = req.get('X-Request-ID') || 
    Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  
  (req as any).requestId = requestId;
  res.set('X-Request-ID', requestId);
  next();
};