import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'First name',
    example: 'John'
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe'
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john@example.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'johndoe'
  })
  @IsOptional()
  @IsString()
  username?: string;
}

export class TopUpBalanceDto {
  @ApiProperty({
    description: 'Amount to add to balance (use negative values to subtract)',
    example: 100
  })
  @IsNumber()
  increment: number;
}
