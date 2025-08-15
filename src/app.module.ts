import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';  
import { AuthModule } from './auth/auth.module';  
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { DatabaseModule } from './database/database.module';
import { PagesController } from './pages.controller';
import { HealthService } from './health.service';
import { HttpModule } from '@nestjs/axios';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Required to read .env
    TypeOrmModule.forRoot(getDatabaseConfig()),
    // Business logic modules (handle their own entity imports)
    AuthModule,
    UserModule,
    CourseModule,
    DatabaseModule, // Contains DatabaseController and all its entity imports
    HttpModule,
  ],
  controllers: [PagesController],
  providers: [HealthService],
})
export class AppModule {}
