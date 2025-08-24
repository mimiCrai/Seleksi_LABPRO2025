# Local File Storage Setup Guide

This guide will help you set up local file storage for your Grocademy application.

## Overview

Your application is configured to store files locally in an `uploads` directory. Files are organized into subfolders:
- `uploads/images/` - For image files (JPEG, PNG, GIF, WebP)
- `uploads/videos/` - For video files (MP4, MPEG, MOV, AVI, WebM)
- `uploads/pdfs/` - For PDF documents

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=grocademy_user
DB_PASSWORD=grocademy_password
DB_NAME=grocademy_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# File Storage Configuration (Local Storage)
# Files will be stored in ./uploads directory
# Access files via: http://localhost:3000/uploads/folder/filename
UPLOAD_MAX_SIZE_IMAGE=5242880  # 5MB in bytes
UPLOAD_MAX_SIZE_VIDEO=104857600  # 100MB in bytes  
UPLOAD_MAX_SIZE_PDF=10485760   # 10MB in bytes
```

### Directory Structure

The application automatically creates the following directory structure:

```
your-project/
├── uploads/
│   ├── images/
│   ├── videos/
│   └── pdfs/
└── src/
    └── ...
```

## File Access

Files are accessible via HTTP at:
- Images: `http://localhost:3000/uploads/images/filename.jpg`
- Videos: `http://localhost:3000/uploads/videos/filename.mp4`
- PDFs: `http://localhost:3000/uploads/pdfs/filename.pdf`

## API Endpoints

### Upload Image
```bash
curl -X POST \\
  http://localhost:3000/api/upload/image \\
  -H 'Authorization: Bearer your-jwt-token' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'file=@/path/to/image.jpg'
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "data": {
    "url": "http://localhost:3000/uploads/images/uuid-filename.jpg",
    "key": "images/uuid-filename.jpg"
  }
}
```

### Upload Video
```bash
curl -X POST \\
  http://localhost:3000/api/upload/video \\
  -H 'Authorization: Bearer your-jwt-token' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'file=@/path/to/video.mp4'
```

### Upload PDF
```bash
curl -X POST \\
  http://localhost:3000/api/upload/pdf \\
  -H 'Authorization: Bearer your-jwt-token' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'file=@/path/to/document.pdf'
```

### Delete File
```bash
curl -X DELETE \\
  http://localhost:3000/api/upload/file/images/uuid-filename.jpg \\
  -H 'Authorization: Bearer your-jwt-token'
```

### List Files
```bash
# List all images
curl -X GET \\
  http://localhost:3000/api/upload/files/images \\
  -H 'Authorization: Bearer your-jwt-token'

# List all videos  
curl -X GET \\
  http://localhost:3000/api/upload/files/videos \\
  -H 'Authorization: Bearer your-jwt-token'

# List all PDFs
curl -X GET \\
  http://localhost:3000/api/upload/files/pdfs \\
  -H 'Authorization: Bearer your-jwt-token'
```

## File Validation

The system automatically validates:

### Images
- **Size limit**: 5MB
- **Allowed types**: JPEG, PNG, GIF, WebP
- **Extensions**: .jpg, .jpeg, .png, .gif, .webp

### Videos
- **Size limit**: 100MB
- **Allowed types**: MP4, MPEG, QuickTime, AVI, WebM
- **Extensions**: .mp4, .mpeg, .mov, .avi, .webm

### PDFs
- **Size limit**: 10MB
- **Allowed types**: PDF
- **Extensions**: .pdf

## Integration with Course Modules

Store file URLs in your database:

```typescript
// Example: In your course module entity
@Entity('course_modules')
export class CourseModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // Store local file URLs
  @Column({ nullable: true })
  videoUrl: string; // http://localhost:3000/uploads/videos/uuid-filename.mp4

  @Column({ nullable: true })
  pdfUrl: string; // http://localhost:3000/uploads/pdfs/uuid-filename.pdf

  @Column({ nullable: true })
  thumbnailUrl: string; // http://localhost:3000/uploads/images/uuid-filename.jpg
}
```

