import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { CookieAuthGuard } from './cookie-auth.guard';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
  ConfigModule,
  forwardRef(() => UserModule), // Use forwardRef to avoid circular dependency
  PassportModule,
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (config: ConfigService) => ({
      secret: config.get('JWT_SECRET') || 'supersecret',
      signOptions: { expiresIn: '1h' },
    }),
    inject: [ConfigService],
  }),
],
controllers: [AuthController],
providers: [AuthService, JwtStrategy, CookieAuthGuard],
exports: [AuthService, CookieAuthGuard, JwtModule], // Export what other modules need
})
export class AuthModule {}
