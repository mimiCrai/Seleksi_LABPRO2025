import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Store files in memory for S3 upload
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService], // Export service for use in other modules
})
export class UploadModule {}
