import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Introduction to TypeScript',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Learn the fundamentals of TypeScript programming',
    maxLength: 1000
  })
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  @ApiProperty({
    description: 'Course instructor name',
    example: 'John Smith',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50, { message: 'Instructor name must not exceed 50 characters' })
  instructor: string;

  @ApiProperty({
    description: 'Course price in credits',
    example: 50,
    minimum: 0
  })
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({
    description: 'Thumbnail image URL',
    example: 'https://example.com/course-thumbnail.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  thumbnail_image?: string;
}
