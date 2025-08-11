import { Controller, Get, Render, Query, Req, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from './auth/admin.guard';
import { User } from './user/entities/user/user';
import { Course } from './course/entities/course/course';
import { CourseModule } from './course/entities/course/course-module';
import { UserCourse } from './user/entities/user/user-course';
import { UserProgress } from './user/entities/user/user-progress';

@Controller('admin/database')
@ApiTags('Database Admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class DatabaseController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(CourseModule) private moduleRepo: Repository<CourseModule>,
    @InjectRepository(UserCourse) private userCourseRepo: Repository<UserCourse>,
    @InjectRepository(UserProgress) private progressRepo: Repository<UserProgress>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Database overview dashboard' })
  @Render('database-dashboard')
  async showDashboard(@Req() req: any) {
    try {
      // Get counts and statistics
      const [
        userCount,
        courseCount,
        moduleCount,
        purchaseCount,
        progressCount,
        adminCount,
      ] = await Promise.all([
        this.userRepo.count(),
        this.courseRepo.count(),
        this.moduleRepo.count(),
        this.userCourseRepo.count(),
        this.progressRepo.count(),
        this.userRepo.count({ where: { is_admin: true } }),
      ]);

      // Get recent activity
      const recentUsers = await this.userRepo.find({
        order: { created_at: 'DESC' },
        take: 5,
      });

      const recentPurchases = await this.userCourseRepo.find({
        relations: ['user', 'course'],
        order: { purchased_at: 'DESC' },
        take: 5,
      });

      const recentProgress = await this.progressRepo.find({
        relations: ['user', 'module', 'module.course'],
        order: { completed_at: 'DESC' },
        take: 5,
      });

      return {
        pageTitle: 'Database Dashboard',
        currentPage: 'database-dashboard',
        stats: {
          userCount,
          courseCount,
          moduleCount,
          purchaseCount,
          progressCount,
          adminCount,
        },
        recentUsers,
        recentPurchases,
        recentProgress,
      };
    } catch (error) {
      console.error('Error loading database dashboard:', error);
      return {
        pageTitle: 'Database Dashboard',
        currentPage: 'database-dashboard',
        error: 'Error loading dashboard data',
      };
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'View all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Render('database-users')
  async showUsers(@Query() query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const search = query.search || '';

    try {
      const queryBuilder = this.userRepo.createQueryBuilder('user');

      if (search) {
        queryBuilder.where(
          'user.username LIKE :search OR user.email LIKE :search OR user.first_name LIKE :search OR user.last_name LIKE :search',
          { search: `%${search}%` }
        );
      }

      queryBuilder
        .orderBy('user.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [users, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      // Get user statistics
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const [courseCount, progressCount] = await Promise.all([
            this.userCourseRepo.count({ where: { user: { id: user.id } } }),
            this.progressRepo.count({ where: { user: { id: user.id } } }),
          ]);
          return { ...user, courseCount, progressCount };
        })
      );

      return {
        pageTitle: 'Database Users',
        currentPage: 'database-users',
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        search,
      };
    } catch (error) {
      console.error('Error loading users:', error);
      return {
        pageTitle: 'Database Users',
        currentPage: 'database-users',
        error: 'Error loading users data',
      };
    }
  }

  @Get('courses')
  @ApiOperation({ summary: 'View all courses' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Render('database-courses')
  async showCourses(@Query() query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    try {
      const [courses, total] = await this.courseRepo.findAndCount({
        relations: ['modules'],
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      // Get course statistics
      const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
          const purchaseCount = await this.userCourseRepo.count({ 
            where: { course: { id: course.id } } 
          });
          return { 
            ...course, 
            moduleCount: course.modules?.length || 0,
            purchaseCount 
          };
        })
      );

      return {
        pageTitle: 'Database Courses',
        currentPage: 'database-courses',
        courses: coursesWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Error loading courses:', error);
      return {
        pageTitle: 'Database Courses',
        currentPage: 'database-courses',
        error: 'Error loading courses data',
      };
    }
  }

  @Get('modules')
  @ApiOperation({ summary: 'View all course modules' })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @Render('database-modules')
  async showModules(@Query() query: any) {
    try {
      let modules;
      let course: Course | null = null;

      if (query.courseId) {
        course = await this.courseRepo.findOne({ where: { id: query.courseId } });
        modules = await this.moduleRepo.find({
          where: { course: { id: query.courseId } },
          relations: ['course'],
          order: { order: 'ASC' },
        });
      } else {
        modules = await this.moduleRepo.find({
          relations: ['course'],
          order: { created_at: 'DESC' },
        });
      }

      // Get module statistics
      const modulesWithStats = await Promise.all(
        modules.map(async (module) => {
          const completionCount = await this.progressRepo.count({ 
            where: { module: { id: module.id } } 
          });
          return { ...module, completionCount };
        })
      );

      const courses = await this.courseRepo.find({ order: { title: 'ASC' } });

      return {
        pageTitle: 'Database Modules',
        currentPage: 'database-modules',
        modules: modulesWithStats,
        courses,
        selectedCourse: course,
        selectedCourseId: query.courseId,
      };
    } catch (error) {
      console.error('Error loading modules:', error);
      return {
        pageTitle: 'Database Modules',
        currentPage: 'database-modules',
        error: 'Error loading modules data',
      };
    }
  }

  @Get('purchases')
  @ApiOperation({ summary: 'View all course purchases' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @Render('database-purchases')
  async showPurchases(@Query() query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    try {
      const queryBuilder = this.userCourseRepo
        .createQueryBuilder('purchase')
        .leftJoinAndSelect('purchase.user', 'user')
        .leftJoinAndSelect('purchase.course', 'course');

      if (query.userId) {
        queryBuilder.andWhere('purchase.user_id = :userId', { userId: query.userId });
      }

      if (query.courseId) {
        queryBuilder.andWhere('purchase.course_id = :courseId', { courseId: query.courseId });
      }

      queryBuilder
        .orderBy('purchase.purchased_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [purchases, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      return {
        pageTitle: 'Database Purchases',
        currentPage: 'database-purchases',
        purchases,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters: {
          userId: query.userId,
          courseId: query.courseId,
        },
      };
    } catch (error) {
      console.error('Error loading purchases:', error);
      return {
        pageTitle: 'Database Purchases',
        currentPage: 'database-purchases',
        error: 'Error loading purchases data',
      };
    }
  }

  @Get('progress')
  @ApiOperation({ summary: 'View user progress' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @Render('database-progress')
  async showProgress(@Query() query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    try {
      const queryBuilder = this.progressRepo
        .createQueryBuilder('progress')
        .leftJoinAndSelect('progress.user', 'user')
        .leftJoinAndSelect('progress.module', 'module')
        .leftJoinAndSelect('module.course', 'course');

      if (query.userId) {
        queryBuilder.andWhere('progress.userId = :userId', { userId: query.userId });
      }

      if (query.courseId) {
        queryBuilder.andWhere('course.id = :courseId', { courseId: query.courseId });
      }

      queryBuilder
        .orderBy('progress.completed_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [progress, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      return {
        pageTitle: 'Database Progress',
        currentPage: 'database-progress',
        progress,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters: {
          userId: query.userId,
          courseId: query.courseId,
        },
      };
    } catch (error) {
      console.error('Error loading progress:', error);
      return {
        pageTitle: 'Database Progress',
        currentPage: 'database-progress',
        error: 'Error loading progress data',
      };
    }
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'View specific user details' })
  @ApiParam({ name: 'id', type: String })
  @Render('database-user-detail')
  async showUserDetail(@Param('id') userId: string) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      
      if (!user) {
        return {
          pageTitle: 'User Not Found',
          currentPage: 'database-user-detail',
          error: 'User not found',
        };
      }

      const [purchases, progress] = await Promise.all([
        this.userCourseRepo.find({
          where: { user: { id: userId } },
          relations: ['course'],
          order: { purchased_at: 'DESC' },
        }),
        this.progressRepo.find({
          where: { user: { id: userId } },
          relations: ['module', 'module.course'],
          order: { completed_at: 'DESC' },
        }),
      ]);

      // Calculate user statistics
      const courseProgress = new Map();
      progress.forEach(p => {
        const courseId = p.module.course.id;
        if (!courseProgress.has(courseId)) {
          courseProgress.set(courseId, {
            course: p.module.course,
            completedModules: 0,
            totalModules: 0,
          });
        }
        courseProgress.get(courseId).completedModules++;
      });

      // Get total modules for each course
      for (const [courseId, data] of courseProgress) {
        const totalModules = await this.moduleRepo.count({ 
          where: { course: { id: courseId } } 
        });
        data.totalModules = totalModules;
        data.percentage = Math.round((data.completedModules / totalModules) * 100);
      }

      return {
        pageTitle: `User: ${user.username}`,
        currentPage: 'database-user-detail',
        user,
        purchases,
        progress,
        courseProgress: Array.from(courseProgress.values()),
        stats: {
          totalPurchases: purchases.length,
          totalProgress: progress.length,
          totalSpent: purchases.reduce((sum, p) => sum + Number(p.course.price), 0),
        },
      };
    } catch (error) {
      console.error('Error loading user detail:', error);
      return {
        pageTitle: 'User Detail Error',
        currentPage: 'database-user-detail',
        error: 'Error loading user details',
      };
    }
  }
}
