import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CourseModule } from '../course/course.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CourseModule, UserModule, AuthModule],
  controllers: [CertificateController],
})
export class CertificateModule {}
