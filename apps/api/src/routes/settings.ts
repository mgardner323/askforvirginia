import { Router, Response } from 'express';
import { Settings } from '../models';
import { protect, AuthenticatedRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// Encryption key for sensitive settings (in production, use proper key management)
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Encrypt sensitive values
const encryptValue = (value: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Decrypt sensitive values
const decryptValue = (encryptedValue: string): string => {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedValue; // Return as-is if decryption fails
  }
};

// Middleware to ensure admin access
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/settings - Get all settings (admin only)
router.get('/', protect, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category } = req.query;
    
    const where: any = { is_active: true };
    if (category) {
      where.category = category;
    }

    const settings = await Settings.findAll({
      where,
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    // Decrypt sensitive values for display (but mask them)
    const settingsWithDecryptedValues = settings.map(setting => {
      const settingData = setting.toJSON();
      
      if (setting.is_encrypted) {
        // For security, only show first few characters of encrypted values
        const decryptedValue = decryptValue(setting.value);
        settingData.value = decryptedValue.substring(0, 3) + '***';
      }
      
      return settingData;
    });

    res.json({
      success: true,
      data: settingsWithDecryptedValues
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      error: 'Failed to fetch settings',
      details: error.message
    });
  }
});

// GET /api/settings/categories - Get all available categories
router.get('/categories', protect, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = [
      { key: 'database', label: 'Database Configuration', icon: 'database' },
      { key: 'smtp', label: 'Email/SMTP Settings', icon: 'envelope' },
      { key: 'system', label: 'System Settings', icon: 'cog' },
      { key: 'api', label: 'API Configuration', icon: 'cloud' },
      { key: 'storage', label: 'Storage Settings', icon: 'folder' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
});

// POST /api/settings - Create or update a setting
router.post('/', 
  protect, 
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Basic validation
      const { category, key, value, description, is_encrypted = false } = req.body;
      
      if (!category || !['database', 'smtp', 'system', 'api', 'storage'].includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      
      if (!key || key.trim().length === 0 || key.trim().length > 100) {
        return res.status(400).json({ error: 'Key must be 1-100 characters' });
      }
      
      if (!value || value.trim().length === 0) {
        return res.status(400).json({ error: 'Value is required' });
      }

      // Encrypt value if needed
      const finalValue = is_encrypted ? encryptValue(value) : value;

      // Create or update setting
      const [setting, created] = await Settings.upsert({
        category: category as 'database' | 'smtp' | 'system' | 'api' | 'storage',
        key,
        value: finalValue,
        description,
        is_encrypted,
        is_active: true
      });

      res.json({
        success: true,
        data: {
          id: setting.id,
          category: setting.category,
          key: setting.key,
          description: setting.description,
          is_encrypted: setting.is_encrypted,
          is_active: setting.is_active,
          created: created
        },
        message: created ? 'Setting created successfully' : 'Setting updated successfully'
      });
    } catch (error: any) {
      console.error('Error saving setting:', error);
      res.status(500).json({
        error: 'Failed to save setting',
        details: error.message
      });
    }
  }
);

// PUT /api/settings/:id - Update a specific setting
router.put('/:id',
  protect,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Basic validation
      const { value, description, is_active } = req.body;
      
      if (!value || value.trim().length === 0) {
        return res.status(400).json({ error: 'Value is required' });
      }
      
      if (isNaN(parseInt(req.params.id))) {
        return res.status(400).json({ error: 'Invalid setting ID' });
      }

      const { id } = req.params;

      const setting = await Settings.findByPk(id);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      // Encrypt value if this setting requires encryption
      const finalValue = setting.is_encrypted ? encryptValue(value) : value;

      await setting.update({
        value: finalValue,
        description: description !== undefined ? description : setting.description,
        is_active: is_active !== undefined ? is_active : setting.is_active
      });

      res.json({
        success: true,
        data: {
          id: setting.id,
          category: setting.category,
          key: setting.key,
          description: setting.description,
          is_encrypted: setting.is_encrypted,
          is_active: setting.is_active
        },
        message: 'Setting updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating setting:', error);
      res.status(500).json({
        error: 'Failed to update setting',
        details: error.message
      });
    }
  }
);

