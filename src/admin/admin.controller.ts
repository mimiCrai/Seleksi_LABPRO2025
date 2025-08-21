import { Controller, Post, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SeedUsers } from '../database/seeds/user.seeder';
import { SeedCourses } from '../database/seeds/course.seeder';
import { SeedCourseModules } from '../database/seeds/course-module.seeder';
import { SeedUserCourses } from '../database/seeds/user-course.seeder';
import { SeedUserProgress } from '../database/seeds/user-progress.seeder';

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Post('seed')
  @ApiOperation({ summary: 'Seed database with initial data (Admin only)' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  @ApiResponse({ status: 500, description: 'Seeding failed' })
  async seedDatabase() {
    try {
      console.log('🚀 Starting database seeding via endpoint...');
      console.log('DataSource initialized:', this.dataSource.isInitialized);
      
      // Run seeders in order (important for relationships)
      console.log('🌱 Running seeders...');
      
      console.log('1️⃣ Seeding users...');
      await SeedUsers.run(this.dataSource);
      
      console.log('2️⃣ Seeding courses...');
      await SeedCourses.run(this.dataSource);
      
      console.log('3️⃣ Seeding course modules...');
      await SeedCourseModules.run(this.dataSource);
      
      console.log('4️⃣ Seeding user course purchases...');
      await SeedUserCourses.run(this.dataSource);
      
      console.log('5️⃣ Seeding user progress...');
      await SeedUserProgress.run(this.dataSource);
      
      console.log('🎉 Seeding completed successfully!');
      
      return {
        status: 'success',
        message: 'Database seeded successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Seeding error:', error);
      return {
        status: 'error',
        message: 'Database seeding failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('seed/status')
  @ApiOperation({ summary: 'Check seeding status' })
  async getSeedingStatus() {
    try {
      // Check if basic data exists
      const userCount = await this.dataSource.query('SELECT COUNT(*) as count FROM user');
      const courseCount = await this.dataSource.query('SELECT COUNT(*) as count FROM course');
      
      return {
        status: 'success',
        message: 'Database connection working',
        data: {
          users: userCount[0].count,
          courses: courseCount[0].count,
          seeded: userCount[0].count > 0 && courseCount[0].count > 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database check failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
