import { Controller, Post, Body, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { UploadService } from '../upload/upload.service';

/**
 * Example integration showing how to use file uploads with course modules
 * This demonstrates the workflow for creating course content with file uploads
 */
@ApiTags('Course Content Examples')
@Controller('api/course-content-example')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class CourseContentExampleController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('create-with-video')
  @ApiOperation({ summary: 'Create course module with video upload (Example)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Introduction to JavaScript' },
        description: { type: 'string', example: 'Learn the basics of JavaScript programming' },
        duration: { type: 'number', example: 1800 },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file (MP4, MOV, AVI)'
        }
      },
      required: ['title', 'description', 'file']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Course module created successfully with video',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Course module created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            title: { type: 'string', example: 'Introduction to JavaScript' },
            description: { type: 'string', example: 'Learn the basics of JavaScript programming' },
            duration: { type: 'number', example: 1800 },
            videoUrl: { type: 'string', example: 'https://grocademy-files.s3.us-east-1.amazonaws.com/videos/uuid-filename.mp4' },
            createdAt: { type: 'string', example: '2024-08-16T10:30:00Z' }
          }
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async createModuleWithVideo(
    @Body() createData: {
      title: string;
      description: string;
      duration?: number;
    },
    @UploadedFile() file: Express.Multer.File
  ) {
    // Step 1: Upload video to S3
    const uploadResult = await this.uploadService.uploadFile(file, 'videos');
    
    // Step 2: Create course module with video URL
    // In real implementation, this would save to database
    const moduleData = {
      id: '123e4567-e89b-12d3-a456-426614174000', // UUID from database
      title: createData.title,
      description: createData.description,
      duration: createData.duration || 0,
      videoUrl: uploadResult.url, // S3 URL stored in database
      createdAt: new Date().toISOString()
    };

    return {
      message: 'Course module created successfully',
      data: moduleData
    };
  }

  @Post('create-with-pdf-and-video')
  @ApiOperation({ summary: 'Create course module with both PDF and video (Example)' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Advanced JavaScript Concepts' },
        description: { type: 'string', example: 'Deep dive into JavaScript closures and async programming' },
        duration: { type: 'number', example: 3600 },
        videoUrl: { 
          type: 'string', 
          example: 'https://grocademy-files.s3.us-east-1.amazonaws.com/videos/uuid-video.mp4',
          description: 'Video URL from previous upload'
        },
        pdfUrl: { 
          type: 'string', 
          example: 'https://grocademy-files.s3.us-east-1.amazonaws.com/pdfs/uuid-notes.pdf',
          description: 'PDF URL from previous upload'
        }
      },
      required: ['title', 'description', 'videoUrl', 'pdfUrl']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Course module created successfully with video and PDF',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Course module created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
            title: { type: 'string', example: 'Advanced JavaScript Concepts' },
            description: { type: 'string', example: 'Deep dive into JavaScript closures and async programming' },
            duration: { type: 'number', example: 3600 },
            videoUrl: { type: 'string', example: 'https://grocademy-files.s3.us-east-1.amazonaws.com/videos/uuid-video.mp4' },
            pdfUrl: { type: 'string', example: 'https://grocademy-files.s3.us-east-1.amazonaws.com/pdfs/uuid-notes.pdf' },
            createdAt: { type: 'string', example: '2024-08-16T10:45:00Z' }
          }
        }
      }
    }
  })
  async createModuleWithBothFiles(
    @Body() createData: {
      title: string;
      description: string;
      duration?: number;
      videoUrl: string; // URL from previous upload
      pdfUrl: string;   // URL from previous upload
    }
  ) {
    // In real implementation, validate that URLs belong to your S3 bucket
    // and save to database
    const moduleData = {
      id: '123e4567-e89b-12d3-a456-426614174001', // UUID from database
      title: createData.title,
      description: createData.description,
      duration: createData.duration || 0,
      videoUrl: createData.videoUrl, // S3 URL stored in database
      pdfUrl: createData.pdfUrl,     // S3 URL stored in database
      createdAt: new Date().toISOString()
    };

    return {
      message: 'Course module created successfully',
      data: moduleData
    };
  }
}

/*
USAGE WORKFLOW:

1. Upload files separately:
   POST /api/upload/video (with file)
   → Returns: { url: "https://...s3.../videos/uuid-file.mp4", key: "videos/uuid-file.mp4" }
   
   POST /api/upload/pdf (with file)
   → Returns: { url: "https://...s3.../pdfs/uuid-file.pdf", key: "pdfs/uuid-file.pdf" }

2. Create course module with URLs:
   POST /api/course-content-example/create-with-pdf-and-video
   Body: {
     "title": "My Course",
     "description": "Course description",
     "videoUrl": "https://grocademy-files.s3.us-east-1.amazonaws.com/videos/uuid-file.mp4",
     "pdfUrl": "https://grocademy-files.s3.us-east-1.amazonaws.com/pdfs/uuid-file.pdf"
   }

3. Database entity example:
   @Entity('course_modules')
   export class CourseModule {
     @PrimaryGeneratedColumn('uuid')
     id: string;

     @Column()
     title: string;

     @Column('text')
     description: string;

     @Column({ nullable: true })
     videoUrl: string; // S3 URL

     @Column({ nullable: true })
     pdfUrl: string; // S3 URL

     @Column({ nullable: true })
     thumbnailUrl: string; // S3 URL

     @Column({ default: 0 })
     duration: number;
   }
*/
