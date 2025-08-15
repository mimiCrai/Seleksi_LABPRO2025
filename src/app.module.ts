// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';  
import { AuthModule } from './auth/auth.module';  
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourseModule } from './course/course.module';
import { PagesController } from './pages.controller';
import { DatabaseController } from './database.controller';
import { HttpModule } from '@nestjs/axios';
import { User } from './user/entities/user/user';
import { Course } from './course/entities/course/course';
import { CourseModule as CourseModuleEntity } from './course/entities/course/course-module';
import { UserCourse } from './user/entities/user/user-course';
import { UserProgress } from './user/entities/user/user-progress';

@Module({
  imports: [
    ConfigModule.forRoot(), // Wajib untuk baca .env
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Course, CourseModuleEntity, UserCourse, UserProgress]),
    AuthModule,
    UserModule,
    CourseModule,
    HttpModule,
  ],
  controllers: [AppController, PagesController, DatabaseController],
  providers: [AppService],
})
export class AppModule {}
// console.log('DB_USERNAME:', process.env.DB_USERNAME);