# AWS S3 Setup Guide for Grocademy File Storage

This guide will help you set up AWS S3 for file storage in your Grocademy application.

## Prerequisites

- AWS Account
- AWS CLI installed (optional but recommended)
- Basic understanding of AWS IAM

## Step 1: Create S3 Bucket

### Via AWS Console

1. **Login to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Navigate to S3 service

2. **Create Bucket**
   - Click "Create bucket"
   - Bucket name: `grocademy-files` (or your preferred name)
   - Region: Choose your preferred region (e.g., `us-east-1`)
   - Keep default settings for now
   - Click "Create bucket"

3. **Configure Bucket Permissions**
   - Go to your bucket → Permissions tab
   - **Block Public Access**: Turn OFF "Block all public access" if you want direct public URLs
   - **Bucket Policy**: Add the following policy for public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::grocademy-files/*"
        }
    ]
}
```

### Via AWS CLI

```bash
# Create bucket
aws s3 mb s3://grocademy-files --region us-east-1

# Set bucket policy for public read access
aws s3api put-bucket-policy --bucket grocademy-files --policy file://bucket-policy.json
```

## Step 2: Create IAM User for Application Access

### Via AWS Console

1. **Navigate to IAM**
   - Go to IAM service in AWS Console
   - Click "Users" → "Add users"

2. **Create User**
   - User name: `grocademy-s3-user`
   - Access type: Select "Programmatic access"
   - Click "Next: Permissions"

3. **Attach Policies**
   - Click "Attach existing policies directly"
   - Create custom policy with following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::grocademy-files/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::grocademy-files"
            ]
        }
    ]
}
```

4. **Get Credentials**
   - After user creation, download the CSV with Access Key ID and Secret Access Key
   - **Keep these credentials secure!**

## Step 3: Configure Environment Variables

Create a `.env` file in your project root:

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
NODE_ENV=production

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your-actual-access-key
AWS_SECRET_ACCESS_KEY=your-actual-secret-key
AWS_S3_BUCKET_NAME=grocademy-files
```

## Step 4: Test the Setup

### Using the API

1. **Start your application**
```bash
npm run start:dev
```

2. **Test file upload**
```bash
# Upload an image
curl -X POST \
  http://localhost:3000/api/upload/image \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/image.jpg'

# Expected response:
{
  "message": "File uploaded successfully",
  "data": {
    "url": "https://grocademy-files.s3.us-east-1.amazonaws.com/images/uuid-filename.jpg",
    "key": "images/uuid-filename.jpg"
  }
}
```

### Using Postman

1. Set method to POST
2. URL: `http://localhost:3000/api/upload/image`
3. Headers: `Authorization: Bearer your-jwt-token`
4. Body: form-data with key `file` and select your file

## Step 5: Integration with Course Modules

Now you can store file URLs in your database:

```typescript
// Example: In your course entity
@Entity('course_modules')
export class CourseModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // Store S3 URLs
  @Column({ nullable: true })
  videoUrl: string; // From S3 upload

  @Column({ nullable: true })
  pdfUrl: string; // From S3 upload

  @Column({ nullable: true })
  thumbnailUrl: string; // From S3 upload
}
```

## Security Best Practices

### 1. Environment Security
- Never commit `.env` files
- Use AWS IAM roles in production (EC2/ECS)
- Rotate access keys regularly

### 2. Bucket Security
- Enable bucket versioning
- Enable server-side encryption
- Configure CORS if needed:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["https://your-frontend-domain.com"],
        "ExposeHeaders": []
    }
]
```

### 3. File Validation
The upload service already includes:
- File type validation
- File size limits
- Unique filename generation

## Cost Optimization

### 1. Storage Classes
- Use S3 Standard for frequently accessed files
- Use S3 IA (Infrequent Access) for older files
- Use S3 Glacier for archival

### 2. Lifecycle Rules
Set up lifecycle policies to automatically transition files:

```json
{
    "Rules": [
        {
            "Status": "Enabled",
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                }
            ]
        }
    ]
}
```

## Monitoring and Logs

### 1. CloudWatch Metrics
Monitor:
- Request count
- Error rates
- Data transfer

### 2. S3 Access Logs
Enable access logging to track usage:
- Who accessed what files
- When files were accessed
- Response codes

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Check IAM user permissions
   - Verify bucket policy
   - Ensure correct region

2. **CORS Errors**
   - Configure CORS policy on bucket
   - Check allowed origins

3. **File Not Found**
   - Verify bucket name in environment variables
   - Check file key format

### Environment Variables Checklist

- [ ] `AWS_REGION` - Matches your bucket region
- [ ] `AWS_ACCESS_KEY_ID` - Valid access key
- [ ] `AWS_SECRET_ACCESS_KEY` - Corresponding secret key
- [ ] `AWS_S3_BUCKET_NAME` - Exact bucket name

## Production Deployment

### Using AWS ECS/EC2
Use IAM roles instead of access keys:

```typescript
// No need for explicit credentials
this.s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // IAM role provides credentials automatically
});
```

### Using Docker
```dockerfile
# Don't copy .env files
# Set environment variables via Docker run or docker-compose
ENV AWS_REGION=us-east-1
ENV AWS_S3_BUCKET_NAME=grocademy-files
```

## Support

For issues:
1. Check AWS CloudWatch logs
2. Verify environment variables
3. Test with AWS CLI:
```bash
aws s3 ls s3://grocademy-files
```

Your file storage system is now ready for production use with AWS S3!
