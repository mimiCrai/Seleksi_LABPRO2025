import {
  Controller,
  Get,
  Post,
  Render,
  Res,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { CookieAuthGuard } from '../auth/cookie-auth.guard';
import { CourseService } from '../course/course.service';
import type { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
@ApiTags('Module Pages')
export class ModulePagesController {
  constructor(
    private courseService: CourseService,
    private http: HttpService,
  ) {}

  @Get('modules/:id')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Show module learning page' })
  @ApiParam({ name: 'id', type: String, description: 'Module ID' })
  @Render('module-learning')
  async showModuleLearning(@Param('id') moduleId: string, @Req() req: any) {
    const user = req.user; // User is attached by the guard

    try {
      // Get module details (includes completion status)
      const moduleRes = await firstValueFrom(
        this.http.get(`http://api.railway.internal:3000/api/modules/${moduleId}`, {
          headers: { Authorization: `Bearer ${req.cookies.token}` },
        }),
      );
      
      const module = moduleRes.data.data;
      
      return {
        pageTitle: module.title,
        currentPage: 'module-learning',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        module: module,
        progress: { completed: module.is_completed },
        isCompleted: module.is_completed || false,
      };
    } catch (error) {
      console.error('Error fetching module details:', error.response?.data || error.message);
      return {
        pageTitle: 'Module Not Found',
        currentPage: 'module-learning',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        error: 'Module not found or unavailable',
      };
    }
  }

  @Post('modules/:moduleId/complete')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Mark module as completed (form)' })
  @ApiParam({ name: 'moduleId', type: String, description: 'Module ID' })
  async completeModule(@Param('moduleId') moduleId: string, @Req() req: any, @Res() res: Response) {
    const user = req.user; // User is attached by the guard

    try {
      // Use the course service to complete the module
      await this.courseService.markModuleCompleted(moduleId, user.id);
      
      // Redirect back to my-courses
      return res.redirect('/my-courses');
    } catch (error) {
      console.error('Error completing module:', error.message);
      return res.redirect('/my-courses');
    }
  }
}
