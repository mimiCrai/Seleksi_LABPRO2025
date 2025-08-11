import { Controller, Post, UseGuards, Param, Req, Get, Put, Delete, Body, HttpCode, HttpStatus, UseInterceptors, UploadedFiles, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CourseService } from './course.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api')
@ApiTags('Modules')
@ApiBearerAuth()
export class ModuleController {
  constructor(private readonly courseService: CourseService) {}

  // Add module to course (Admin only)
  @Post('courses/:courseId/modules')
  @ApiOperation({ summary: 'Add module to course (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'courseId', type: String, description: 'Course ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        pdf_content: { type: 'string', format: 'binary', nullable: true, description: 'PDF file' },
        video_content: { type: 'string', format: 'binary', nullable: true, description: 'Video file' }
      },
      required: ['title', 'description']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Module added to course',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Module added to course' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            course_id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            order: { type: 'number' },
            pdf_content: { type: 'string', nullable: true },
            video_content: { type: 'string', nullable: true },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        }
      }
    }
  })
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'pdf_content', maxCount: 1 },
    { name: 'video_content', maxCount: 1 }
  ]))
  async addModule(
    @Param('courseId') courseId: string,
    @Body() body: { title: string; description: string },
    @UploadedFiles() files: { pdf_content?: any[], video_content?: any[] }
  ) {
    const savedModule = await this.courseService.addModuleToCourse(
      courseId, 
      { title: body.title, description: body.description }, 
      files
    );
    
    return {
      status: 'success',
      message: 'Module added to course',
      data: {
        id: savedModule.id,
        course_id: savedModule.course.id,
        title: savedModule.title,
        description: savedModule.description,
        order: savedModule.order,
        pdf_content: savedModule.pdf_content,
        video_content: savedModule.video_content,
        created_at: savedModule.created_at,
        updated_at: savedModule.updated_at
      },
    };
  }

  // Reorder modules in a course (Admin only)
  @Patch('courses/:courseId/modules/reorder')
  @ApiOperation({ summary: 'Reorder modules in a course (Admin only)' })
  @ApiParam({ name: 'courseId', type: String, description: 'Course ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        module_order: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              order: { type: 'number' }
            },
            required: ['id', 'order']
          }
        }
      },
      required: ['module_order']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Modules reordered successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Modules reordered successfully' },
        data: {
          type: 'object',
          properties: {
            module_order: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  order: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Some modules do not belong to this course' })
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async reorderModules(
    @Param('courseId') courseId: string,
    @Body() body: { module_order: { id: string; order: number }[] }
  ) {
    const result = await this.courseService.reorderModules(courseId, body.module_order);
    return {
      status: 'success',
      message: 'Modules reordered successfully',
      data: {
        module_order: result
      },
    };
  }

  // Get all modules for a course (Public for browsing)
  @Get('courses/:courseId/modules')
  @ApiOperation({ summary: 'Get all modules for a course' })
  @ApiParam({ name: 'courseId', type: String, description: 'Course ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 15, max: 50)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Course modules fetched',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Course modules fetched' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              course_id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              order: { type: 'number' },
              pdf_content: { type: 'string', nullable: true },
              video_content: { type: 'string', nullable: true },
              is_completed: { type: 'boolean' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            current_page: { type: 'number' },
            total_pages: { type: 'number' },
            total_items: { type: 'number' }
          }
        }
      }
    }
  })
  async getCourseModules(
    @Param('courseId') courseId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '15',
    @Req() req: any
  ) {
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // max 50
    
    // Check if user is authenticated (optional)
    let userId: string | undefined = undefined;
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
        userId = undefined;
      }
    }
    
    const result = await this.courseService.getCourseModulesWithPagination(
      courseId, 
      pageNum, 
      limitNum, 
      userId
    );
    
    return {
      status: 'success',
      message: 'Course modules fetched',
      data: result.data,
      pagination: {
        current_page: pageNum,
        total_pages: result.totalPages,
        total_items: result.total
      }
    };
  }

  // Get a specific module
  @Get('modules/:id')
  @ApiOperation({ summary: 'Get a specific module' })
  @ApiParam({ name: 'id', type: String, description: 'Module ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Module fetched successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Module fetched successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            course_id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            order: { type: 'number' },
            pdf_content: { type: 'string', nullable: true },
            video_content: { type: 'string', nullable: true },
            is_completed: { type: 'boolean' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @UseGuards(AuthGuard('jwt'))
  async getModule(@Param('id') id: string, @Req() req: any) {
    const module = await this.courseService.getModuleWithCompletionStatus(id, req.user.userId);
    return {
      status: 'success',
      message: 'Module fetched successfully',
      data: module,
    };
  }

  // Update a module (Admin only)
  @Put('modules/:id')
  @ApiOperation({ summary: 'Update a module (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: String, description: 'Module ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        pdf_content: { type: 'string', format: 'binary', nullable: true, description: 'PDF file' },
        video_content: { type: 'string', format: 'binary', nullable: true, description: 'Video file' }
      },
      required: ['title', 'description']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Module updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Module updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            course_id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            order: { type: 'number' },
            pdf_content: { type: 'string', nullable: true },
            video_content: { type: 'string', nullable: true },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'pdf_content', maxCount: 1 },
    { name: 'video_content', maxCount: 1 }
  ]))
  async updateModule(
    @Param('id') id: string, 
    @Body() body: { title: string; description: string },
    @UploadedFiles() files: { pdf_content?: any[], video_content?: any[] }
  ) {
    const module = await this.courseService.updateModuleWithFiles(id, body, files);
    return {
      status: 'success',
      message: 'Module updated successfully',
      data: {
        id: module.id,
        course_id: module.course.id,
        title: module.title,
        description: module.description,
        order: module.order,
        pdf_content: module.pdf_content,
        video_content: module.video_content,
        created_at: module.created_at,
        updated_at: module.updated_at
      },
    };
  }

  // Delete a module (Admin only)
  @Delete('modules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a module (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Module ID' })
  @ApiResponse({ status: 204, description: 'Module deleted successfully (No Content)' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async deleteModule(@Param('id') id: string) {
    await this.courseService.deleteModule(id);
    return;
  }


  

  // Mark module as completed
  @Patch('modules/:id/complete')
  @ApiOperation({ summary: 'Mark module as completed' })
  @ApiParam({ name: 'id', type: String, description: 'Module ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Module marked as completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Module marked as completed' },
        data: {
          type: 'object',
          properties: {
            module_id: { type: 'string' },
            is_completed: { type: 'boolean', example: true },
            course_progress: {
              type: 'object',
              properties: {
                total_modules: { type: 'number' },
                completed_modules: { type: 'number' },
                percentage: { type: 'number' }
              }
            },
            certificate_url: { type: 'string', nullable: true, description: 'Certificate URL if 100% complete' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Module already completed' })
  @ApiResponse({ status: 400, description: 'You must purchase the course first' })
  @UseGuards(AuthGuard('jwt'))
  async markModuleCompleted(@Param('id') moduleId: string, @Req() req: any) {
    return await this.courseService.markModuleCompletedWithProgress(moduleId, req.user.userId);
  }
}
