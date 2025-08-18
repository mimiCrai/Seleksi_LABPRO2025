import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user/user';
import { UserCourse } from './entities/user/user-course';
import { UserService } from './user.service';
import { UserPagesController } from './user-pages.controller';
import { UserApiController } from './user-api.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserCourse]),
    forwardRef(() => AuthModule), // Use forwardRef to avoid circular dependency
  ],
  providers: [UserService],
  controllers: [UserPagesController, UserApiController],
  exports: [UserService], // penting agar bisa dipakai di Auth
})
export class UserModule {}
