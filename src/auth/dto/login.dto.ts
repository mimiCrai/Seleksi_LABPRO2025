import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email address',
    example: 'johndoe'
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'Password',
    example: 'strongPassword123'
  })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
