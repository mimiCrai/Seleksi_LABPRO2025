import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    description: 'Module title',
    example: 'Variables and Data Types',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @ApiProperty({
    description: 'Module description',
    example: 'Learn about TypeScript variables and data types',
    maxLength: 500
  })
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description: string;

  @ApiProperty({
    description: 'Module order/sequence',
    example: 1,
    minimum: 1
  })
  @IsNumber()
  @Min(1, { message: 'Order must be a positive number' })
  order: number;

  @ApiProperty({
    description: 'PDF content URL',
    required: false
  })
  @IsOptional()
  @IsString()
  pdf_content?: string;

  @ApiProperty({
    description: 'Video content URL',
    required: false
  })
  @IsOptional()
  @IsString()
  video_content?: string;
}
