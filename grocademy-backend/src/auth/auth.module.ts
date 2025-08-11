import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
  ConfigModule,
  UserModule,
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
providers: [AuthService, JwtStrategy],
exports: [AuthService], // Export AuthService so it can be used by other modules
})
export class AuthModule {}
