import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// All entities still needed for the application
import { User } from '../user/entities/user/user';
import { Course } from '../course/entities/course/course';
import { CourseModule as CourseModuleEntity } from '../course/entities/course/course-module';
import { UserCourse } from '../user/entities/user/user-course';
import { UserProgress } from '../user/entities/user/user-progress';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Course, CourseModuleEntity, UserCourse, UserProgress]),
  ],
  controllers: [],
})
export class DatabaseModule {}