// DELETE /api/settings/:id - Delete a setting
router.delete('/:id',
  protect,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Basic validation
      if (isNaN(parseInt(req.params.id))) {
        return res.status(400).json({ error: 'Invalid setting ID' });
      }

      const { id } = req.params;
      const setting = await Settings.findByPk(id);
      
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      await setting.destroy();

      res.json({
        success: true,
        message: 'Setting deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting setting:', error);
      res.status(500).json({
        error: 'Failed to delete setting',
        details: error.message
      });
    }
  }
);

// POST /api/settings/migrate-env - Migrate current .env settings to database
router.post('/migrate-env', protect, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const envSettings = [
      // Database settings
      { category: 'database', key: 'DB_HOST', value: process.env.DB_HOST || 'localhost', description: 'Database host address', is_encrypted: false },
      { category: 'database', key: 'DB_PORT', value: process.env.DB_PORT || '3306', description: 'Database port number', is_encrypted: false },
      { category: 'database', key: 'DB_NAME', value: process.env.DB_NAME || 'virginia', description: 'Database name', is_encrypted: false },
      { category: 'database', key: 'DB_USER', value: process.env.DB_USER || 'virginia', description: 'Database username', is_encrypted: false },
      { category: 'database', key: 'DB_PASSWORD', value: process.env.DB_PASSWORD || '', description: 'Database password', is_encrypted: true },
      { category: 'database', key: 'REDIS_URL', value: process.env.REDIS_URL || 'redis://localhost:6379', description: 'Redis connection URL', is_encrypted: false },
      
      // SMTP settings
      { category: 'smtp', key: 'SMTP_HOST', value: process.env.SMTP_HOST || 'smtp.gmail.com', description: 'SMTP server host', is_encrypted: false },
      { category: 'smtp', key: 'SMTP_PORT', value: process.env.SMTP_PORT || '587', description: 'SMTP server port', is_encrypted: false },
      { category: 'smtp', key: 'SMTP_SECURE', value: process.env.SMTP_SECURE || 'false', description: 'Use SSL/TLS for SMTP', is_encrypted: false },
      { category: 'smtp', key: 'SMTP_USER', value: process.env.SMTP_USER || '', description: 'SMTP username', is_encrypted: false },
      { category: 'smtp', key: 'SMTP_PASS', value: process.env.SMTP_PASS || '', description: 'SMTP password', is_encrypted: true },
      { category: 'smtp', key: 'FROM_EMAIL', value: process.env.FROM_EMAIL || '', description: 'Default sender email address', is_encrypted: false },
      { category: 'smtp', key: 'FROM_NAME', value: process.env.FROM_NAME || '', description: 'Default sender name', is_encrypted: false },
      { category: 'smtp', key: 'CONTACT_EMAIL', value: process.env.CONTACT_EMAIL || '', description: 'Contact form recipient email', is_encrypted: false }
    ];

    let created = 0;
    let updated = 0;

    for (const settingData of envSettings) {
      if (settingData.value) { // Only migrate if value exists
        const finalValue = settingData.is_encrypted ? encryptValue(settingData.value) : settingData.value;
        
        const [setting, wasCreated] = await Settings.upsert({
          category: settingData.category as 'database' | 'smtp' | 'system' | 'api' | 'storage',
          key: settingData.key,
          value: finalValue,
          description: settingData.description,
          is_encrypted: settingData.is_encrypted,
          is_active: true
        });

        if (wasCreated) created++;
        else updated++;
      }
    }

    res.json({
      success: true,
      message: `Migration completed: ${created} settings created, ${updated} settings updated`,
      data: { created, updated }
    });
  } catch (error: any) {
    console.error('Error migrating env settings:', error);
    res.status(500).json({
      error: 'Failed to migrate settings',
      details: error.message
    });
  }
});

// Utility function to get decrypted setting value (for internal use)
export const getSettingValue = async (key: string): Promise<string | null> => {
  try {
    const setting = await Settings.findOne({
      where: { key, is_active: true }
    });
    
    if (!setting) return null;
    
    return setting.is_encrypted ? decryptValue(setting.value) : setting.value;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
};

export default router;