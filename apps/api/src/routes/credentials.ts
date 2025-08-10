import express from 'express';
import { credentialsService } from '../services/CredentialsService';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Apply authentication and admin role requirement to all routes
router.use(protect);
router.use(authorize('admin', 'agent'));

/**
 * GET /api/credentials
 * Get all credentials (safe format for frontend)
 */
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const credentials = await credentialsService.getCredentialsForFrontend();
    
    res.json({
      success: true,
      data: credentials,
      count: credentials.length
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credentials',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/credentials/types
 * Get available credential types
 */
router.get('/types', async (req, res) => {
  try {
    const types = [
      { value: 'api_key', label: 'API Key', description: 'Simple API key authentication' },
      { value: 'oauth', label: 'OAuth', description: 'OAuth 2.0 authentication' },
      { value: 'basic_auth', label: 'Basic Auth', description: 'Username/password authentication' },
      { value: 'token', label: 'Token', description: 'Bearer token authentication' },
      { value: 'smtp', label: 'SMTP', description: 'Email server credentials' },
      { value: 'database', label: 'Database', description: 'Database connection credentials' },
      { value: 'external_service', label: 'External Service', description: 'Third-party service credentials' }
    ];

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error fetching credential types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credential types',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/credentials/:id
 * Get specific credentials by ID (with decrypted values)
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credential ID'
      });
    }

    const credentials = await credentialsService.getAllCredentials(true);
    const credential = credentials.find(c => c.id === id);

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credentials not found'
      });
    }

    res.json({
      success: true,
      data: credential
    });
  } catch (error) {
    console.error('Error fetching credential:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credential',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/credentials
 * Create new credentials
 */
router.post('/', async (req, res) => {
  try {
    const { service_name, service_type, credentials, description, is_active } = req.body;

    // Validation
    if (!service_name || !service_type || !credentials) {
      return res.status(400).json({
        success: false,
        message: 'Service name, service type, and credentials are required'
      });
    }

    const newCredential = await credentialsService.createCredentials({
      service_name,
      service_type,
      credentials,
      description,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({
      success: true,
      message: 'Credentials created successfully',
      data: newCredential
    });
  } catch (error) {
    console.error('Error creating credentials:', error);
    
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Service name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create credentials',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/credentials/:id
 * Update existing credentials
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credential ID'
      });
    }

    const updatedCredential = await credentialsService.updateCredentials(id, req.body);

    if (!updatedCredential) {
      return res.status(404).json({
        success: false,
        message: 'Credentials not found'
      });
    }

    res.json({
      success: true,
      message: 'Credentials updated successfully',
      data: updatedCredential
    });
  } catch (error) {
    console.error('Error updating credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update credentials',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/credentials/:id
 * Delete credentials
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credential ID'
      });
    }

    const deleted = await credentialsService.deleteCredentials(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Credentials not found'
      });
    }

    res.json({
      success: true,
      message: 'Credentials deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete credentials',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/credentials/:id/test
 * Test credentials connectivity
 */
router.post('/:id/test', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credential ID'
      });
    }

    const result = await credentialsService.testCredentials(id);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error testing credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test credentials',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/credentials/import-env
 * Import credentials from environment variables
 */
router.post('/import-env', async (req, res) => {
  try {
    const envMappings = {
      'GOOGLE_GEMINI_API_KEY': {
        service_name: 'google_gemini',
        service_type: 'api_key',
        description: 'Google Gemini AI API key for content generation'
      },
      'OPENAI_API_KEY': {
        service_name: 'openai',
        service_type: 'api_key',
        description: 'OpenAI API key for AI services'
      },
      'SMTP_USER': {
        service_name: 'smtp_primary',
        service_type: 'smtp',
        description: 'Primary SMTP email service'
      },
      'FACEBOOK_APP_ID': {
        service_name: 'facebook_app',
        service_type: 'oauth',
        description: 'Facebook App credentials'
      },
      'TWITTER_API_KEY': {
        service_name: 'twitter_api',
        service_type: 'api_key',
        description: 'Twitter API credentials'
      },
      'GOOGLE_MAPS_API_KEY': {
        service_name: 'google_maps',
        service_type: 'api_key',
        description: 'Google Maps API key'
      },
      'RECAPTCHA_SECRET_KEY': {
        service_name: 'recaptcha',
        service_type: 'api_key',
        description: 'Google reCAPTCHA secret key'
      }
    };

    const result = await credentialsService.importFromEnv(envMappings);

    res.json({
      success: true,
      message: `Import completed: ${result.imported} imported, ${result.skipped} skipped`,
      data: result
    });
  } catch (error) {
    console.error('Error importing from env:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import credentials from environment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;