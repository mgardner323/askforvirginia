import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import crypto from 'crypto';

export interface CredentialsAttributes {
  id: number;
  service_name: string;
  service_type: 'api_key' | 'oauth' | 'basic_auth' | 'token' | 'smtp' | 'database' | 'external_service';
  credentials: {
    api_key?: string;
    secret_key?: string;
    username?: string;
    password?: string;
    token?: string;
    refresh_token?: string;
    client_id?: string;
    client_secret?: string;
    host?: string;
    port?: number;
    [key: string]: any;
  };
  description?: string;
  is_active: boolean;
  last_used?: Date;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CredentialsCreationAttributes extends Optional<CredentialsAttributes, 'id' | 'description' | 'is_active' | 'last_used' | 'expires_at' | 'created_at' | 'updated_at'> {}

class Credentials extends Model<CredentialsAttributes, CredentialsCreationAttributes> implements CredentialsAttributes {
  public id!: number;
  public service_name!: string;
  public service_type!: 'api_key' | 'oauth' | 'basic_auth' | 'token' | 'smtp' | 'database' | 'external_service';
  public credentials!: {
    api_key?: string;
    secret_key?: string;
    username?: string;
    password?: string;
    token?: string;
    refresh_token?: string;
    client_id?: string;
    client_secret?: string;
    host?: string;
    port?: number;
    [key: string]: any;
  };
  public description?: string;
  public is_active!: boolean;
  public last_used?: Date;
  public expires_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Encryption key from environment
  private static readonly ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY || 'your-32-character-encryption-key';

  // Encrypt credentials before saving
  public static encryptCredentials(credentials: any): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.ENCRYPTION_KEY);
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt credentials after loading
  public static decryptCredentials(encryptedCredentials: string): any {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.ENCRYPTION_KEY);
      let decrypted = decipher.update(encryptedCredentials, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      return {};
    }
  }

  // Instance method to get decrypted credentials
  public getDecryptedCredentials(): any {
    if (typeof this.credentials === 'string') {
      return Credentials.decryptCredentials(this.credentials);
    }
    return this.credentials;
  }

  // Update last used timestamp
  public async updateLastUsed(): Promise<void> {
    this.last_used = new Date();
    await this.save();
  }
}

Credentials.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    service_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Unique name for the service (e.g., "google_gemini", "smtp_gmail")',
    },
    service_type: {
      type: DataTypes.ENUM('api_key', 'oauth', 'basic_auth', 'token', 'smtp', 'database', 'external_service'),
      allowNull: false,
      comment: 'Type of authentication/credentials',
    },
    credentials: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Encrypted JSON containing the actual credentials',
      set(value: any) {
        // Automatically encrypt when setting
        const encrypted = Credentials.encryptCredentials(value);
        this.setDataValue('credentials', encrypted as any);
      },
      get() {
        // Automatically decrypt when getting
        const encrypted = this.getDataValue('credentials');
        if (typeof encrypted === 'string') {
          return Credentials.decryptCredentials(encrypted);
        }
        return encrypted;
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Human-readable description of what this credential is for',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether these credentials are currently active',
    },
    last_used: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When these credentials were last used',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When these credentials expire (if applicable)',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'credentials',
    tableName: 'credentials',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['service_name'],
        unique: true,
        name: 'idx_credentials_service_name_unique',
      },
      {
        fields: ['service_type'],
        name: 'idx_credentials_service_type',
      },
      {
        fields: ['is_active'],
        name: 'idx_credentials_active',
      },
      {
        fields: ['expires_at'],
        name: 'idx_credentials_expires',
      },
    ],
  }
);

export { Credentials };
export default Credentials;