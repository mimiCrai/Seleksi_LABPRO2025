import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BuyCourseDto {
  @ApiProperty({
    description: 'Course ID to purchase',
    example: 'uuid-course-id'
  })
  @IsString()
  courseId: string;
}
