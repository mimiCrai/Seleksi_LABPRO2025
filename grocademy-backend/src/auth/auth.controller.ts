import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('api/auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        first_name: { type: 'string' },
        last_name: { type: 'string' }
      },
      required: ['username', 'email', 'password']
    }
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  register(
    @Body()
    body: {
      username: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: { type: 'string', description: 'Username or email' },
        password: { type: 'string' }
      },
      required: ['identifier', 'password']
    }
  })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(
    @Body()
    body: {
      identifier: string; // username atau email
      password: string;
    },
  ) {
    return this.authService.login(body.identifier, body.password);
  }

  @Get('self')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    return this.authService.getUserProfile(req.user.userId);
  }
}


