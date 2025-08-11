import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course/course';
import { CourseModule as CourseModuleEntity } from './entities/course/course-module';
import { User } from '../user/entities/user/user';
import { UserCourse } from '../user/entities/user/user-course';
import { UserProgress } from '../user/entities/user/user-progress';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { ModuleController } from './module.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseModuleEntity, User, UserCourse, UserProgress])],
  providers: [CourseService],
  controllers: [CourseController, ModuleController],
})
export class CourseModule {}