## Example Frontend Integration

### Upload Video for Course Module

```javascript
// Frontend example
async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload/video', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`
    },
    body: formData
  });

  const result = await response.json();
  return result.data.url; // Use this URL in your course module
}
```

### Create Course Module with Files

```javascript
async function createCourseModule(moduleData) {
  // First upload files
  const videoUrl = await uploadVideo(moduleData.videoFile);
  const pdfUrl = await uploadPDF(moduleData.pdfFile);
  const thumbnailUrl = await uploadImage(moduleData.thumbnailFile);

  // Then create module with URLs
  const response = await fetch('/api/courses/1/modules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      title: moduleData.title,
      videoUrl: videoUrl,
      pdfUrl: pdfUrl,
      thumbnailUrl: thumbnailUrl,
      // ... other fields
    })
  });
}
```

## Backup & Storage Management

### Backup Strategy
Since files are stored locally, make sure to:
1. Include the `uploads/` directory in your backup strategy
2. Consider using file sync services (Dropbox, Google Drive, etc.)
3. Set up regular database backups that include file path references

### Storage Space
Monitor disk usage regularly:
```bash
# Check uploads directory size
du -sh uploads/

# Check individual folder sizes
du -sh uploads/images/
du -sh uploads/videos/
du -sh uploads/pdfs/
```

### Cleanup Old Files
You can create cleanup scripts to remove unused files:

```bash
# Example: Find files older than 30 days not referenced in database
find uploads/ -type f -mtime +30 -exec ls -la {} \\;
```

## Production Deployment

### File Permissions
Make sure the uploads directory is writable:
```bash
chmod 755 uploads/
chmod 755 uploads/images/
chmod 755 uploads/videos/
chmod 755 uploads/pdfs/
```

### Web Server Configuration

#### Nginx
```nginx
server {
    location /uploads/ {
        alias /path/to/your/app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache
```apache
<Directory "/path/to/your/app/uploads">
    Options -Indexes
    AllowOverride None
    Require all granted
    
    # Cache static files
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</Directory>
```

### Docker Deployment
If using Docker, make sure to create a volume for the uploads directory:

```dockerfile
# Dockerfile
FROM node:18-alpine
# ... other instructions

# Create uploads directory
RUN mkdir -p /app/uploads
VOLUME ["/app/uploads"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    volumes:
      - ./uploads:/app/uploads
    # ... other configuration
```

## Security Considerations

### File Validation
The upload service includes comprehensive validation:
- File size limits
- MIME type checking  
- File extension validation
- Unique filename generation (prevents conflicts)

### Access Control
All upload endpoints require JWT authentication.

### Directory Security
- Files are served statically but organized in predictable folders
- Consider adding additional access controls if needed
- File names are UUID-based to prevent guessing

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Fix directory permissions
   chmod 755 uploads/
   chown -R $USER:$USER uploads/
   ```

2. **File Not Found**
   - Check if the uploads directory exists
   - Verify the file was actually uploaded
   - Check the file path in database matches the actual file location

3. **Large File Upload Fails**
   - Check file size limits in upload service
   - Verify server upload limits (nginx/apache)
   - Consider adjusting Node.js memory limits for large files

4. **CORS Issues**
   - Make sure static file serving is configured correctly
   - Check if CORS is enabled for file access

### Debug Commands

```bash
# Check if uploads directory exists and has correct structure
ls -la uploads/

# Check file permissions
ls -la uploads/images/
ls -la uploads/videos/
ls -la uploads/pdfs/

# Test file upload with curl
curl -X POST \\
  http://localhost:3000/api/upload/image \\
  -H 'Authorization: Bearer your-jwt-token' \\
  -F 'file=@test-image.jpg'

# Check application logs
tail -f logs/application.log
```

Your local file storage system is ready to use! The system automatically creates directories and handles file organization for you.
