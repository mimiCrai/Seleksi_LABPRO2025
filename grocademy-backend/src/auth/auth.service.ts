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
  }): Promise<Partial<User>> {
    const { username, email, password, first_name, last_name } = data;

    // Cek apakah username/email sudah dipakai
    const existing = await this.userService.findByEmailOrUsername(email, username);
    if (existing) throw new ConflictException('Email or username already exists');

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
    return safe;
  }

  async login(identifier: string, password: string) {
    const user = await this.userService.findByIdentifier(identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, username: user.username, is_admin: user.is_admin});

    return {
      username: user.username,
      token,
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      balance: user.balance,
      is_admin: user.is_admin,
      created_at: user.created_at,
    };
  }
}



