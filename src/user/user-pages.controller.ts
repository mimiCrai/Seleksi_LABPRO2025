import {
  Controller,
  Get,
  Render,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CookieAuthGuard } from '../auth/cookie-auth.guard';

@Controller()
@ApiTags('User Pages')
export class UserPagesController {
  constructor() {}

  @Get('dashboard')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Show dashboard page' })
  @Render('dashboard')
  async showDashboard(@Req() req: any) {
    const user = req.user; // User is attached by the guard

    return {
      pageTitle: 'Dashboard',
      currentPage: 'dashboard',
      username: user.username,
      balance: user.balance,
      is_admin: user.is_admin || false,
    };
  }

  @Get('profile')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Show user profile page' })
  @Render('profile')
  async showProfile(@Req() req: any) {
    const user = req.user; // User is attached by the guard

    return {
      pageTitle: 'My Profile',
      currentPage: 'profile',
      username: user.username,
      balance: user.balance,
      is_admin: user.is_admin || false,
      user: user,
      // You could add more statistics here from service calls if needed
      courseCount: 0, // TODO: implement stats service
      completedModules: 0, // TODO: implement stats service
      certificates: 0, // TODO: implement stats service
      recentActivity: [], // TODO: implement stats service
    };
  }

  @Get('certificates')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Show user certificates page' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @Render('certificates')
  async showCertificates(@Req() req: any, @Query() query: any) {
    const user = req.user; // User is attached by the guard

    return {
      pageTitle: 'My Certificates',
      currentPage: 'certificates',
      username: user.username,
      balance: user.balance,
      is_admin: user.is_admin || false,
      certificates: [], // TODO: implement certificates service
      currentPageNum: 1,
      totalPages: 1,
      total: 0,
      // TODO: implement these stats from service
      uniqueCourses: 0,
      recentCertificates: 0,
      totalScore: 0,
    };
  }
}
