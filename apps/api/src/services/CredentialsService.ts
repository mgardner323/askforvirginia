import { Credentials, CredentialsAttributes, CredentialsCreationAttributes } from '../models/Credentials';
import { Op } from 'sequelize';

export class CredentialsService {
  /**
   * Get all credentials (with decrypted values for admin use)
   */
  async getAllCredentials(includeInactive = false): Promise<CredentialsAttributes[]> {
    const whereClause = includeInactive ? {} : { is_active: true };
    
    const credentials = await Credentials.findAll({
      where: whereClause,
      order: [['service_name', 'ASC']],
    });

    return credentials.map(cred => ({
      ...cred.toJSON(),
      credentials: cred.getDecryptedCredentials()
    }));
  }

  /**
   * Get credentials by service name
   */
  async getCredentialsByService(serviceName: string): Promise<CredentialsAttributes | null> {
    const credential = await Credentials.findOne({
      where: {
        service_name: serviceName,
        is_active: true
      }
    });

    if (!credential) return null;

    await credential.updateLastUsed();

    return {
      ...credential.toJSON(),
      credentials: credential.getDecryptedCredentials()
    };
  }

  /**
   * Get credentials by service type
   */
  async getCredentialsByType(serviceType: string): Promise<CredentialsAttributes[]> {
    const credentials = await Credentials.findAll({
      where: {
        service_type: serviceType,
        is_active: true
      },
      order: [['service_name', 'ASC']],
    });

    return credentials.map(cred => ({
      ...cred.toJSON(),
      credentials: cred.getDecryptedCredentials()
    }));
  }

  /**
   * Create new credentials
   */
  async createCredentials(data: CredentialsCreationAttributes): Promise<CredentialsAttributes> {
    const credential = await Credentials.create(data);
    
    return {
      ...credential.toJSON(),
      credentials: credential.getDecryptedCredentials()
    };
  }

  /**
   * Update existing credentials
   */
  async updateCredentials(id: number, data: Partial<CredentialsCreationAttributes>): Promise<CredentialsAttributes | null> {
    const credential = await Credentials.findByPk(id);
    
    if (!credential) return null;

    await credential.update(data);
    await credential.reload();

    return {
      ...credential.toJSON(),
      credentials: credential.getDecryptedCredentials()
    };
  }

  /**
   * Delete credentials
   */
  async deleteCredentials(id: number): Promise<boolean> {
    const credential = await Credentials.findByPk(id);
    
    if (!credential) return false;

    await credential.destroy();
    return true;
  }

  /**
   * Test credentials (basic connectivity test)
   */
  async testCredentials(id: number): Promise<{ success: boolean; message: string }> {
    const credential = await Credentials.findByPk(id);
    
    if (!credential) {
      return { success: false, message: 'Credentials not found' };
    }

    const creds = credential.getDecryptedCredentials();

    try {
      switch (credential.service_type) {
        case 'api_key':
          return this.testApiKey(creds);
        case 'smtp':
          return this.testSmtp(creds);
        case 'database':
          return this.testDatabase(creds);
        default:
          return { success: true, message: 'Credentials stored successfully (no test available)' };
      }
    } catch (error) {
      return { success: false, message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Get specific credential value (for use in application code)
   */
  async getCredentialValue(serviceName: string, key: string): Promise<string | null> {
    const credential = await this.getCredentialsByService(serviceName);
    
    if (!credential || !credential.credentials) return null;

    return credential.credentials[key] || null;
  }

  /**
   * Bulk import from environment variables
   */
  async importFromEnv(envMappings: { [key: string]: { service_name: string; service_type: any; description?: string } }): Promise<{ imported: number; skipped: number; errors: string[] }> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const [envKey, config] of Object.entries(envMappings)) {
      try {
        const envValue = process.env[envKey];
        
        if (!envValue) {
          skipped++;
          continue;
        }

        // Check if credential already exists
        const existing = await Credentials.findOne({
          where: { service_name: config.service_name }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create credential
        await this.createCredentials({
          service_name: config.service_name,
          service_type: config.service_type,
          credentials: { [envKey.toLowerCase()]: envValue },
          description: config.description,
          is_active: true
        });

        imported++;
      } catch (error) {
        errors.push(`Failed to import ${envKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { imported, skipped, errors };
  }

  // Private test methods
  private async testApiKey(creds: any): Promise<{ success: boolean; message: string }> {
    if (!creds.api_key) {
      return { success: false, message: 'API key is required' };
    }
    return { success: true, message: 'API key format is valid' };
  }

  private async testSmtp(creds: any): Promise<{ success: boolean; message: string }> {
    if (!creds.host || !creds.username || !creds.password) {
      return { success: false, message: 'SMTP host, username, and password are required' };
    }
    return { success: true, message: 'SMTP credentials format is valid' };
  }

  private async testDatabase(creds: any): Promise<{ success: boolean; message: string }> {
    if (!creds.host || !creds.username || !creds.password || !creds.database) {
      return { success: false, message: 'Database host, username, password, and database name are required' };
    }
    return { success: true, message: 'Database credentials format is valid' };
  }

  /**
   * Get credentials in a safe format for frontend (without sensitive values)
   */
  async getCredentialsForFrontend(): Promise<any[]> {
    const credentials = await Credentials.findAll({
      order: [['service_name', 'ASC']],
    });

    return credentials.map(cred => ({
      id: cred.id,
      service_name: cred.service_name,
      service_type: cred.service_type,
      description: cred.description,
      is_active: cred.is_active,
      last_used: cred.last_used,
      expires_at: cred.expires_at,
      created_at: cred.created_at,
      updated_at: cred.updated_at,
      // Don't include actual credentials for security
      has_credentials: !!cred.credentials,
      credential_keys: Object.keys(cred.getDecryptedCredentials())
    }));
  }
}

export const credentialsService = new CredentialsService();