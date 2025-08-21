import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  Res,
  Req,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CookieAuthGuard } from '../auth/cookie-auth.guard';
import { CourseService } from './course.service';
import { UserService } from '../user/user.service';
import type { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@Controller()
@ApiTags('Course Pages')
export class CoursePagesController {
  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private http: HttpService,
    private jwtService: JwtService,
  ) {}

  @Get('browse')
  @ApiOperation({ summary: 'Show browse courses page' })
  @ApiQuery({ name: 'query', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @Render('browse')
  async browseCoursesPage(@Req() req: any, @Query('query') searchQuery?: string, @Query('page') page = '1') {
    try {
      const token = req?.cookies?.token;
      let user: any = null;

      // Get user if logged in
      if (token) {
        try {
          const userRes = await firstValueFrom(
            this.http.get('http://api.railway.internal:3000/api/auth/self', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          );
          // Extract user data from the new response format
          const responseData = userRes.data;
          if (responseData.status === 'success' && responseData.data) {
            user = responseData.data;
          }
        } catch (error) {
          // User not authenticated, continue without user data
          console.log('User not authenticated, showing public view');
        }
      }

      // Get courses using direct service call
      const { data: courses, total, totalPages } = await this.courseService.findAll(
        parseInt(page),
        15, // limit
        searchQuery,
        user?.id // Exclude courses already purchased by this user
      );

      const pagination = {
        current_page: Number(page),
        total_pages: totalPages,
        total_items: total,
      };

      return {
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        username: user?.username || null,
        balance: user?.balance || 0,
        courses: courses || [],
        query: searchQuery || '',
        pagination: pagination,
        hasResults: courses.length > 0,
        searchPerformed: !!searchQuery && searchQuery.trim().length > 0,
        isLoggedIn: !!user,
        showingAvailableOnly: !!user // Show message that purchased courses are filtered out
      };
    } catch (error) {
      console.error('Error fetching courses:', error.message);
      return {
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        message: 'Error loading courses',
        query: searchQuery || '',
        courses: [],
        pagination: { current_page: 1, total_pages: 0, total_items: 0 },
        isLoggedIn: false,
        showingAvailableOnly: false
      };
    }
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Show course details page' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @Render('course-details')
  async showCourseDetails(@Param('id') courseId: string, @Req() req: any) {
    try {
      // Get user data if authenticated
      const user = await this.getCurrentUser(req);
      
      // Get course data based on user authentication status
      const course = await this.getCourseData(courseId, user);
      
      if (!course) {
        return this.renderErrorPage('Course not found or unavailable');
      }
      
      // Check if user has purchased the course
      const isPurchased = user ? await this.courseService.hasUserPurchasedCourse(user.id, courseId) : false;
      
      return {
        pageTitle: course.title || 'Course Details',
        currentPage: 'course-details',
        course,
        user,
        username: user?.username || null,
        balance: user?.balance || 0,
        isPurchased,
        is_admin: user?.is_admin || false,
      };
    } catch (error) {
      console.error('Error fetching course details:', error.message);
      return this.renderErrorPage('Course not found or unavailable');
    }
  }

  /**
   * Helper method to get current user from request
   */
  private async getCurrentUser(req: any): Promise<any> {
    const token = req.cookies?.token;
    
    if (!token) {
      return null;
    }
    
    try {
      const decoded = this.jwtService.verify(token);
      return await this.userService.findById(decoded.sub);
    } catch (error) {
      console.log('Token verification failed, continuing as guest');
      return null;
    }
  }

  /**
   * Helper method to get course data based on user context
   */
  private async getCourseData(courseId: string, user: any): Promise<any> {
    try {
      let course: any;
      
      // If user is authenticated, get course with modules and progress
      if (user) {
        course = await this.courseService.findByIdWithModulesAndProgress(courseId, user.id);
        
        if (course) {
          // Get progress summary for the authenticated user
          try {
            const progressSummary = await this.courseService.getCourseProgressSummary(courseId, user.id);
            course.progress_summary = progressSummary;
          } catch (error) {
            // User might not have purchased the course, that's ok
            console.log('No progress found for user, continuing without progress data');
          }
        }
      } else {
        // For guest users, get basic course info
        const courseResult = await this.courseService.findById(courseId);
        course = courseResult.status === 'success' ? courseResult.data : null;
      }
      
      return course;
    } catch (error) {
      console.error('Error fetching course data:', error.message);
      return null;
    }
  }

  /**
   * Helper method to render error page with consistent structure
   */
  private renderErrorPage(errorMessage: string) {
    return {
      pageTitle: 'Course Not Found',
      currentPage: 'course-details',
      error: errorMessage,
      user: null,
      username: null,
      balance: 0,
      is_admin: false,
    };
  }

  @Get('courses/:id/modules')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Show course modules page' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @Render('course-modules')
  async showCourseModules(@Param('id') courseId: string, @Req() req: any, @Query() query: any) {
    const user = req.user; // User is attached by the guard

    try {
      // Get course details directly from service
      const course = await this.courseService.findById(courseId);
      if (course.status !== 'success' || !course.data) {
        throw new Error(course.message || 'Course not found');
      }
      
      // Get course modules with completion status using service method
      const modulesResult = await this.courseService.getCourseModulesWithPagination(
        courseId,
        parseInt(query.page) || 1,
        parseInt(query.limit) || 10,
        user.id
      );
      
      const modules = modulesResult.data;
      
      const pagination = {
        current_page: parseInt(query.page) || 1,
        total_pages: modulesResult.totalPages,
        total_items: modulesResult.total
      };
      
      // Get accurate progress summary from service
      let progress = {
        total: 0,
        completed: 0,
        percentage: 0
      };
      
      try {
        const progressSummary = await this.courseService.getCourseProgressSummary(courseId, user.id);
        progress = {
          total: progressSummary.total_modules,
          completed: progressSummary.completed_modules,
          percentage: progressSummary.progress_percentage
        };
      } catch (error) {
        // User might not own the course, use basic count
        progress = {
          total: modulesResult.total,
          completed: 0,
          percentage: 0
        };
      }
      
      return {
        pageTitle: `${course.data.title} - Modules`,
        currentPage: 'course-modules',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        course: course.data,
        modules: modules,
        progress: progress,
        currentPageNum: pagination.current_page,
        totalPages: pagination.total_pages,
        total: pagination.total_items,
      };
    } catch (error) {
      console.error('Error fetching course modules:', error.message);
      return {
        pageTitle: 'Course Modules',
        currentPage: 'course-modules',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        error: 'Error loading course modules',
      };
    }
  }

  @Get('my-courses')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Show my courses page' })
  @Render('my-courses')
  async myCoursesPage(@Req() req: any) {
    const user = req.user; // User is attached by the guard

    try {
      // Get user's courses from service (now returns standardized format)
      const myCoursesResult = await this.courseService.findMyCourses(user.id);

      // Check if the service call was successful
      if (myCoursesResult.status === 'error') {
        throw new Error(myCoursesResult.message);
      }

      const myCourses = myCoursesResult.data || [];

      // Calculate statistics for the template
      const courseCount = myCourses.length;
      const inProgressCount = myCourses.filter(course => course.progress_percentage > 0 && course.progress_percentage < 100).length;
      const completedCount = myCourses.filter(course => course.progress_percentage === 100).length;
      const certificatesCount = completedCount; // Assuming completed courses have certificates

      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        courses: myCourses,
        courseCount,
        inProgressCount,
        completedCount,
        certificatesCount,
      };
    } catch (error) {
      console.error('Error fetching my courses:', error.response?.data || error.message);
      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        message: 'Error loading your courses',
      };
    }
  }

  @Get('my-courses/:courseId/continue')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Continue learning from last visited module' })
  @ApiParam({ name: 'courseId', type: String, description: 'Course ID' })
  async continueCourseLearning(@Param('courseId') courseId: string, @Req() req: any, @Res() res: Response) {
    const user = req.user; // User is attached by the guard

    try {
      // Get course progress summary directly from service
      const progressSummary = await this.courseService.getCourseProgressSummary(courseId, user.id);
      const nextModuleId = progressSummary?.next_module_id;
      
      if (!nextModuleId) {
        // No next module available, redirect to course modules page
        return res.redirect(`/my-courses/${courseId}/modules`);
      }
      // Redirect to the next module
      return res.redirect(`/modules/${nextModuleId}`);
    } catch (error) {
      console.error('Error getting next module:', error.message);
      // Show error on my-courses page instead of logging out
      return res.render('my-courses', {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        error: 'Error loading course modules. Please try again.',
      });
    }
  }

  @Get('my-courses/:courseId/modules')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Show modules for a course in my courses page' })
  @ApiParam({ name: 'courseId', type: String, description: 'Course ID' })
  @Render('my-courses')
  async myCoursesWithModules(@Param('courseId') courseId: string, @Req() req: any) {
    const user = req.user; // User is attached by the guard

    try {
      // Get user's courses from service (now returns standardized format)
      const myCoursesResult = await this.courseService.findMyCourses(user.id);
      
      // Check if the service call was successful
      if (myCoursesResult.status === 'error') {
        throw new Error(myCoursesResult.message);
      }

      const myCourses = myCoursesResult.data || [];
      
      // Get modules for the specific course
      const modules = await this.courseService.getCourseModules(courseId);
      
      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        courses: myCourses,
        selectedCourseId: courseId,
        modules: modules,
      };
    } catch (error) {
      console.error('Error fetching course modules:', error.message);
      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        error: 'Error loading course modules. Please try again.',
      };
    }
  }

  @Post('buy/:id')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Buy course by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  async buyCourse(@Param('id') courseId: string, @Req() req: any, @Res() res: Response) {
    const user = req.user; // User is attached by the guard

    try {
      // Use course service to buy course directly
      await this.courseService.buyCourse(courseId, user.id);
      
      // Success: redirect to my-courses
      return res.redirect('/my-courses');
    } catch (error) {
      console.error('Error buying course:', error.message);
      
      // Get the actual error message
      let errorMessage = 'Failed to purchase course';
      if (error.message) {
        errorMessage = error.message;
      }

      // Get courses list to show browse page with error
      try {
        // Get available courses directly from service (excluding purchased ones)
        const courses = await this.courseService.findAll(1, 10, undefined, user.id);

        return res.render('browse', { 
          pageTitle: 'Browse Courses',
          currentPage: 'browse',
          username: user.username,
          balance: user.balance,
          is_admin: user.is_admin || false,
          error: errorMessage,
          courses: courses.data || []
        });
      } catch (coursesError) {
        return res.render('browse', { 
          pageTitle: 'Browse Courses',
          currentPage: 'browse',
          username: user.username,
          balance: user.balance,
          is_admin: user.is_admin || false,
          error: errorMessage,
          courses: [] 
        });
      }
    }
  }

  @Post('buy-course')
  @UseGuards(CookieAuthGuard)
  @ApiOperation({ summary: 'Buy course via form' })
  async buyCourseFromForm(@Body() body: any, @Req() req: any, @Res() res: Response) {
    const { courseId } = body;
    const user = req.user; // User is attached by the guard

    if (!courseId) {
      return res.render('browse', { 
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        username: user.username,
        balance: user.balance,
        is_admin: user.is_admin || false,
        error: 'Course ID is required',
        courses: [] 
      });
    }

    try {
      // Use course service to buy course directly
      await this.courseService.buyCourse(courseId, user.id);
      
      // Success: redirect to my-courses
      return res.redirect('/my-courses');
    } catch (error) {
      console.error('Error buying course:', error.message);
      
      // Get the actual error message
      let errorMessage = 'Failed to purchase course';
      if (error.message) {
        errorMessage = error.message;
      }

      // Get courses list to show browse page with error
      try {
        const courses = await this.courseService.findAll(1, 10, undefined, user.id);

        return res.render('browse', { 
          pageTitle: 'Browse Courses',
          currentPage: 'browse',
          username: user.username,
          balance: user.balance,
          is_admin: user.is_admin || false,
          error: errorMessage,
          courses: courses.data || []
        });
      } catch (coursesError) {
        return res.render('browse', { 
          pageTitle: 'Browse Courses',
          currentPage: 'browse',
          username: user.username,
          balance: user.balance,
          is_admin: user.is_admin || false,
          error: errorMessage,
          courses: [] 
        });
      }
    }
  }
}
