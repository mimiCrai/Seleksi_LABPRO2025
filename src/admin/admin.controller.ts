import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { runProductionSeeders } from '../database/seeds/production-seeder';

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  constructor() {}

  @Post('seed')
  @ApiOperation({ summary: 'Seed database with initial data (Admin only)' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  @ApiResponse({ status: 500, description: 'Seeding failed' })
  async seedDatabase() {
    try {
      await runProductionSeeders();
      return {
        status: 'success',
        message: 'Database seeded successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database seeding failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
