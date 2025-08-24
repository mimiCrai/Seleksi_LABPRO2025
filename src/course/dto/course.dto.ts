import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Advanced JavaScript Programming',
    maxLength: 100
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Learn advanced JavaScript concepts and patterns',
    maxLength: 1000
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Course price in dollars',
    example: 49.99,
    minimum: 0,
    maximum: 10000
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @Max(10000)
  price: number;

  @ApiPropertyOptional({
    description: 'Course image URL',
    example: 'https://example.com/course-image.jpg'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  image_url?: string;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'Course title',
    example: 'Advanced JavaScript Programming',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Course description',
    example: 'Learn advanced JavaScript concepts and patterns',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Course price in dollars',
    example: 49.99,
    minimum: 0,
    maximum: 10000
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @Max(10000)
  price?: number;

  @ApiPropertyOptional({
    description: 'Course image URL',
    example: 'https://example.com/course-image.jpg'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  image_url?: string;
}
