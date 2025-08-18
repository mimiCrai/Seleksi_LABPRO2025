import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user/user';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) {
    const { username, email, password, first_name, last_name } = data;

    try {
      // Cek apakah username/email sudah dipakai
      const existing = await this.userService.findByEmailOrUsername(email, username);
      if (existing) {
        return {
          status: 'error',
          message: 'Email or username already exists',
          data: null
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userService.create({
        username,
        email,
        password: hashedPassword,
        first_name,
        last_name,
      });

      // Return tanpa password
      const { password: _, ...safe } = user;
      return {
        status: 'success',
        message: 'User registered successfully',
        data: safe
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Registration failed',
        data: null
      };
    }
  }

  async login(identifier: string, password: string) {
    try {
      const user = await this.userService.findByIdentifier(identifier);
      if (!user) {
        return {
          status: 'error',
          message: 'Invalid credentials',
          data: null
        };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          status: 'error',
          message: 'Invalid credentials',
          data: null
        };
      }

      const token = this.jwtService.sign({ sub: user.id, username: user.username, is_admin: user.is_admin});

      return {
        status: "success",
        message: "login berhasil",
        data: {
          username: user.username,
          token: token,
          is_admin: user.is_admin,
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Login failed',
        data: null
      };
    }
  }

  async getUserProfile(userId: string) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        return {
          status: 'error',
          message: 'User not found',
          data: null
        };
      }

      return {
        status: 'success',
        message: 'User profile retrieved successfully',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          balance: user.balance,
          is_admin: user.is_admin,
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve user profile',
        data: null
      };
    }
  }
}



