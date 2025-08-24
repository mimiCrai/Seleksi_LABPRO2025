import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, MaxLength, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ModuleType {
  VIDEO = 'video',
  PDF = 'pdf',
  TEXT = 'text'
}

export class CreateModuleDto {
  @ApiProperty({
    description: 'Module title',
    example: 'Introduction to Variables',
    maxLength: 100
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Module description',
    example: 'Learn about JavaScript variables and scope',
    maxLength: 1000
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Module content',
    example: 'This module covers...'
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Module type',
    enum: ModuleType,
    example: ModuleType.VIDEO
  })
  @IsNotEmpty()
  @IsEnum(ModuleType)
  type: ModuleType;

  @ApiProperty({
    description: 'Module order in the course',
    example: 1,
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  order: number;

  @ApiPropertyOptional({
    description: 'Video URL for video modules',
    example: 'https://example.com/video.mp4'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  video_url?: string;

  @ApiPropertyOptional({
    description: 'PDF URL for PDF modules',
    example: 'https://example.com/document.pdf'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  pdf_url?: string;
}

export class UpdateModuleDto {
  @ApiPropertyOptional({
    description: 'Module title',
    example: 'Introduction to Variables',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Module description',
    example: 'Learn about JavaScript variables and scope',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Module content',
    example: 'This module covers...'
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Module type',
    enum: ModuleType,
    example: ModuleType.VIDEO
  })
  @IsOptional()
  @IsEnum(ModuleType)
  type?: ModuleType;

  @ApiPropertyOptional({
    description: 'Module order in the course',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  order?: number;

  @ApiPropertyOptional({
    description: 'Video URL for video modules',
    example: 'https://example.com/video.mp4'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  video_url?: string;

  @ApiPropertyOptional({
    description: 'PDF URL for PDF modules',
    example: 'https://example.com/document.pdf'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  pdf_url?: string;
}

