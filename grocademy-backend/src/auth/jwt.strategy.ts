import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromExtractors([(request: Request) => {
          return request?.cookies?.token;
        }])
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET') || 'supersecret',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Payload received:', payload); // Debug log
    const user = { userId: payload.sub, username: payload.username, is_admin: payload.is_admin };
    console.log('JWT Strategy - User object returned:', user); // Debug log
    return user;
  }
}
