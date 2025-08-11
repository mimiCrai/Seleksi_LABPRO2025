import { Body, Controller, Get, Post, UseGuards, Query, Param, Req, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { Course } from './entities/course/course';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

import { UpdateCourseDto } from './dto/update-course.dto';



@Controller('api/courses')
@ApiTags('Courses')
@ApiBearerAuth()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Admin only — sementara kita belum pakai RoleGuard
  @Post()
  @ApiOperation({ summary: 'Create a new course (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        instructor: { type: 'string' },
        topics: { type: 'array', items: { type: 'string' } },
        price: { type: 'number' },
        thumbnail_image: { type: 'string' }
      },
      required: ['title', 'description', 'instructor', 'price']
    }
  })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  create(@Body() body: Partial<Course>) {
    return this.courseService.create(body);
  }



  @Post(':id/buy')
  @ApiOperation({ summary: 'Buy a course' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course purchased successfully' })
  @ApiResponse({ status: 409, description: 'Already purchased' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  @UseGuards(AuthGuard('jwt'))
  async buy(@Param('id') id: string, @Req() req: any) {
    return this.courseService.buyCourse(id, req.user.userId);
  }

  
  

  // Public
  @Get()
  @ApiOperation({ summary: 'Get list of courses' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '15',
    @Query('q') q?: string,
  ) {
    const { data, total, totalPages } = await this.courseService.findAll(
      parseInt(page),
      parseInt(limit),
      q,
    );

    return {
      status: 'success',
      message: 'Courses fetched',
      data,
      pagination: {
        current_page: Number(page),
        total_pages: totalPages,
        total_items: total,
      },
    };
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Get my purchased courses' })
  @ApiResponse({ status: 200, description: 'My courses fetched' })
    @UseGuards(AuthGuard('jwt'))
    async getMyCourses(@Req() req: any) {
    const courses = await this.courseService.findMyCourses(req.user.userId);
    return {
      status: 'success',
      message: 'My courses fetched',
      data: courses,
    };
    }

  // Get single course by ID (Public - no auth required for basic course info)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single course by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Course details fetched successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Course fetched successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            instructor: { type: 'string' },
            topics: { type: 'array', items: { type: 'string' } },
            price: { type: 'number' },
            thumbnail_image: { type: 'string', nullable: true },
            total_modules: { type: 'number' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(@Param('id') id: string) {
    const course = await this.courseService.findById(id);
    return {
      status: 'success',
      message: 'Course fetched successfully',
      data: course,
    };
  }

  // Get course details with modules (for course details page)
  @Get(':id/details')
  @ApiOperation({ summary: 'Get course details with all modules' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Course details with modules fetched successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Course details fetched successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            instructor: { type: 'string' },
            topics: { type: 'array', items: { type: 'string' } },
            price: { type: 'number' },
            thumbnail_image: { type: 'string', nullable: true },
            total_modules: { type: 'number' },
            modules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  order: { type: 'number' },
                  is_completed: { type: 'boolean' }
                }
              }
            },
            progress_summary: {
              type: 'object',
              properties: {
                total_modules: { type: 'number' },
                completed_modules: { type: 'number' },
                progress_percentage: { type: 'number' },
                next_module_id: { type: 'string', nullable: true },
                is_completed: { type: 'boolean' }
              }
            },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseDetailsWithModules(@Param('id') id: string, @Req() req: any) {
    // Check if user is authenticated (optional)
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // Try to verify the token and get user ID
        const jwt = require('jsonwebtoken');
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.sub;
      } catch (error) {
        // Invalid or expired token, proceed as unauthenticated user
        userId = null;
      }
    }
    
    // Get course with modules
    const course = await this.courseService.findByIdWithModules(id, userId || undefined);
    
    // Get progress summary only if user is authenticated and owns the course
    let progressSummary: any = null;
    if (userId) {
      try {
        progressSummary = await this.courseService.getCourseProgressSummary(id, userId);
      } catch (error) {
        // User doesn't own the course, that's ok
      }
    }

    return {
      status: 'success',
      message: 'Course details fetched successfully',
      data: {
        ...course,
        progress_summary: progressSummary
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        instructor: { type: 'string' },
        topics: { type: 'array', items: { type: 'string' } },
        price: { type: 'number' },
        thumbnail_image: { type: 'string', nullable: true }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Course updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Course updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            instructor: { type: 'string' },
            topics: { type: 'array', items: { type: 'string' } },
            price: { type: 'number' },
            thumbnail_image: { type: 'string', nullable: true },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async updateCourse(@Param('id') id: string, @Body() body: UpdateCourseDto) {
    const course = await this.courseService.update(id, body);
    return {
      status: 'success',
      message: 'Course updated successfully',
      data: course,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Course ID' })
  @ApiResponse({ status: 204, description: 'Course deleted successfully (No Content)' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async deleteCourse(@Param('id') id: string) {
    await this.courseService.delete(id);
    // Return 204 No Content status
    return;
  }


}
