import { Controller, Post, Body, Get, UseGuards, Req, Render, Res } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller()
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // Page routes
  @Get('register')
  @ApiOperation({ summary: 'Show register page' })
  @Render('register')
  showRegister() {
    return {
      pageTitle: 'Register',
      currentPage: 'register'
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (form)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' }
      },
      required: ['username', 'email', 'password']
    }
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async doRegister(@Body() body: any, @Res() res: Response) {
    const result = await this.authService.register(body);
    
    if (result.status === 'success') {
      return res.redirect('/login');
    } else {
      return res.render('register', { 
        pageTitle: 'Register',
        currentPage: 'register',
        error: result.message || 'Registration failed, please try again' 
      });
    }
  }

  @Get('login')
  @ApiOperation({ summary: 'Show login page (Admin access required for external requests)' })
  async showLogin(@Req() req: any, @Res() res: Response) {
    // Get the origin or referer to check where the request is coming from
    const origin = req.get('Origin') || req.get('Referer') || '';
    const isExternalRequest = origin.includes('labpro-ohl-2025-fe.hmif.dev');
    
    // If request comes from external frontend, check for admin privileges
    if (isExternalRequest) {
      const token = req.cookies?.token;
      
      if (token) {
        try {
          // Verify and decode the token
          const decoded = this.jwtService.verify(token);
          
          // If user is already logged in and is admin, redirect to dashboard
          if (decoded.is_admin) {
            return res.redirect('/dashboard');
          }
          
          // If user is logged in but not admin, deny access to login page
          return res.status(401).json({
            status: 'error',
            message: 'Access denied. Admin privileges required.',
            data: null
          });
          
        } catch (error) {
          // Token is invalid, continue to show login page
        }
      }
    } else {
      // Request from own website - check if already logged in and redirect
      const token = req.cookies?.token;
      if (token) {
        try {
          const decoded = this.jwtService.verify(token);
          // Redirect to dashboard if already logged in (regardless of admin status)
          return res.redirect('/dashboard');
        } catch (error) {
          // Token is invalid, continue to show login page
        }
      }
    }
    
    // Show login page
    return res.render('login', {
      pageTitle: 'Login',
      currentPage: 'login'
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (form)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: { type: 'string' },
        password: { type: 'string' }
      },
      required: ['identifier', 'password']
    }
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async doLogin(@Body() body: any, @Req() req: any, @Res() res: Response) {
    // Get the origin or referer to check where the request is coming from
    const origin = req.get('Origin') || req.get('Referer') || '';
    const isExternalRequest = origin.includes('labpro-ohl-2025-fe.hmif.dev');
    
    const result = await this.authService.login(body.identifier, body.password);
    
    if (result.status === 'success' && result.data) {
      // If request comes from external frontend, check for admin privileges
      if (isExternalRequest && !result.data.is_admin) {
        return res.status(401).json({
          status: 'error',
          message: 'Access denied. Admin privileges required for external access.',
          data: null
        });
      }

      // Simpan token di cookie
      res.cookie('token', result.data.token, { httpOnly: true });
      return res.redirect('/dashboard');
    } else {
      return res.render('login', { 
        pageTitle: 'Login',
        currentPage: 'login',
        error: result.message || 'Login failed, please try again' 
      });
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout (form)' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async doLogout(@Res() res: Response) {
    // Clear the token cookie
    res.clearCookie('token');
    return res.redirect('/login');
  }

  // API routes
  @Post('api/auth/register')
  @ApiOperation({ summary: 'Register a new user (API)' })
  @ApiBearerAuth()
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
  apiRegister(
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

  @Post('api/auth/login')
  @ApiOperation({ summary: 'Login and get JWT token (Admin required for external requests)' })
  @ApiBearerAuth()
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
  @ApiResponse({ status: 401, description: 'Invalid credentials or access denied' })
  async apiLogin(
    @Body()
    body: {
      identifier: string; // username atau email
      password: string;
    },
    @Req() req: any,
  ) {
    // Get the origin or referer to check where the request is coming from
    const origin = req.get('Origin') || req.get('Referer') || '';
    const isExternalRequest = origin.includes('labpro-ohl-2025-fe.hmif.dev');
    
    const result = await this.authService.login(body.identifier, body.password);
    
    // If request comes from external frontend and login successful, check for admin privileges
    if (isExternalRequest && result.status === 'success' && result.data) {
      if (!result.data.is_admin) {
        return {
          status: 'error',
          message: 'Access denied. Admin privileges required for external access.',
          data: null
        };
      }
    }
    
    return result;
  }

  @Get('api/auth/self')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: 200, 
    description: 'Returns user profile',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['success', 'error'] },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            balance: { type: 'number' },
            is_admin: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Unauthorized' },
        data: { type: 'null' }
      }
    }
  })
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    try {
      return await this.authService.getUserProfile(req.user.userId);
    } catch (error) {
      return {
        status: 'error',
        message: 'Unauthorized',
        data: null
      };
    }
  }
}
