import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SettingsAttributes {
  id: number;
  category: 'database' | 'smtp' | 'system' | 'api' | 'storage' | 'credentials';
  key: string;
  value: string;
  description?: string;
  is_encrypted: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SettingsCreationAttributes extends Optional<SettingsAttributes, 'id' | 'description' | 'is_active' | 'created_at' | 'updated_at'> {}

class Settings extends Model<SettingsAttributes, SettingsCreationAttributes> implements SettingsAttributes {
  public id!: number;
  public category!: 'database' | 'smtp' | 'system' | 'api' | 'storage' | 'credentials';
  public key!: string;
  public value!: string;
  public description?: string;
  public is_encrypted!: boolean;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Settings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category: {
      type: DataTypes.ENUM('database', 'smtp', 'system', 'api', 'storage', 'credentials'),
      allowNull: false,
      comment: 'Category of the setting for organization',
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Unique key identifier for the setting',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Setting value (encrypted if sensitive)',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Human-readable description of the setting',
    },
    is_encrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the value is encrypted (for passwords, keys, etc.)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the setting is currently active',
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
    modelName: 'settings',
    tableName: 'settings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['category'],
        name: 'idx_settings_category',
      },
      {
        fields: ['key'],
        unique: true,
        name: 'idx_settings_key_unique',
      },
      {
        fields: ['is_active'],
        name: 'idx_settings_active',
      },
    ],
  }
);

export { Settings };
export default Settings;