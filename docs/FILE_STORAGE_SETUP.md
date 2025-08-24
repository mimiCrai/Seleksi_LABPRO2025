# File Storage Setup Guide

## Overview
This setup provides a complete file storage solution using AWS S3 (or S3-compatible storage) for handling video and PDF uploads in your Grocademy application.

## Features
- ✅ **Multi-format Support**: Videos (MP4, AVI, MOV, WebM), PDFs, Images
- ✅ **File Validation**: Size limits and MIME type checking
- ✅ **Secure Storage**: AWS S3 with presigned URLs
- ✅ **Local Development**: MinIO support for testing
- ✅ **Clean APIs**: RESTful endpoints with Swagger documentation

## Storage Structure
```
grocademy-files/
├── images/          # Course thumbnails, profile pics (max 5MB)
├── videos/          # Course video content (max 100MB)
└── pdfs/           # Course PDF materials (max 10MB)
```

## Setup Options

### Option 1: AWS S3 (Production)
1. Create an S3 bucket in AWS Console
2. Set up IAM user with S3 permissions
3. Configure environment variables:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=grocademy-files
```

### Option 2: MinIO (Local Development)
1. Install and run MinIO:
```bash
# Using Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

2. Configure environment variables:
```bash
NODE_ENV=development
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET_NAME=grocademy-files
```

3. Create bucket via MinIO Console (http://localhost:9001)

## API Endpoints

### File Upload Endpoints
- `POST /api/upload/image` - Upload images (thumbnails, etc.)
- `POST /api/upload/pdf` - Upload PDF course materials  
- `POST /api/upload/video` - Upload course videos
- `POST /api/upload/multiple` - Upload multiple files at once

### File Management
- `DELETE /api/upload/file/:key` - Delete uploaded files

### Example Usage

#### Upload a course video:
```bash
curl -X POST \
  http://localhost:3000/api/upload/video \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'file=@course-intro.mp4'
```

Response:
```json
{
  "status": "success",
  "message": "Video uploaded successfully",
  "data": {
    "url": "https://grocademy-files.s3.us-east-1.amazonaws.com/videos/abc123-def456.mp4",
    "key": "videos/abc123-def456.mp4",
    "type": "video"
  }
}
```

#### Upload course PDF:
```bash
curl -X POST \
  http://localhost:3000/api/upload/pdf \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'file=@module-content.pdf'
```

## Integration with Course Modules

When creating/updating course modules, use the returned URLs:

```typescript
// Example: Creating a module with uploaded content
const moduleData = {
  title: "Introduction to Programming",
  description: "Learn the basics...",
  video_content: "https://grocademy-files.s3.us-east-1.amazonaws.com/videos/abc123.mp4",
  pdf_content: "https://grocademy-files.s3.us-east-1.amazonaws.com/pdfs/def456.pdf"
};

// POST /api/courses/:courseId/modules
```

## File Validation

### Supported Formats
- **Videos**: MP4, AVI, MOV, WebM (max 100MB)
- **PDFs**: PDF only (max 10MB)  
- **Images**: JPEG, PNG, WebP, GIF (max 5MB)

### Security Features
- JWT authentication required
- File size validation
- MIME type checking
- Unique file naming (UUID-based)
- Optional presigned URLs for secure access

## Storage Costs (AWS S3)
- Storage: ~$0.023/GB/month
- Requests: ~$0.0004 per 1,000 requests
- Data transfer: First 1GB free/month

## Next Steps
1. Set up your chosen storage solution (AWS S3 or MinIO)
2. Configure environment variables
3. Test file uploads via Swagger UI at `/api/docs`
4. Integrate file URLs into your course module creation workflow

## Troubleshooting
- Check AWS credentials and permissions
- Verify bucket exists and is accessible
- Ensure file size limits aren't exceeded
- Check CORS settings for browser uploads
