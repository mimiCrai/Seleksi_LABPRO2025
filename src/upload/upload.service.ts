import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    // Create uploads directory structure
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    this.ensureDirectoryExists(this.uploadDir);
    this.ensureDirectoryExists(path.join(this.uploadDir, 'images'));
    this.ensureDirectoryExists(path.join(this.uploadDir, 'videos'));
    this.ensureDirectoryExists(path.join(this.uploadDir, 'pdfs'));
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Upload file to local storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: 'pdfs' | 'videos' | 'images' = 'images'
  ): Promise<{ url: string; key: string }> {
    try {
      console.log('🔍 UploadService.uploadFile called with:', {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        folder: folder,
        hasBuffer: !!file.buffer,
        bufferLength: file.buffer?.length
      });

      // Validate file type
      this.validateFile(file, folder);

      // Generate unique file name
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `${folder}/${fileName}`;
      const fullPath = path.join(this.uploadDir, key);

      console.log('📂 File paths:', {
        uploadDir: this.uploadDir,
        key: key,
        fullPath: fullPath
      });

      // Save file to local storage
      await fs.promises.writeFile(fullPath, file.buffer);
      
      console.log('✅ File saved successfully to:', fullPath);

      // Return public URL and key
      const url = `${this.baseUrl}/uploads/${key}`;
      
      console.log('🔗 Generated URL:', url);
      
      return {
        url,
        key,
      };
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, key);
      
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      console.error(`Failed to delete file: ${key}`, error);
      // Don't throw error for deletion failures
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(key: string): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: Date;
  }> {
    try {
      const fullPath = path.join(this.uploadDir, key);
      
      if (!fs.existsSync(fullPath)) {
        return { exists: false };
      }

      const stats = await fs.promises.stat(fullPath);
      return {
        exists: true,
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Get public URL for file
   */
  getPublicUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`;
  }

  /**
   * Validate file based on type and folder
   */
  private validateFile(file: Express.Multer.File, folder: string): void {
    const maxSize = this.getMaxFileSize(folder);
    const allowedMimes = this.getAllowedMimeTypes(folder);

    // Check file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size for ${folder} is ${this.formatBytes(maxSize)}`
      );
    }

    // Check MIME type
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types for ${folder}: ${allowedMimes.join(', ')}`
      );
    }
  }

  /**
   * Get maximum file size based on folder type
   */
  private getMaxFileSize(folder: string): number {
    const sizes = {
      videos: 100 * 1024 * 1024, // 100MB
      pdfs: 10 * 1024 * 1024,    // 10MB
      images: 5 * 1024 * 1024,   // 5MB
    };
    return sizes[folder] || sizes.images;
  }

  /**
   * Get allowed MIME types based on folder
   */
  private getAllowedMimeTypes(folder: string): string[] {
    const types = {
      videos: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
      ],
      pdfs: [
        'application/pdf',
        // 'text/plain' // Temporarily allow text files for testing
      ],
      images: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        // 'text/plain' // Temporarily allow text files for testing
      ],
    };
    return types[folder] || types.images;
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * List files in a directory
   */
  async listFiles(folder?: 'pdfs' | 'videos' | 'images'): Promise<Array<{
    fileName: string;
    key: string;
    url: string;
    size: number;
    lastModified: Date;
  }>> {
    const targetDir = folder 
      ? path.join(this.uploadDir, folder)
      : this.uploadDir;

    try {
      const files = await fs.promises.readdir(targetDir, { withFileTypes: true });
      const result: Array<{
        fileName: string;
        key: string;
        url: string;
        size: number;
        lastModified: Date;
      }> = [];

      for (const file of files) {
        if (file.isFile()) {
          const key = folder 
            ? `${folder}/${file.name}`
            : file.name;
          const fullPath = path.join(targetDir, file.name);
          const stats = await fs.promises.stat(fullPath);

          result.push({
            fileName: file.name,
            key,
            url: this.getPublicUrl(key),
            size: stats.size,
            lastModified: stats.mtime,
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
}
