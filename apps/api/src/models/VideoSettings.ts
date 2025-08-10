import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface VideoSettingsAttributes {
  id: number;
  location: string; // 'homepage_header', 'about_page', etc.
  video_url: string;
  poster_image_url?: string;
  alt_text?: string;
  is_active: boolean;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface VideoSettingsCreationAttributes extends Optional<VideoSettingsAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class VideoSettings extends Model<VideoSettingsAttributes, VideoSettingsCreationAttributes> implements VideoSettingsAttributes {
  public id!: number;
  public location!: string;
  public video_url!: string;
  public poster_image_url?: string;
  public alt_text?: string;
  public is_active!: boolean;
  public autoplay!: boolean;
  public muted!: boolean;
  public loop!: boolean;
  public controls!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

VideoSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Location identifier (e.g., homepage_header)'
    },
    video_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'URL or path to the video file'
    },
    poster_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL or path to the poster image'
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Alternative text for accessibility'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this video setting is active'
    },
    autoplay: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Should the video autoplay'
    },
    muted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Should the video be muted by default'
    },
    loop: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Should the video loop'
    },
    controls: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Should video controls be shown'
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
    tableName: 'video_settings',
    modelName: 'VideoSettings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['location']
      },
      {
        fields: ['is_active']
      }
    ]
  }
);

export default VideoSettings;