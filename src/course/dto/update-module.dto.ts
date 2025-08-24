import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateModuleDto {
  @ApiPropertyOptional({
    description: 'Module title',
    example: 'Introduction to Variables'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Module description',
    example: 'Learn about different types of variables in programming'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Module order',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}
