import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface HeaderMediaAttributes {
  id: number;
  media_type: 'video' | 'image';
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  duration?: number; // for videos
  dimensions?: {
    width: number;
    height: number;
  };
  is_active: boolean;
  upload_date: Date;
  created_at: Date;
  updated_at: Date;
  publicUrl?: string; // Virtual property for API responses
}

export interface HeaderMediaCreationAttributes extends Optional<HeaderMediaAttributes, 'id' | 'duration' | 'dimensions' | 'is_active' | 'upload_date' | 'created_at' | 'updated_at'> {}

class HeaderMedia extends Model<HeaderMediaAttributes, HeaderMediaCreationAttributes> implements HeaderMediaAttributes {
  public id!: number;
  public media_type!: 'video' | 'image';
  public file_path!: string;
  public original_filename!: string;
  public file_size!: number;
  public mime_type!: string;
  public duration?: number;
  public dimensions?: {
    width: number;
    height: number;
  };
  public is_active!: boolean;
  public upload_date!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Helper method to get public URL
  public getPublicUrl(): string {
    return `/uploads/header/${this.file_path}`;
  }

  // Helper method to get file info
  public getFileInfo() {
    return {
      id: this.id,
      type: this.media_type,
      filename: this.original_filename,
      size: this.file_size,
      url: this.getPublicUrl(),
      isActive: this.is_active,
      uploadDate: this.upload_date,
      duration: this.duration,
      dimensions: this.dimensions
    };
  }
}

HeaderMedia.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    media_type: {
      type: DataTypes.ENUM('video', 'image'),
      allowNull: false,
      comment: 'Type of media file',
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Relative path to the media file',
    },
    original_filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Original filename when uploaded',
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'File size in bytes',
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'MIME type of the file',
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Duration in seconds for video files',
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Width and height dimensions',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this media is currently active on homepage',
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the file was uploaded',
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
    modelName: 'header_media',
    tableName: 'header_media',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['is_active'],
        name: 'idx_header_media_active',
      },
      {
        fields: ['media_type'],
        name: 'idx_header_media_type',
      },
      {
        fields: ['upload_date'],
        name: 'idx_header_media_upload_date',
      },
    ],
  }
);

export { HeaderMedia };
export default HeaderMedia;