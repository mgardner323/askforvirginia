/**
 * Credentials Helper Utility
 * Provides a centralized way to retrieve credentials from the database
 * instead of directly accessing environment variables
 */

import { credentialsService } from '../services/CredentialsService';

// Cache for credentials to avoid excessive database queries
const credentialsCache = new Map<string, any>();
const cacheTimeout = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

/**
 * Get a specific credential value by service name and key
 */
export async function getCredentialValue(serviceName: string, key: string): Promise<string | null> {
  try {
    // Check cache first
    const cacheKey = `${serviceName}:${key}`;
    const timestamp = cacheTimestamps.get(cacheKey) || 0;
    
    if (credentialsCache.has(cacheKey) && (Date.now() - timestamp) < cacheTimeout) {
      return credentialsCache.get(cacheKey);
    }

    // Fetch from database
    const value = await credentialsService.getCredentialValue(serviceName, key);
    
    // Cache the result
    credentialsCache.set(cacheKey, value);
    cacheTimestamps.set(cacheKey, Date.now());
    
    return value;
  } catch (error) {
    console.error(`Failed to get credential ${serviceName}:${key}:`, error);
    return null;
  }
}

/**
 * Get all credentials for a service
 */
export async function getServiceCredentials(serviceName: string): Promise<any | null> {
  try {
    // Check cache first
    const timestamp = cacheTimestamps.get(serviceName) || 0;
    
    if (credentialsCache.has(serviceName) && (Date.now() - timestamp) < cacheTimeout) {
      return credentialsCache.get(serviceName);
    }

    // Fetch from database
    const credentials = await credentialsService.getCredentialsByService(serviceName);
    
    if (!credentials) return null;

    // Cache the result
    credentialsCache.set(serviceName, credentials.credentials);
    cacheTimestamps.set(serviceName, Date.now());
    
    return credentials.credentials;
  } catch (error) {
    console.error(`Failed to get service credentials ${serviceName}:`, error);
    return null;
  }
}

/**
 * Get database credentials
 */
export async function getDatabaseCredentials(): Promise<{
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
} | null> {
  try {
    const credentials = await getServiceCredentials('database_primary');
    
    if (!credentials) {
      // Fallback to environment variables if no database credentials in DB yet
      return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME || 'virginia',
        username: process.env.DB_USER || 'virginia',
        password: process.env.DB_PASSWORD || ''
      };
    }

    return {
      host: credentials.host || 'localhost',
      port: credentials.port || 3306,
      database: credentials.database || 'virginia',
      username: credentials.username || 'virginia',
      password: credentials.password || ''
    };
  } catch (error) {
    console.error('Failed to get database credentials:', error);
    return null;
  }
}

/**
 * Get SMTP credentials
 */
export async function getSmtpCredentials(): Promise<{
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
} | null> {
  try {
    const credentials = await getServiceCredentials('smtp_primary');
    
    if (!credentials) {
      // Fallback to environment variables if no SMTP credentials in DB yet
      return {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      };
    }

    return {
      host: credentials.host || 'localhost',
      port: credentials.port || 587,
      secure: credentials.secure || false,
      auth: {
        user: credentials.username || '',
        pass: credentials.password || ''
      }
    };
  } catch (error) {
    console.error('Failed to get SMTP credentials:', error);
    return null;
  }
}

/**
 * Get JWT secret
 */
export async function getJwtSecret(): Promise<string> {
  try {
    const secret = await getCredentialValue('jwt_config', 'secret');
    
    if (!secret) {
      // Fallback to environment variable
      const envSecret = process.env.JWT_SECRET;
      if (!envSecret) {
        throw new Error('JWT secret not found in database or environment');
      }
      return envSecret;
    }

    return secret;
  } catch (error) {
    console.error('Failed to get JWT secret:', error);
    // Final fallback to environment
    const envSecret = process.env.JWT_SECRET;
    if (!envSecret) {
      throw new Error('JWT secret not found in database or environment');
    }
    return envSecret;
  }
}

/**
 * Get reCAPTCHA secret key
 */
export async function getRecaptchaSecret(): Promise<string | null> {
  try {
    const secret = await getCredentialValue('recaptcha', 'secret_key');
    
    if (!secret) {
      // Fallback to environment variable
      return process.env.RECAPTCHA_SECRET_KEY || null;
    }

    return secret;
  } catch (error) {
    console.error('Failed to get reCAPTCHA secret:', error);
    return process.env.RECAPTCHA_SECRET_KEY || null;
  }
}

/**
 * Get Google Maps API key
 */
export async function getGoogleMapsApiKey(): Promise<string | null> {
  try {
    return await getCredentialValue('google_maps', 'api_key');
  } catch (error) {
    console.error('Failed to get Google Maps API key:', error);
    return process.env.GOOGLE_MAPS_API_KEY || null;
  }
}

/**
 * Get Google Gemini API key
 */
export async function getGoogleGeminiApiKey(): Promise<string | null> {
  try {
    return await getCredentialValue('google_gemini', 'api_key');
  } catch (error) {
    console.error('Failed to get Google Gemini API key:', error);
    return process.env.GOOGLE_GEMINI_API_KEY || null;
  }
}

/**
 * Clear credentials cache (useful for testing or when credentials are updated)
 */
export function clearCredentialsCache(): void {
  credentialsCache.clear();
  cacheTimestamps.clear();
}

/**
 * Initialize default credentials from environment variables
 * This should be called during application startup
 */
export async function initializeDefaultCredentials(): Promise<void> {
  try {
    console.log('🔄 Initializing default credentials from environment...');

    // Check if we already have credentials in the database
    const existingCredentials = await credentialsService.getAllCredentials(true);
    
    if (existingCredentials.length > 0) {
      console.log(`✅ Found ${existingCredentials.length} existing credentials in database`);
      return;
    }

    // Import common credentials from environment
    const defaultCredentials = [
      {
        service_name: 'smtp_primary',
        service_type: 'smtp' as const,
        credentials: {
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          username: process.env.SMTP_USER || '',
          password: process.env.SMTP_PASS || ''
        },
        description: 'Primary SMTP email service',
        is_active: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
      },
      {
        service_name: 'jwt_config',
        service_type: 'token' as const,
        credentials: {
          secret: process.env.JWT_SECRET || '',
          refresh_secret: process.env.JWT_REFRESH_SECRET || '',
          expire: process.env.JWT_EXPIRE || '7d',
          refresh_expire: process.env.JWT_REFRESH_EXPIRE || '30d'
        },
        description: 'JWT authentication configuration',
        is_active: !!process.env.JWT_SECRET
      },
      {
        service_name: 'recaptcha',
        service_type: 'api_key' as const,
        credentials: {
          secret_key: process.env.RECAPTCHA_SECRET_KEY || ''
        },
        description: 'Google reCAPTCHA secret key',
        is_active: !!process.env.RECAPTCHA_SECRET_KEY
      }
    ];

    // Only create credentials that have values
    for (const cred of defaultCredentials) {
      if (cred.is_active) {
        try {
          await credentialsService.createCredentials(cred);
          console.log(`✅ Created credential: ${cred.service_name}`);
        } catch (error) {
          console.log(`⚠️  Credential ${cred.service_name} already exists or failed to create`);
        }
      }
    }

    console.log('✅ Default credentials initialization completed');
  } catch (error) {
    console.error('❌ Failed to initialize default credentials:', error);
  }
}