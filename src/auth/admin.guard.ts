import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    console.log('AdminGuard - User object:', user); // Debug log

    if (!user) throw new ForbiddenException('Not a user');
    if (!user.is_admin) {
      console.log('AdminGuard - User is_admin value:', user.is_admin); // Debug log
      throw new ForbiddenException('Admin only');
    }

    return true;
  }
}
