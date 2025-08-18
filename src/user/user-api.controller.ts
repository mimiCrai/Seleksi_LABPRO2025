import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  UseGuards, 
  Query, 
  Param, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiOperation, 
  ApiBody, 
  ApiResponse, 
  ApiTags, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam,
  ApiHeader
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api/users')
@ApiTags('👥 User Management (Admin Only)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class UserApiController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ 
    summary: '📋 Get All Users',
    description: 'Retrieve a paginated list of all users with optional search functionality. Admin access required.'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @ApiQuery({ 
    name: 'q', 
    required: false, 
    type: String, 
    description: 'Search query to filter users by username, first name, last name, or email',
    example: 'john'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number for pagination',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of users per page (max: 50)',
    example: 15
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved users list',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Users retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee' },
              username: { type: 'string', example: 'johndoe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              first_name: { type: 'string', example: 'John' },
              last_name: { type: 'string', example: 'Doe' },
              balance: { type: 'number', example: 15000 }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            current_page: { type: 'number', example: 1 },
            total_pages: { type: 'number', example: 5 },
            total_items: { type: 'number', example: 67 }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Unauthorized' },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin privileges required',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Admin only' },
        data: { type: 'null', example: null }
      }
    }
  })
  async getAllUsers(
    @Query('q') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 15
  ) {
    // Validate and sanitize limit
    const validLimit = Math.min(Math.max(1, Number(limit)), 50);
    const validPage = Math.max(1, Number(page));

    return this.userService.findAll(validPage, validLimit, search);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '👤 Get User by ID',
    description: 'Retrieve detailed information about a specific user. Admin access required.'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'User ID (UUID)',
    example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved user details',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'User retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee' },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            balance: { type: 'number', example: 15000 },
            courses_purchased: { type: 'number', example: 3 }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'User not found' },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin privileges required' 
  })
  async getUserById(@Param('id') id: string) {
    return this.userService.findByIdWithStats(id);
  }

  @Post(':id/balance')
  @ApiOperation({ 
    summary: '💰 Update User Balance',
    description: 'Increment or decrement a user\'s account balance. Admin access required.'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @ApiHeader({
    name: 'Content-Type',
    description: 'Request content type',
    example: 'application/json'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'User ID (UUID)',
    example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee'
  })
  @ApiBody({
    description: 'Balance increment/decrement data',
    schema: {
      type: 'object',
      properties: {
        increment: { 
          type: 'number', 
          description: 'Amount to add to balance (use negative values to subtract)',
          example: 5000
        }
      },
      required: ['increment']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully updated user balance',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Balance updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee' },
            username: { type: 'string', example: 'johndoe' },
            balance: { type: 'number', example: 20000 }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid increment value',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Invalid increment value' },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin privileges required' 
  })
  async updateUserBalance(
    @Param('id') id: string,
    @Body() body: { increment: number }
  ) {
    return this.userService.incrementBalance(id, body.increment);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: '✏️ Update User Details',
    description: 'Update user information. Admin users cannot be modified. Admin access required.'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @ApiHeader({
    name: 'Content-Type',
    description: 'Request content type',
    example: 'application/json'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'User ID (UUID)',
    example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee'
  })
  @ApiBody({
    description: 'User update data',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'john.updated@example.com' },
        username: { type: 'string', example: 'johnupdated' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Updated' },
        password: { type: 'string', minLength: 6, example: 'newpassword123' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully updated user',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'User updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee' },
            username: { type: 'string', example: 'johnupdated' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Updated' },
            balance: { type: 'number', example: 15000 }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Cannot modify admin user',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Cannot modify admin user' },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Username or email already exists',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Username or email already exists' },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin privileges required' 
  })
  async updateUser(
    @Param('id') id: string,
    @Body() body: {
      email?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
      password?: string;
    }
  ) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: '🗑️ Delete User',
    description: 'Delete a user from the system. Admin users cannot be deleted. Admin access required.'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'User ID (UUID)',
    example: 'b5fb1a10-a67f-47cb-9782-b0911adfdfee'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'User successfully deleted (No Content)' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Cannot delete admin user',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Cannot delete admin user' },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'User not found' },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin privileges required' 
  })
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
    return; // 204 No Content
  }
}
