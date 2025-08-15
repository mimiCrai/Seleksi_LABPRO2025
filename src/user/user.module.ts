import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user/user';
import { UserCourse } from './entities/user/user-course';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCourse])],
  providers: [UserService],
  exports: [UserService], // penting agar bisa dipakai di Auth
})
export class UserModule {}
