import { HeaderMedia, HeaderMediaAttributes, HeaderMediaCreationAttributes } from '../models/HeaderMedia';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class HeaderMediaService {
  private uploadDir = path.join(process.cwd(), 'public', 'uploads', 'header');

  constructor() {
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
        console.log(`✅ Created header media upload directory: ${this.uploadDir}`);
      }
    } catch (error) {
      console.error('❌ Failed to create upload directory:', error);
    }
  }

  /**
   * Get all header media files
   */
  async getAllMedia(includeInactive = false): Promise<HeaderMediaAttributes[]> {
    const whereClause = includeInactive ? {} : { is_active: true };
    
    const media = await HeaderMedia.findAll({
      where: whereClause,
      order: [['upload_date', 'DESC']],
    });

    return media.map(item => ({
      ...item.toJSON(),
      publicUrl: item.getPublicUrl()
    }));
  }

  /**
   * Get currently active header media
   */
  async getActiveMedia(): Promise<HeaderMediaAttributes | null> {
    const media = await HeaderMedia.findOne({
      where: { is_active: true },
      order: [['upload_date', 'DESC']]
    });

    return media ? {
      ...media.toJSON(),
      publicUrl: media.getPublicUrl()
    } : null;
  }

  /**
   * Set a media file as active (deactivate others)
   */
  async setActiveMedia(id: number): Promise<HeaderMediaAttributes | null> {
    const media = await HeaderMedia.findByPk(id);
    
    if (!media) return null;

    // Deactivate all other media
    await HeaderMedia.update(
      { is_active: false },
      { where: { is_active: true } }
    );

    // Activate the selected media
    await media.update({ is_active: true });

    return {
      ...media.toJSON(),
      publicUrl: media.getPublicUrl()
    };
  }

  /**
   * Upload and save new media file
   */
  async uploadMedia(file: Express.Multer.File): Promise<HeaderMediaAttributes> {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    try {
      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Determine media type
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

      // Get file dimensions (basic implementation)
      let dimensions = undefined;
      if (mediaType === 'image') {
        // For images, you might want to use a library like sharp to get dimensions
        // For now, we'll leave it undefined
      }

      // Create database record
      const mediaRecord = await HeaderMedia.create({
        media_type: mediaType,
        file_path: uniqueFilename,
        original_filename: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        dimensions,
        is_active: false, // Don't auto-activate, let admin choose
        upload_date: new Date()
      });

      return {
        ...mediaRecord.toJSON(),
        publicUrl: mediaRecord.getPublicUrl()
      };
    } catch (error) {
      // Clean up file if database save fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error(`Failed to save media file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete media file and record
   */
  async deleteMedia(id: number): Promise<boolean> {
    const media = await HeaderMedia.findByPk(id);
    
    if (!media) return false;

    try {
      // Delete file from disk
      const filePath = path.join(this.uploadDir, media.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete database record
      await media.destroy();

      return true;
    } catch (error) {
      console.error('Failed to delete media:', error);
      return false;
    }
  }

  /**
   * Get media file info by ID
   */
  async getMediaById(id: number): Promise<HeaderMediaAttributes | null> {
    const media = await HeaderMedia.findByPk(id);
    
    return media ? {
      ...media.toJSON(),
      publicUrl: media.getPublicUrl()
    } : null;
  }

  /**
   * Update media metadata
   */
  async updateMediaMetadata(id: number, updates: Partial<HeaderMediaCreationAttributes>): Promise<HeaderMediaAttributes | null> {
    const media = await HeaderMedia.findByPk(id);
    
    if (!media) return null;

    await media.update(updates);
    await media.reload();

    return {
      ...media.toJSON(),
      publicUrl: media.getPublicUrl()
    };
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    activeMedia: number;
    videoFiles: number;
    imageFiles: number;
  }> {
    const allMedia = await HeaderMedia.findAll({
      attributes: ['media_type', 'file_size', 'is_active']
    });

    const stats = {
      totalFiles: allMedia.length,
      totalSize: allMedia.reduce((sum, item) => sum + item.file_size, 0),
      activeMedia: allMedia.filter(item => item.is_active).length,
      videoFiles: allMedia.filter(item => item.media_type === 'video').length,
      imageFiles: allMedia.filter(item => item.media_type === 'image').length,
    };

    return stats;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum 50MB allowed.' };
    }

    // Check file type
    const allowedMimeTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only MP4, WebM, OGG videos and JPEG, PNG, WebP images are allowed.' };
    }

    return { valid: true };
  }

  /**
   * Cleanup old inactive files (utility method)
   */
  async cleanupOldFiles(olderThanDays = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const oldFiles = await HeaderMedia.findAll({
      where: {
        is_active: false,
        upload_date: { [Op.lt]: cutoffDate }
      }
    });

    let deletedCount = 0;
    for (const file of oldFiles) {
      const success = await this.deleteMedia(file.id);
      if (success) deletedCount++;
    }

    return deletedCount;
  }
}

export const headerMediaService = new HeaderMediaService();