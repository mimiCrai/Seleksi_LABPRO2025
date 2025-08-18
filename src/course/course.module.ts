import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Course } from './entities/course/course';
import { CourseModule as CourseModuleEntity } from './entities/course/course-module';
import { User } from '../user/entities/user/user';
import { UserCourse } from '../user/entities/user/user-course';
import { UserProgress } from '../user/entities/user/user-progress';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { ModuleController } from './module.controller';
import { CoursePagesController } from './course-pages.controller';
import { ModulePagesController } from './module-pages.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseModuleEntity, User, UserCourse, UserProgress]),
    HttpModule,
    UserModule,
    AuthModule, // Import AuthModule to get CookieAuthGuard and JwtService
    UploadModule, // Import UploadModule to get UploadService
  ],
  providers: [CourseService],
  controllers: [CourseController, ModuleController, CoursePagesController, ModulePagesController],
  exports: [CourseService],
})
export class CourseModule {}
