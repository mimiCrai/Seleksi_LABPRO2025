import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  Redirect,
  Res,
  Req,
  Param,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from './auth/admin.guard';
import { AuthService } from './auth/auth.service';
import type { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
@ApiTags('Pages')
export class PagesController {
  constructor(
    private authService: AuthService,
    private http: HttpService,
  ) {}

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
    try {
      await this.authService.register(body);
      return res.redirect('/login');
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed, please try again';
      if (err.message && err.message.includes('already exists')) {
        errorMessage = 'Username or email already exists';
      }
      return res.render('register', { 
        pageTitle: 'Register',
        currentPage: 'register',
        error: errorMessage 
      });
    }
  }
  @Post('buy/:id')
  async buyCourse(@Param('id') courseId: string, @Req() req: any, @Res() res: Response) {
    const token = req.cookies?.token;
    if (!token) {
      return res.render('browse', { 
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        error: 'Please login first',
        courses: [] 
      });
    }

    try {
      await firstValueFrom(
        this.http.post(`http://localhost:3000/api/courses/${courseId}/buy`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      
      // Success: redirect to my-courses
      return res.redirect('/my-courses');
    } catch (error) {
      console.error('Error buying course:', error.response?.data || error.message);
      
      // Get the actual error message
      let errorMessage = 'Failed to purchase course';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Get courses list to show browse page with error
      try {
        // Get user profile for layout
        const userRes = await firstValueFrom(
          this.http.get('http://localhost:3000/api/auth/self', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );

        const user = userRes.data;

        const coursesRes = await firstValueFrom(
          this.http.get('http://localhost:3000/api/courses', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );

        return res.render('browse', { 
          pageTitle: 'Browse Courses',
          currentPage: 'browse',
          username: user.username,
          balance: user.balance,
          error: errorMessage,
          courses: coursesRes.data.data 
        });
      } catch (coursesError) {
        return res.render('browse', { 
          pageTitle: 'Browse Courses',
          currentPage: 'browse',
          error: errorMessage,
          courses: [] 
        });
      }
    }
  }

  @Post('buy-course')
  async buyCourseFromForm(@Body() body: any, @Req() req: any, @Res() res: Response) {
    const { courseId } = body;
    const token = req.cookies?.token;
    
    if (!token) {
      return res.render('browse', { 
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        error: 'Please login first',
        courses: [] 
      });
    }

    if (!courseId) {
      return res.render('browse', { 
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        error: 'Course ID is required',
        courses: [] 
      });
    }

    try {
      await firstValueFrom(
        this.http.post(`http://localhost:3000/api/courses/${courseId}/buy`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      
      // Success: redirect to my-courses
      return res.redirect('/my-courses');
    } catch (error) {
      console.error('Error buying course:', error.response?.data || error.message);
      
      // Get the actual error message
      let errorMessage = 'Failed to purchase course';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Get courses list to show browse page with error
      try {
        // Get user profile for layout
        const userRes = await firstValueFrom(
          this.http.get('http://localhost:3000/api/auth/self', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );

        const user = userRes.data;

        const coursesRes = await firstValueFrom(
          this.http.get('http://localhost:3000/api/courses', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );

        return res.render('browse', { 
          pageTitle: 'Browse Courses',
          currentPage: 'browse',
          username: user.username,
          balance: user.balance,
          error: errorMessage,
          courses: coursesRes.data.data 
        });
      } catch (coursesError) {
        return res.render('browse', { 
          pageTitle: 'Browse Courses',
          currentPage: 'browse',
          error: errorMessage,
          courses: [] 
        });
      }
    }
  }

  @Get('login')
  @ApiOperation({ summary: 'Show login page' })
  @Render('login')
  showLogin() {
    return {
      pageTitle: 'Login',
      currentPage: 'login'
    };
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
  async doLogin(@Body() body: any, @Res() res: Response) {
    try {
      const result = await this.authService.login(body.identifier, body.password);

      // Simpan token di cookie
      res.cookie('token', result.token, { httpOnly: true });
      return res.redirect('/dashboard');
    } catch (err) {
      return res.render('login', { 
        pageTitle: 'Login',
        currentPage: 'login',
        error: 'Login failed, please try again' 
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

  @Get('dashboard')
  @ApiOperation({ summary: 'Show dashboard page' })
  @Render('dashboard')
  async showDashboard(@Req() req: any) {
    const token = req.cookies?.token;
    
    if (!token) {
      return {
        pageTitle: 'Dashboard',
        currentPage: 'dashboard',
        message: 'Please login first',
      };
    }

    try {
      // Get user profile from API
      const userRes = await firstValueFrom(
        this.http.get('http://localhost:3000/api/auth/self', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const user = userRes.data;

      return {
        pageTitle: 'Dashboard',
        currentPage: 'dashboard',
        username: user.username,
        balance: user.balance,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      return {
        pageTitle: 'Dashboard',
        currentPage: 'dashboard',
        message: 'Error loading dashboard',
      };
    }
  }

  @Get('browse')
  @ApiOperation({ summary: 'Show browse courses page' })
  @ApiQuery({ name: 'query', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @Render('browse')
  async browseCoursesPage(@Req() req: any, @Query('query') searchQuery?: string, @Query('page') page = '1') {
    const token = req.cookies?.token;
    
    if (!token) {
      return {
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        message: 'Please login first'
      };
    }

    try {
      // Get user profile first
      const userRes = await firstValueFrom(
        this.http.get('http://localhost:3000/api/auth/self', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const user = userRes.data;

      // Prepare search parameters
      const queryParams = new URLSearchParams({
        page: page,
        limit: '15'
      });
      
      // Add search query if provided
      if (searchQuery && searchQuery.trim()) {
        queryParams.append('q', searchQuery.trim());
      }

      // Get courses with search
      const coursesRes = await firstValueFrom(
        this.http.get(`http://localhost:3000/api/courses?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const courses = coursesRes.data.data || [];
      const pagination = coursesRes.data.pagination || {};

      return {
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        username: user.username,
        balance: user.balance,
        courses: courses,
        query: searchQuery || '',
        pagination: pagination,
        hasResults: courses.length > 0,
        searchPerformed: !!searchQuery && searchQuery.trim().length > 0
      };
    } catch (error) {
      console.error('Error fetching courses:', error.response?.data || error.message);
      return {
        pageTitle: 'Browse Courses',
        currentPage: 'browse',
        message: 'Error loading courses',
        query: searchQuery || ''
      };
    }
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Show my courses page' })
  @Render('my-courses')
  async myCoursesPage(@Req() req: any) {
    const token = req.cookies?.token;
    
    if (!token) {
      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        message: 'Please login first'
      };
    }

    try {
      // Get user profile first
      const userRes = await firstValueFrom(
        this.http.get('http://localhost:3000/api/auth/self', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const user = userRes.data;

      // Get user's courses
      const myCoursesRes = await firstValueFrom(
        this.http.get('http://localhost:3000/api/courses/my-courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const myCourses = myCoursesRes.data.data || [];

      // Get detailed course information including next module for each course
      const coursesWithDetails = await Promise.all(
        myCourses.map(async (course) => {
          try {
            const detailsRes = await firstValueFrom(
              this.http.get(`http://localhost:3000/api/courses/${course.id}/details`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }),
            );
            const courseDetails = detailsRes.data.data;
            return {
              ...course,
              next_module_id: courseDetails.progress_summary?.next_module_id || null,
              is_completed: courseDetails.progress_summary?.is_completed || false
            };
          } catch (error) {
            console.error(`Error getting details for course ${course.id}:`, error.message);
            return {
              ...course,
              next_module_id: null,
              is_completed: false
            };
          }
        })
      );

      // Calculate statistics for the template
      const courseCount = coursesWithDetails.length;
      const inProgressCount = coursesWithDetails.filter(course => course.progress_percentage > 0 && course.progress_percentage < 100).length;
      const completedCount = coursesWithDetails.filter(course => course.progress_percentage === 100).length;
      const certificatesCount = completedCount; // Assuming completed courses have certificates

      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        username: user.username,
        balance: user.balance,
        courses: coursesWithDetails,
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
        message: 'Error loading your courses',
      };
    }
  }

  @Get('my-courses/:courseId/continue')
  @ApiOperation({ summary: 'Continue learning from last visited module' })
  @ApiParam({ name: 'courseId', type: String, description: 'Course ID' })
  async continueCourseLearning(@Param('courseId') courseId: string, @Req() req: any, @Res() res: Response) {
    const token = req.cookies?.token;
  let user: any = null;
    if (token) {
      try {
        const userRes = await firstValueFrom(
          this.http.get('http://localhost:3000/api/auth/self', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );
        user = userRes.data;
      } catch (err) {
        // Token invalid or expired
        user = null;
      }
    }

    if (!user) {
      // Show friendly error instead of redirecting immediately
      return res.render('my-courses', {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        error: 'Session expired or not logged in. Please login again.',
      });
    }

    try {
      // Get course details with next module
      const detailsRes = await firstValueFrom(
        this.http.get(`http://localhost:3000/api/courses/${courseId}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      const courseDetails = detailsRes.data.data;
      const nextModuleId = courseDetails.progress_summary?.next_module_id;
      if (!nextModuleId) {
        // No next module available, redirect to course modules page
        return res.redirect(`/my-courses/${courseId}/modules`);
      }
      // Redirect to the next module
      return res.redirect(`/modules/${nextModuleId}`);
    } catch (error) {
      console.error('Error getting next module:', error.response?.data || error.message);
      // Show error on my-courses page instead of logging out
      return res.render('my-courses', {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        error: 'Error loading course modules. Please try again.',
      });
    }
  }

  @Get('my-courses/:courseId/modules')
  @ApiOperation({ summary: 'Show modules for a course in my courses page' })
  @ApiParam({ name: 'courseId', type: String, description: 'Course ID' })
  @Render('my-courses')
  async myCoursesWithModules(@Param('courseId') courseId: string, @Req() req: any) {
    const token = req.cookies?.token;
  let user: any = null;
    if (token) {
      try {
        const userRes = await firstValueFrom(
          this.http.get('http://localhost:3000/api/auth/self', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        );
        user = userRes.data;
      } catch (err) {
        user = null;
      }
    }

    if (!user) {
      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        error: 'Session expired or not logged in. Please login again.',
      };
    }

    try {
      // Get user's courses
      const myCoursesRes = await firstValueFrom(
        this.http.get('http://localhost:3000/api/courses/my-courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      const myCourses = myCoursesRes.data.data || [];
      // Get modules for the specific course
      const modulesRes = await firstValueFrom(
        this.http.get(`http://localhost:3000/api/courses/${courseId}/modules`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      const modules = modulesRes.data.data || [];
      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        username: user.username,
        balance: user.balance,
        courses: myCourses,
        selectedCourseId: courseId,
        modules: modules,
      };
    } catch (error) {
      console.error('Error fetching course modules:', error.response?.data || error.message);
      return {
        pageTitle: 'My Courses',
        currentPage: 'my-courses',
        error: 'Error loading course modules. Please try again.',
      };
    }
  }

  @Post('modules/:moduleId/complete')
  @ApiOperation({ summary: 'Mark module as completed (form)' })
  @ApiParam({ name: 'moduleId', type: String, description: 'Module ID' })
  async completeModule(@Param('moduleId') moduleId: string, @Req() req: any, @Res() res: Response) {
    const token = req.cookies?.token;
    
    if (!token) {
      return res.redirect('/login');
    }

    try {
      await firstValueFrom(
        this.http.post(`http://localhost:3000/api/modules/${moduleId}/complete`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      
      // Redirect back to my-courses
      return res.redirect('/my-courses');
    } catch (error) {
      console.error('Error completing module:', error.response?.data || error.message);
      return res.redirect('/my-courses');
    }
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Show course details page' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @Render('course-details')
  async showCourseDetails(@Param('id') courseId: string, @Req() req: any) {
    const token = req.cookies?.token;
    
    try {
      let user: any = null;
      let course: any = null;
      let isPurchased = false;
      
      if (token) {
        try {
          // Get user profile
          const userRes = await firstValueFrom(
            this.http.get('http://localhost:3000/api/auth/self', {
              headers: { Authorization: `Bearer ${token}` },
            }),
          );
          user = userRes.data;
          
          // Get course details with modules and progress
          const courseDetailsRes = await firstValueFrom(
            this.http.get(`http://localhost:3000/api/courses/${courseId}/details`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          );
          course = courseDetailsRes.data.data;
          
          // Check if user has progress summary (means they purchased it)
          isPurchased = course && course.progress_summary !== null;
          
        } catch (err) {
          // If detailed endpoint fails, fall back to basic course info
          const courseRes = await firstValueFrom(
            this.http.get(`http://localhost:3000/api/courses/${courseId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          );
          course = courseRes.data.data;
        }
      } else {
        // No auth, get basic course info
        try {
          const courseRes = await firstValueFrom(
            this.http.get(`http://localhost:3000/api/courses/${courseId}`, {
              headers: {},
            }),
          );
          course = courseRes.data.data;
        } catch (err) {
          // Handle unauthenticated access
        }
      }
      
      if (!course) {
        return {
          pageTitle: 'Course Not Found',
          currentPage: 'course-details',
          error: 'Course not found or unavailable',
        };
      }
      
      return {
        pageTitle: course.title || 'Course Details',
        currentPage: 'course-details',
        course: course,
        user: user,
        balance: user?.balance || 0,
        isPurchased: isPurchased,
      };
    } catch (error) {
      console.error('Error fetching course details:', error.response?.data || error.message);
      return {
        pageTitle: 'Course Not Found',
        currentPage: 'course-details',
        error: 'Course not found or unavailable',
      };
    }
  }

  @Get('courses/:id/modules')
  @ApiOperation({ summary: 'Show course modules page' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @Render('course-modules')
  async showCourseModules(@Param('id') courseId: string, @Req() req: any, @Query() query: any) {
    const token = req.cookies?.token;
    
    if (!token) {
      return {
        pageTitle: 'Course Modules',
        currentPage: 'course-modules',
        error: 'Please login to view course modules',
      };
    }

    try {
      // Get course details
      const courseRes = await firstValueFrom(
        this.http.get(`http://localhost:3000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      
      // Get course modules with progress
      const modulesRes = await firstValueFrom(
        this.http.get(`http://localhost:3000/api/courses/${courseId}/modules`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: query.page || 1,
            limit: query.limit || 10,
          },
        }),
      );
      
      // Get user progress for this course
      const progressRes = await firstValueFrom(
        this.http.get(`http://localhost:3000/api/users/courses/${courseId}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      
      const course = courseRes.data;
      const { data: modules, total, page, totalPages } = modulesRes.data;
      const progress = progressRes.data;
      
      return {
        pageTitle: `${course.course_name} - Modules`,
        currentPage: 'course-modules',
        course: course,
        modules: modules,
        progress: progress,
        currentPageNum: page,
        totalPages: totalPages,
        total: total,
      };
    } catch (error) {
      console.error('Error fetching course modules:', error.response?.data || error.message);
      return {
        pageTitle: 'Course Modules',
        currentPage: 'course-modules',
        error: 'Error loading course modules',
      };
    }
  }

  @Get('modules/:id')
  @ApiOperation({ summary: 'Show module learning page' })
  @ApiParam({ name: 'id', type: String, description: 'Module ID' })
  @Render('module-learning')
  async showModuleLearning(@Param('id') moduleId: string, @Req() req: any) {
    const token = req.cookies?.token;
    
    if (!token) {
      return {
        pageTitle: 'Module Learning',
        currentPage: 'module-learning',
        error: 'Please login to access modules',
      };
    }

    try {
      // Get module details
      const moduleRes = await firstValueFrom(
        this.http.get(`http://localhost:3000/api/modules/${moduleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      
      // Get user progress for this module
      const progressRes = await firstValueFrom(
        this.http.get(`http://localhost:3000/api/users/modules/${moduleId}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      
      const module = moduleRes.data;
      const progress = progressRes.data;
      
      return {
        pageTitle: module.title,
        currentPage: 'module-learning',
        module: module,
        progress: progress,
        isCompleted: progress?.completed || false,
      };
    } catch (error) {
      console.error('Error fetching module details:', error.response?.data || error.message);
      return {
        pageTitle: 'Module Not Found',
        currentPage: 'module-learning',
        error: 'Module not found or unavailable',
      };
    }
  }

  @Get('profile')
  @ApiOperation({ summary: 'Show user profile page' })
  @Render('profile')
  async showProfile(@Req() req: any) {
    const token = req.cookies?.token;
    
    if (!token) {
      return {
        pageTitle: 'Profile',
        currentPage: 'profile',
        error: 'Please login to view your profile',
      };
    }

    try {
      // Get user profile
      const userRes = await firstValueFrom(
        this.http.get('http://localhost:3000/api/auth/self', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      
      // Get user statistics
      const statsRes = await firstValueFrom(
        this.http.get('http://localhost:3000/api/users/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      
      const user = userRes.data;
      const stats = statsRes.data;
      
      return {
        pageTitle: 'My Profile',
        currentPage: 'profile',
        user: user,
        courseCount: stats.courseCount || 0,
        completedModules: stats.completedModules || 0,
        certificates: stats.certificates || 0,
        recentActivity: stats.recentActivity || [],
      };
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      return {
        pageTitle: 'Profile',
        currentPage: 'profile',
        error: 'Error loading profile data',
      };
    }
  }

  @Get('certificates')
  @ApiOperation({ summary: 'Show user certificates page' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @Render('certificates')
  async showCertificates(@Req() req: any, @Query() query: any) {
    const token = req.cookies?.token;
    
    if (!token) {
      return {
        pageTitle: 'Certificates',
        currentPage: 'certificates',
        error: 'Please login to view your certificates',
      };
    }

    try {
      // Get user certificates
      const certificatesRes = await firstValueFrom(
        this.http.get('http://localhost:3000/api/users/certificates', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: query.page || 1,
            limit: query.limit || 12,
          },
        }),
      );
      
      const { data: certificates, total, page, totalPages } = certificatesRes.data;
      
      // Calculate statistics
      const uniqueCourses = new Set(certificates.map(cert => cert.course_id)).size;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const recentCertificates = certificates.filter(cert => 
        new Date(cert.completed_at) >= thisMonth
      ).length;
      
      const totalScore = certificates.reduce((sum, cert) => sum + (cert.score || 0), 0);
      
      return {
        pageTitle: 'My Certificates',
        currentPage: 'certificates',
        certificates: certificates,
        currentPageNum: page,
        totalPages: totalPages,
        total: total,
        uniqueCourses: uniqueCourses,
        recentCertificates: recentCertificates,
        totalScore: Math.round(totalScore / certificates.length) || 0,
      };
    } catch (error) {
      console.error('Error fetching certificates:', error.response?.data || error.message);
      return {
        pageTitle: 'Certificates',
        currentPage: 'certificates',
        error: 'Error loading certificates',
      };
    }
  }

  @Get('admin')
  @ApiOperation({ summary: 'Show admin dashboard (Admin only)' })
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Render('admin')
  showAdmin(@Req() req: any) {
    try {
      return {
        pageTitle: 'Admin Dashboard',
        currentPage: 'admin',
        username: req.user?.username,
        is_admin: req.user?.is_admin,
      };
    } catch (error) {
      return {
        pageTitle: 'Admin Dashboard',
        currentPage: 'admin',
        error: 'Error loading admin dashboard',
      };
    }
  }
}
