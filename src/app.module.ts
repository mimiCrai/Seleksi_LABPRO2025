import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';  
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';  
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { DatabaseModule } from './database/database.module';
import { UploadModule } from './upload/upload.module';
import { CertificateModule } from './certificate/certificate.module';
import { AppController } from './app.controller';
import { HealthService } from './health.service';
import { HttpModule } from '@nestjs/axios';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Required to read .env
    TypeOrmModule.forRoot(getDatabaseConfig()),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    // Business logic modules (handle their own entity imports)
    AuthModule,
    UserModule,
    CourseModule,
    DatabaseModule, // Contains DatabaseController and all its entity imports
    UploadModule, // File upload handling
    CertificateModule, // Certificate generation and download
    HttpModule,
  ],
  controllers: [AppController],
  providers: [HealthService],
})
export class AppModule {}
