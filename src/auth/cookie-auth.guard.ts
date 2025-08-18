import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const token = request.cookies?.token;
    
    if (!token) {
      response.redirect('/login');
      return false;
    }

    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userService.findById(decoded.sub);
      
      if (!user) {
        response.clearCookie('token');
        response.redirect('/login');
        return false;
      }

      // Attach user to request for use in controllers
      request.user = user;
      return true;
    } catch (error) {
      response.clearCookie('token');
      response.redirect('/login');
      return false;
    }
  }
}
