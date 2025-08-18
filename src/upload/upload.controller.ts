import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Body,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';

@Controller('api/upload')
@ApiTags('📁 File Upload')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '🖼️ Upload Image',
    description: 'Upload an image file (JPEG, PNG, WebP, GIF). Max size: 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Image uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            url: { 
              type: 'string', 
              example: 'https://grocademy-files.s3.us-east-1.amazonaws.com/images/abc123-def456.jpg' 
            },
            key: { type: 'string', example: 'images/abc123-def456.jpg' },
            type: { type: 'string', example: 'image' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadFile(file, 'images');

    return {
      status: 'success',
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        type: 'image',
      },
    };
  }

  @Post('pdf')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '📄 Upload PDF',
    description: 'Upload a PDF file for course modules. Max size: 10MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'PDF file upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'PDF uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'PDF uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            url: { 
              type: 'string', 
              example: 'https://grocademy-files.s3.us-east-1.amazonaws.com/pdfs/module-content-xyz789.pdf' 
            },
            key: { type: 'string', example: 'pdfs/module-content-xyz789.pdf' },
            type: { type: 'string', example: 'pdf' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadFile(file, 'pdfs');

    return {
      status: 'success',
      message: 'PDF uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        type: 'pdf',
      },
    };
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '🎥 Upload Video',
    description: 'Upload a video file for course modules. Max size: 100MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Video file upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file to upload (MP4, AVI, MOV, WebM)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Video uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Video uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            url: { 
              type: 'string', 
              example: 'https://grocademy-files.s3.us-east-1.amazonaws.com/videos/lesson-video-abc123.mp4' 
            },
            key: { type: 'string', example: 'videos/lesson-video-abc123.mp4' },
            type: { type: 'string', example: 'video' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadFile(file, 'videos');

    return {
      status: 'success',
      message: 'Video uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        type: 'video',
      },
    };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({
    summary: '📁 Upload Multiple Files',
    description: 'Upload multiple files at once (max 10 files).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multiple file upload',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload',
        },
        type: {
          type: 'string',
          enum: ['images', 'pdfs', 'videos'],
          description: 'Type of files being uploaded',
          example: 'images',
        },
      },
      required: ['files', 'type'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: '3 files uploaded successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              key: { type: 'string' },
              type: { type: 'string' },
              originalName: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('type') fileType: 'images' | 'pdfs' | 'videos'
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (!fileType) {
      throw new BadRequestException('File type must be specified');
    }

    const uploadPromises = files.map(async (file) => {
      const result = await this.uploadService.uploadFile(file, fileType);
      return {
        url: result.url,
        key: result.key,
        type: fileType,
        originalName: file.originalname,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return {
      status: 'success',
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles,
    };
  }

  @Delete('file/:key')
  @ApiOperation({
    summary: '🗑️ Delete File',
    description: 'Delete a file from storage using its key.',
  })
  @ApiParam({
    name: 'key',
    description: 'File key (path) to delete',
    example: 'images/abc123-def456.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'File deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteFile(@Param('key') key: string) {
    // Decode the key in case it's URL encoded
    const decodedKey = decodeURIComponent(key);
    
    await this.uploadService.deleteFile(decodedKey);

    return {
      status: 'success',
      message: 'File deleted successfully',
    };
  }
}
