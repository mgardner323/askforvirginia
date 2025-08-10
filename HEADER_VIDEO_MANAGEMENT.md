# Header Video Management - Virginia Real Estate

## Table of Contents
1. [Overview](#overview)
2. [Video System Architecture](#video-system-architecture)
3. [Admin Panel Video Management](#admin-panel-video-management)
4. [Video Upload Procedures](#video-upload-procedures)
5. [Video Optimization Guidelines](#video-optimization-guidelines)
6. [Technical Specifications](#technical-specifications)
7. [Troubleshooting](#troubleshooting)
8. [Performance Optimization](#performance-optimization)
9. [Accessibility and User Experience](#accessibility-and-user-experience)
10. [Backup and Recovery](#backup-and-recovery)

---

## Overview

The Virginia Real Estate website features a dynamic header video system that displays engaging background videos on the homepage hero section. This system allows administrators to upload, manage, and activate different videos to enhance the visual appeal and user engagement of the site.

### Key Features
- **Dynamic Video Management**: Upload and switch between different header videos
- **Fallback System**: Automatic fallback to static images if video fails to load
- **Mobile Optimization**: Optimized playback for mobile devices
- **User Controls**: Play/pause and mute/unmute functionality
- **Performance Optimization**: Lazy loading and compression support
- **Admin Control**: Complete admin panel management interface

### Current Video Setup
The hero section currently supports:
- **Primary Video**: `/videos/hero-background.mp4` (local file)
- **Fallback Video**: External CDN video from coverr.co
- **Fallback Image**: Unsplash real estate photography
- **Controls**: Play/pause and mute toggle buttons

---

## Video System Architecture

### Database Schema
The header video system uses a dedicated database table `header_media` managed by the `HeaderMedia` model:

```sql
CREATE TABLE header_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  media_type ENUM('video', 'image') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  duration FLOAT NULL,
  dimensions JSON NULL,
  is_active BOOLEAN DEFAULT FALSE,
  upload_date DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  
  INDEX idx_header_media_active (is_active),
  INDEX idx_header_media_type (media_type),
  INDEX idx_header_media_upload_date (upload_date)
);
```

### File Storage Structure
```
/public/uploads/header/
├── [uuid].mp4          # Video files
├── [uuid].webm         # Alternative video format
├── [uuid].jpg          # Image files
├── [uuid].png          # Image files
└── [uuid].webp         # Optimized images
```

### API Endpoints
- `GET /api/header-media` - List all header media
- `GET /api/header-media/active` - Get currently active media
- `POST /api/header-media/upload` - Upload new media file
- `PUT /api/header-media/:id/activate` - Set media as active
- `DELETE /api/header-media/:id` - Delete media file
- `GET /api/header-media/stats` - Get storage statistics

---

## Admin Panel Video Management

### Accessing Video Management
1. **Login to Admin Panel**: Navigate to `https://askforvirginia.com/admin/login`
2. **Navigate to Media**: Go to **Content** → **Header Media**
3. **View Current Media**: See all uploaded videos and images

### Video Management Interface

#### Media Library View
The media library displays:
- **Thumbnail Preview**: Video/image preview
- **File Information**: Name, size, duration, upload date
- **Status Indicator**: Active/inactive status
- **Action Buttons**: Activate, Edit, Delete options

#### Upload New Video
1. Click **Upload New Media** button
2. **Select File**: Choose video file (MP4, WebM, OGG) or image (JPEG, PNG, WebP)
3. **File Validation**: System validates file type and size
4. **Upload Progress**: Monitor upload status
5. **Metadata Entry**: Add description or tags (optional)
6. **Save**: Complete upload process

#### Activate Video
1. **Select Video**: Choose from uploaded media library
2. **Preview**: Review video before activation
3. **Activate**: Click "Set as Active" button
4. **Confirmation**: System deactivates current video and activates selected one
5. **Live Update**: Changes reflect immediately on homepage

#### Video Controls
- **Preview**: Watch video before activation
- **Edit Metadata**: Update file information
- **Download**: Download original file
- **Replace**: Upload new version
- **Delete**: Remove video (with confirmation)

### Bulk Operations
- **Activate Multiple**: Set multiple videos as featured (carousel)
- **Bulk Delete**: Remove multiple old videos
- **Export Metadata**: Download media information
- **Storage Cleanup**: Remove inactive old files

---

## Video Upload Procedures

### Pre-Upload Preparation

#### Video Requirements
- **File Format**: MP4 (preferred), WebM, OGV
- **Maximum Size**: 50MB per file
- **Resolution**: 1920x1080 (Full HD) recommended
- **Aspect Ratio**: 16:9 landscape orientation
- **Duration**: 10-60 seconds for optimal performance
- **Codec**: H.264 for MP4, VP9 for WebM

#### Video Optimization
Before uploading, optimize videos using these guidelines:

1. **Compression Settings**:
   - Bitrate: 2-5 Mbps for 1080p
   - Frame Rate: 30 fps maximum
   - Audio: Optional (videos are muted by default)

2. **Content Guidelines**:
   - Focus on real estate/home imagery
   - Smooth, slow motion preferred
   - Avoid rapid scene changes
   - Ensure visual appeal across all devices

### Upload Process

#### Step 1: Access Upload Interface
1. Navigate to Admin Panel → Header Media
2. Click "Upload New Video" button
3. Drag & drop or select file

#### Step 2: File Validation
System automatically validates:
- File size (≤50MB)
- File type (video/image formats only)
- File integrity
- Basic metadata extraction

#### Step 3: Upload Monitoring
- **Progress Bar**: Real-time upload progress
- **Speed Indicator**: Upload speed monitoring
- **Cancel Option**: Ability to cancel upload
- **Error Handling**: Clear error messages if issues occur

#### Step 4: Post-Upload Processing
1. **File Storage**: Video saved to `/public/uploads/header/`
2. **Database Entry**: Metadata saved to database
3. **Thumbnail Generation**: Automatic preview creation
4. **Validation**: File integrity verification
5. **Notification**: Upload completion confirmation

### Upload Best Practices
1. **Test Locally**: Preview video before upload
2. **File Naming**: Use descriptive filenames
3. **Version Control**: Keep original files as backup
4. **Quality Check**: Verify video quality after upload
5. **Mobile Testing**: Test on mobile devices

---

## Video Optimization Guidelines

### Technical Optimization

#### Video Encoding
```bash
# Recommended FFmpeg settings for header videos
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -profile:v high \
  -level:v 4.0 \
  -b:v 3M \
  -maxrate 5M \
  -bufsize 10M \
  -r 30 \
  -s 1920x1080 \
  -an \
  output.mp4
```

#### WebM Alternative
```bash
# Create WebM version for better compression
ffmpeg -i input.mp4 \
  -c:v libvpx-vp9 \
  -b:v 2M \
  -r 30 \
  -s 1920x1080 \
  -an \
  output.webm
```

#### Poster Image Generation
```bash
# Generate poster image from video
ffmpeg -i input.mp4 \
  -ss 00:00:02 \
  -vframes 1 \
  -q:v 2 \
  poster.jpg
```

### Content Optimization

#### Visual Guidelines
1. **Subject Matter**: 
   - Luxury homes and properties
   - Beautiful neighborhoods
   - Lifestyle imagery
   - Southern California landscapes

2. **Technical Quality**:
   - Stable footage (no camera shake)
   - Good lighting conditions
   - Sharp focus throughout
   - Smooth transitions

3. **Duration Considerations**:
   - **15-30 seconds**: Optimal for attention span
   - **Loop seamlessly**: Smooth start/end transition
   - **No jarring cuts**: Maintain visual flow

#### Performance Considerations
1. **File Size**: Balance quality vs. loading speed
2. **Mobile Impact**: Consider mobile data usage
3. **Loading Priority**: Video loads after critical content
4. **Fallback Ready**: Always have static image backup

---

## Technical Specifications

### Supported File Formats

#### Video Formats
| Format | MIME Type | Codec | Max Size | Recommended Use |
|--------|-----------|--------|----------|-----------------|
| MP4 | video/mp4 | H.264 | 50MB | Primary format |
| WebM | video/webm | VP9 | 50MB | Modern browsers |
| OGV | video/ogg | Theora | 50MB | Legacy support |

#### Image Formats
| Format | MIME Type | Max Size | Recommended Use |
|--------|-----------|----------|-----------------|
| JPEG | image/jpeg | 10MB | Photographic content |
| PNG | image/png | 10MB | Graphics with transparency |
| WebP | image/webp | 10MB | Modern browsers |

### Frontend Implementation

#### HeroSection Component Structure
```typescript
// Video state management
const [videoLoaded, setVideoLoaded] = useState(false);
const [videoError, setVideoError] = useState(false);
const [isPlaying, setIsPlaying] = useState(true);
const [isMuted, setIsMuted] = useState(true);

// Video element with fallbacks
<video
  ref={videoRef}
  className="absolute inset-0 w-full h-full object-cover"
  autoPlay
  muted
  loop
  playsInline
  onLoadedData={handleVideoLoad}
  onError={handleVideoError}
  poster="/images/hero-fallback.jpg"
>
  <source src="/videos/hero-background.mp4" type="video/mp4" />
  <source src="/videos/hero-background.webm" type="video/webm" />
</video>
```

#### Video Control Implementation
```typescript
// Play/Pause control
const togglePlayPause = () => {
  if (videoRef.current) {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }
};

// Mute/Unmute control
const toggleMute = () => {
  if (videoRef.current) {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }
};
```

### Database Integration

#### HeaderMedia Model
```typescript
interface HeaderMediaAttributes {
  id: number;
  media_type: 'video' | 'image';
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  is_active: boolean;
  upload_date: Date;
  created_at: Date;
  updated_at: Date;
}
```

#### Service Methods
```typescript
class HeaderMediaService {
  async getActiveMedia(): Promise<HeaderMedia | null>
  async setActiveMedia(id: number): Promise<HeaderMedia | null>
  async uploadMedia(file: Express.Multer.File): Promise<HeaderMedia>
  async deleteMedia(id: number): Promise<boolean>
  async getStorageStats(): Promise<StorageStats>
  validateFile(file: Express.Multer.File): ValidationResult
}
```

---

## Troubleshooting

### Common Issues

#### Issue: Video Not Playing
**Symptoms**: Video doesn't start, shows poster image only

**Possible Causes**:
- Browser autoplay restrictions
- Video file corruption
- Network connectivity issues
- MIME type configuration

**Solutions**:
1. **Check Browser Console**: Look for autoplay policy errors
2. **Verify File Integrity**: Re-upload if file is corrupted
3. **Test Different Browsers**: Check cross-browser compatibility
4. **Update MIME Types**: Ensure server serves correct MIME types

#### Issue: Slow Loading
**Symptoms**: Video takes long time to load, affects page performance

**Solutions**:
1. **Optimize Video**: Reduce file size and bitrate
2. **Enable Compression**: Use gzip/brotli compression
3. **CDN Integration**: Serve videos from CDN
4. **Preload Strategy**: Adjust preload attribute

#### Issue: Mobile Playback Problems
**Symptoms**: Video doesn't work on mobile devices

**Solutions**:
1. **Add playsInline**: Prevents fullscreen on iOS
2. **Check Data Saver**: Consider data-conscious users
3. **Test on Devices**: Verify on actual mobile devices
4. **Fallback Images**: Ensure fallback works on mobile

#### Issue: Upload Failures
**Symptoms**: Video upload doesn't complete or fails

**Solutions**:
1. **Check File Size**: Ensure under 50MB limit
2. **Verify Format**: Use supported video formats
3. **Server Timeout**: Increase upload timeout limits
4. **Disk Space**: Check server storage availability

### Diagnostic Tools

#### Video Testing Script
```javascript
// Test video loading and playback
function testVideoLoad(videoElement) {
  console.log('Video duration:', videoElement.duration);
  console.log('Video ready state:', videoElement.readyState);
  console.log('Network state:', videoElement.networkState);
  console.log('Can play:', videoElement.canPlay);
}
```

#### Performance Monitoring
```javascript
// Monitor video performance
videoElement.addEventListener('loadstart', () => console.log('Loading started'));
videoElement.addEventListener('canplay', () => console.log('Can start playing'));
videoElement.addEventListener('canplaythrough', () => console.log('Can play through'));
videoElement.addEventListener('error', (e) => console.error('Video error:', e));
```

---

## Performance Optimization

### Loading Strategies

#### Lazy Loading Implementation
```typescript
// Lazy load video when component is in viewport
const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoadVideo(true);
      }
    },
    { threshold: 0.1 }
  );

  if (heroRef.current) {
    observer.observe(heroRef.current);
  }

  return () => observer.disconnect();
}, []);
```

#### Progressive Loading
1. **Poster Image**: Show immediately
2. **Low Quality Video**: Load small preview
3. **Full Quality**: Load full resolution when ready
4. **Preload Next**: Prepare next video in queue

### Caching Strategies

#### Browser Caching
Configure proper cache headers:
```nginx
# NGINX configuration for video caching
location ~* \.(mp4|webm|ogg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
}
```

#### CDN Integration
For high-traffic sites, consider CDN:
1. **Upload to CDN**: Sync videos to CDN storage
2. **Update URLs**: Point video sources to CDN
3. **Geographic Distribution**: Serve from nearest location
4. **Analytics**: Monitor CDN performance

### Bandwidth Optimization

#### Adaptive Bitrate (Future Enhancement)
```typescript
// Detect connection speed and serve appropriate quality
const connection = (navigator as any).connection;
const isSlowConnection = connection?.effectiveType === 'slow-2g' || 
                        connection?.effectiveType === '2g';

const videoSrc = isSlowConnection 
  ? '/videos/hero-background-low.mp4'
  : '/videos/hero-background-hd.mp4';
```

#### Data Saver Mode
```typescript
// Respect user's data saver preference
const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
const shouldShowVideo = !prefersReducedData;
```

---

## Accessibility and User Experience

### Accessibility Compliance

#### WCAG Guidelines
1. **Provide Controls**: Always include play/pause and mute controls
2. **No Auto-Audio**: Videos are muted by default
3. **Alternative Content**: Provide meaningful fallback images
4. **Reduced Motion**: Respect prefers-reduced-motion setting

#### Implementation
```typescript
// Respect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Disable autoplay if user prefers reduced motion
const shouldAutoplay = !prefersReducedMotion;
```

#### Screen Reader Support
```tsx
// Accessible video controls
<button
  onClick={togglePlayPause}
  aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
  className="video-control"
>
  {isPlaying ? <PauseIcon /> : <PlayIcon />}
</button>
```

### User Experience Enhancements

#### Loading States
```tsx
// Loading indicator for video
{!videoLoaded && (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
    <div className="loader" />
    <p className="text-white ml-3">Loading video...</p>
  </div>
)}
```

#### Error Handling
```tsx
// Graceful error fallback
{videoError && (
  <div className="absolute inset-0 bg-cover bg-center" 
       style={{ backgroundImage: 'url(/images/hero-fallback.jpg)' }}>
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
      <p className="text-white">Unable to load video. Showing image instead.</p>
    </div>
  </div>
)}
```

### Mobile Optimization

#### Responsive Video
```css
/* Ensure video scales properly on mobile */
.hero-video {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  object-position: center;
}

@media (max-width: 768px) {
  .hero-video {
    object-position: center 20%; /* Adjust for mobile viewing */
  }
}
```

#### Touch Controls
```typescript
// Touch-friendly controls for mobile
const controlSize = window.innerWidth < 768 ? 'w-12 h-12' : 'w-8 h-8';
```

---

## Backup and Recovery

### File Backup Strategy

#### Automated Backup
```bash
#!/bin/bash
# Backup header media files

BACKUP_DIR="/backups/header-media"
SOURCE_DIR="/var/www/vhosts/askforvirginia.com/askforvirginia.com/public/uploads/header"

# Create timestamped backup
timestamp=$(date +%Y%m%d_%H%M%S)
backup_path="$BACKUP_DIR/header_media_$timestamp"

mkdir -p "$backup_path"
cp -r "$SOURCE_DIR"/* "$backup_path/"

# Compress backup
tar -czf "$backup_path.tar.gz" -C "$BACKUP_DIR" "header_media_$timestamp"
rm -rf "$backup_path"

echo "✅ Header media backup completed: $backup_path.tar.gz"
```

#### Database Backup
```bash
# Backup header media metadata
mysqldump -u username -p database_name header_media > header_media_backup.sql
```

### Recovery Procedures

#### File Recovery
```bash
# Restore from backup
backup_file="/backups/header-media/header_media_20250810_120000.tar.gz"
restore_dir="/var/www/vhosts/askforvirginia.com/askforvirginia.com/public/uploads/header"

# Extract backup
tar -xzf "$backup_file" -C "/tmp/"
cp -r "/tmp/header_media_20250810_120000"/* "$restore_dir/"

echo "✅ Files restored from backup"
```

#### Database Recovery
```bash
# Restore database records
mysql -u username -p database_name < header_media_backup.sql
```

### Disaster Recovery Plan

#### Emergency Procedures
1. **Immediate Response**: Switch to fallback images
2. **Assess Damage**: Identify scope of data loss
3. **Restore Files**: Use most recent backup
4. **Verify Functionality**: Test video playback
5. **Monitor Performance**: Ensure normal operation

#### Prevention Measures
1. **Regular Backups**: Daily automated backups
2. **Version Control**: Track all changes
3. **Monitoring**: Alert on upload failures
4. **Redundancy**: Multiple fallback options

---

## Advanced Features (Future Enhancements)

### Planned Improvements

#### Video Playlist System
- Multiple videos for rotation
- Scheduled video changes
- A/B testing capabilities

#### Advanced Analytics
- Video engagement tracking
- Performance metrics
- User interaction analysis

#### Dynamic Video Selection
- Time-based video rotation
- Seasonal content management
- Geographic targeting

#### Enhanced Mobile Experience
- Progressive video loading
- Data-conscious options
- Offline functionality

---

## Conclusion

The header video management system provides a comprehensive solution for maintaining engaging visual content on the Virginia Real Estate website. Key benefits include:

### Management Advantages
- **Easy Upload Process**: Simple admin interface for video management
- **Automatic Optimization**: Built-in validation and processing
- **Fallback System**: Reliable fallback to images when needed
- **Performance Monitoring**: Built-in analytics and performance tracking
- **Mobile Optimization**: Responsive design for all devices

### Technical Benefits
- **Scalable Architecture**: Database-driven content management
- **Modern Web Standards**: HTML5 video with progressive enhancement
- **Accessibility Compliance**: WCAG-compliant implementation
- **Performance Optimization**: Lazy loading and caching strategies
- **Cross-Browser Support**: Works across all modern browsers

### Best Practices Summary
1. **Optimize videos** before upload (compression, resolution, format)
2. **Test thoroughly** on multiple devices and browsers
3. **Monitor performance** regularly for loading times and errors
4. **Maintain backups** of all video content and metadata
5. **Follow accessibility** guidelines for inclusive user experience
6. **Keep fallbacks** ready for video loading failures
7. **Update regularly** with fresh, engaging content

For technical support or questions about video management, consult the development team or refer to the admin panel help documentation.

**Last Updated**: August 2025  
**Version**: 3.0  
**Status**: Production Ready ✅