import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BlogMediaAttributes {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  uploaded_by: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BlogMediaCreationAttributes extends Optional<BlogMediaAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class BlogMedia extends Model<BlogMediaAttributes, BlogMediaCreationAttributes> implements BlogMediaAttributes {
  public id!: number;
  public filename!: string;
  public original_name!: string;
  public file_path!: string;
  public file_size!: number;
  public mime_type!: string;
  public width?: number;
  public height?: number;
  public alt_text?: string;
  public caption?: string;
  public uploaded_by!: number;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Instance methods
  public getPublicUrl(): string {
    // Return the public URL for the media file
    return `/uploads/blog/${this.filename}`;
  }

  public isImage(): boolean {
    return this.mime_type.startsWith('image/');
  }

  public getDisplaySize(): string {
    if (this.width && this.height) {
      return `${this.width} × ${this.height}`;
    }
    return 'Unknown';
  }

  public getFormattedFileSize(): string {
    const bytes = this.file_size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

BlogMedia.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Generated filename for storage'
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Original filename uploaded by user'
    },
    file_path: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Full file system path to the media file'
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'File size in bytes'
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'MIME type of the file'
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Image width in pixels (for images only)'
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Image height in pixels (for images only)'
    },
    alt_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Alternative text for accessibility'
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional caption for the media'
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User ID who uploaded the media',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the media is active and accessible'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'blog_media',
    modelName: 'BlogMedia',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['uploaded_by']
      },
      {
        fields: ['mime_type']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['created_at']
      },
      {
        unique: true,
        fields: ['filename']
      }
    ]
  }
);

export default BlogMedia;