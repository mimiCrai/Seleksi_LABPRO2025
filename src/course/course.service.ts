import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Course } from './entities/course/course';
import { CourseModule } from './entities/course/course-module';
import { UserCourse } from '../user/entities/user/user-course';
import { UserProgress } from '../user/entities/user/user-progress';
import { User } from '../user/entities/user/user';

@Injectable()
export class CourseService {
  
    constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(CourseModule) private courseModuleRepo: Repository<CourseModule>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserCourse) private userCourseRepo: Repository<UserCourse>,
    @InjectRepository(UserProgress) private userProgressRepo: Repository<UserProgress>,
    ) {}

  async create(data: Partial<Course>) {
    const course = this.courseRepo.create(data);
    return this.courseRepo.save(course);
  }

  async findAll(
  page = 1,
  limit = 15,
    search?: string,
    ): Promise<{ data: Course[]; total: number; totalPages: number }> {
    const query = this.courseRepo.createQueryBuilder('course');

    if (search) {
        query.where(
        'LOWER(course.title) LIKE :search OR LOWER(course.instructor) LIKE :search OR LOWER(course.topics) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
        );
    }

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { data, total, totalPages };
    }

    async buyCourse(courseId: string, userId: string) {
    console.log('buyCourse called with:', { courseId, userId });
    
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    console.log('Course found:', course ? 'yes' : 'no');
    
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['userCourses'] });
    console.log('User found:', user ? 'yes' : 'no');

    if (!course || !user) throw new NotFoundException('Course/User not found');

    const alreadyBought = await this.userCourseRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    console.log('Already bought:', alreadyBought ? 'yes' : 'no');

    if (alreadyBought) throw new ConflictException('Already purchased');

    console.log('User balance:', user.balance, 'Course price:', course.price);
    if (user.balance < Number(course.price)) {
      throw new BadRequestException('Insufficient balance');
    }

    user.balance -= Number(course.price);
    await this.userRepo.save(user);

    const userCourse = this.userCourseRepo.create({ user, course });
    await this.userCourseRepo.save(userCourse);

    return {
      status: 'success',
      message: 'Course purchased successfully',
      data: {
        course_id: course.id,
        user_balance: user.balance,
      },
    };
  }


    async findMyCourses(userId: string) {
    const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['userCourses', 'userCourses.course'],
    });

    if (!user) throw new NotFoundException('User not found');

    const data = await Promise.all(user.userCourses.map(async (uc) => {
        // Calculate progress percentage
        const progress = await this.calculateCourseProgress(uc.course.id, userId);
        
        return {
        id: uc.course.id,
        title: uc.course.title,
        description: uc.course.description,
        instructor: uc.course.instructor,
        thumbnail_image: uc.course.thumbnail_image,
        progress_percentage: progress,
        purchased_at: uc.purchased_at,
        };
    }));

    return data;
    }

    async findById(id: string) {
        const course = await this.courseRepo.createQueryBuilder('course')
            .leftJoin('course.modules', 'module')
            .addSelect('COUNT(module.id)', 'total_modules')
            .where('course.id = :id', { id })
            .groupBy('course.id')
            .getRawAndEntities();

        if (!course.entities.length) {
            throw new NotFoundException('Course not found');
        }

        const courseData = course.entities[0];
        const totalModules = parseInt(course.raw[0]?.total_modules || '0');

        return {
            ...courseData,
            total_modules: totalModules
        };
    }

    // Admin only: Add module to course
    async addModuleToCourse(
        courseId: string, 
        moduleData: { title: string; description: string }, 
        files?: { pdf_content?: any[], video_content?: any[] }
    ) {
        const course = await this.courseRepo.findOne({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        // Get the next order number for this course
        const maxOrder = await this.courseModuleRepo
            .createQueryBuilder('module')
            .where('module.course.id = :courseId', { courseId })
            .select('MAX(module.order)', 'max')
            .getRawOne();
        
        const nextOrder = (maxOrder.max || 0) + 1;

        // Handle file uploads (in a real app, you'd upload to object storage)
        let pdfContent: string | null = null;
        let videoContent: string | null = null;

        if (files?.pdf_content?.[0]) {
            // For now, we'll just store the filename/path
            // In production, upload to S3/GCS and store the URL
            pdfContent = `uploads/pdf/${Date.now()}_${files.pdf_content[0].originalname}`;
        }

        if (files?.video_content?.[0]) {
            // For now, we'll just store the filename/path
            // In production, upload to S3/GCS and store the URL
            videoContent = `uploads/video/${Date.now()}_${files.video_content[0].originalname}`;
        }

        const module = this.courseModuleRepo.create({
            title: moduleData.title,
            description: moduleData.description,
            order: nextOrder,
            pdf_content: pdfContent,
            video_content: videoContent,
            course,
        } as Partial<CourseModule>);

        return await this.courseModuleRepo.save(module);
    }

    // Get all modules for a course
    async getCourseModules(courseId: string) {
        const course = await this.courseRepo.findOne({ 
            where: { id: courseId },
            relations: ['modules']
        });
        
        if (!course) throw new NotFoundException('Course not found');

        return course.modules.sort((a, b) => a.order - b.order);
    }

    // Get all modules for a course with pagination and completion status
    async getCourseModulesWithPagination(
        courseId: string, 
        page: number = 1, 
        limit: number = 15, 
        userId?: string
    ) {
        const course = await this.courseRepo.findOne({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        const query = this.courseModuleRepo
            .createQueryBuilder('module')
            .leftJoinAndSelect('module.course', 'course')
            .where('course.id = :courseId', { courseId })
            .orderBy('module.order', 'ASC');
        
        // Only add progress tracking if user is authenticated
        if (userId) {
            query
                .leftJoin('module.userProgresses', 'progress', 'progress.user.id = :userId', { userId })
                .addSelect('CASE WHEN progress.id IS NOT NULL THEN true ELSE false END', 'is_completed');
        } else {
            // For unauthenticated users, set is_completed to false
            query.addSelect('false', 'is_completed');
        }
        
        query
            .skip((page - 1) * limit)
            .take(limit);

        const [modules, total] = await Promise.all([
            query.getRawAndEntities(),
            this.courseModuleRepo.count({ where: { course: { id: courseId } } })
        ]);

        const data = modules.entities.map((module, index) => ({
            id: module.id,
            course_id: courseId,
            title: module.title,
            description: module.description,
            order: module.order,
            pdf_content: module.pdf_content,
            video_content: module.video_content,
            is_completed: modules.raw[index]?.is_completed === 'true' || modules.raw[index]?.is_completed === true,
            created_at: module.created_at,
            updated_at: module.updated_at
        }));

        const totalPages = Math.ceil(total / limit);

        return { data, total, totalPages };
    }

    // Reorder modules in a course
    async reorderModules(courseId: string, moduleOrder: { id: string; order: number }[]) {
        const course = await this.courseRepo.findOne({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        // Validate all modules belong to this course
        const moduleIds = moduleOrder.map(item => item.id);
        const modules = await this.courseModuleRepo.find({
            where: { 
                id: In(moduleIds),
                course: { id: courseId }
            }
        });

        if (modules.length !== moduleIds.length) {
            throw new BadRequestException('Some modules do not belong to this course');
        }

        // Update order for each module
        const updatePromises = moduleOrder.map(async (item) => {
            await this.courseModuleRepo.update(
                { id: item.id },
                { order: item.order }
            );
            return { id: item.id, order: item.order };
        });

        const result = await Promise.all(updatePromises);
        return result;
    }

    // Mark module as completed
    async markModuleCompleted(moduleId: string, userId: string) {
        const module = await this.courseModuleRepo.findOne({ 
            where: { id: moduleId },
            relations: ['course']
        });
        
        if (!module) throw new NotFoundException('Module not found');

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Check if user has purchased the course
        const userCourse = await this.userCourseRepo.findOne({
            where: { 
                user: { id: userId }, 
                course: { id: module.course.id } 
            },
        });

        if (!userCourse) {
            throw new BadRequestException('You must purchase the course first');
        }

        // Check if already completed
        const existingProgress = await this.userProgressRepo.findOne({
            where: {
                user: { id: userId },
                module: { id: moduleId }
            }
        });

        if (existingProgress) {
            throw new ConflictException('Module already completed');
        }

        // Mark as completed
        const progress = this.userProgressRepo.create({
            user,
            module,
        });

        await this.userProgressRepo.save(progress);

        return {
            status: 'success',
            message: 'Module marked as completed',
            data: {
                module_id: moduleId,
                completed_at: progress.completed_at,
            }
        };
    }

    // Enhanced version with progress tracking and certificate
    async markModuleCompletedWithProgress(moduleId: string, userId: string) {
        const module = await this.courseModuleRepo.findOne({ 
            where: { id: moduleId },
            relations: ['course']
        });
        
        if (!module) throw new NotFoundException('Module not found');

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Check if user has purchased the course
        const userCourse = await this.userCourseRepo.findOne({
            where: { 
                user: { id: userId }, 
                course: { id: module.course.id } 
            },
        });

        if (!userCourse) {
            throw new BadRequestException('You must purchase the course first');
        }

        // Check if already completed
        const existingProgress = await this.userProgressRepo.findOne({
            where: {
                user: { id: userId },
                module: { id: moduleId }
            }
        });

        if (existingProgress) {
            throw new ConflictException('Module already completed');
        }

        // Mark as completed
        const progress = this.userProgressRepo.create({
            user,
            module,
        });

        await this.userProgressRepo.save(progress);

        // Calculate course progress
        const totalModules = await this.courseModuleRepo.count({
            where: { course: { id: module.course.id } }
        });

        const completedModules = await this.userProgressRepo.count({
            where: {
                user: { id: userId },
                module: { course: { id: module.course.id } }
            }
        });

        const percentage = Math.round((completedModules / totalModules) * 100);
        
        // Generate certificate URL if 100% complete
        let certificateUrl: string | null = null;
        if (percentage === 100) {
            certificateUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/certificates/${userId}/${module.course.id}`;
        }

        return {
            status: 'success',
            message: 'Module marked as completed',
            data: {
                module_id: moduleId,
                is_completed: true,
                course_progress: {
                    total_modules: totalModules,
                    completed_modules: completedModules,
                    percentage: percentage
                },
                certificate_url: certificateUrl
            }
        };
    }

    // Calculate progress percentage for a course
    private async calculateCourseProgress(courseId: string, userId: string): Promise<number> {
        // Get total modules for the course
        const totalModules = await this.courseModuleRepo.count({
            where: { course: { id: courseId } }
        });

        if (totalModules === 0) return 0;

        // Get completed modules for this user
        const completedModules = await this.userProgressRepo.count({
            where: {
                user: { id: userId },
                module: { course: { id: courseId } }
            }
        });

        return Math.round((completedModules / totalModules) * 100);
    }

    async update(id: string, data: Partial<Course>) {
    const course = await this.courseRepo.findOneBy({ id });
    if (!course) throw new NotFoundException('Course not found');

    Object.assign(course, data);
    return this.courseRepo.save(course);
    }

    async delete(id: string) {
    const course = await this.courseRepo.findOneBy({ id });
    if (!course) throw new NotFoundException('Course not found');

    return this.courseRepo.remove(course);
    }


    async getModule(id: string) {
    const module = await this.courseModuleRepo.findOne({ where: { id }, relations: ['course'] });
    if (!module) throw new NotFoundException('Module not found');
    return module;
    }

    async getModuleWithCompletionStatus(id: string, userId: string) {
        const module = await this.courseModuleRepo.findOne({ 
            where: { id }, 
            relations: ['course'] 
        });
        
        if (!module) throw new NotFoundException('Module not found');

        // Check if user has completed this module
        const progress = await this.userProgressRepo.findOne({
            where: {
                user: { id: userId },
                module: { id }
            }
        });

        return {
            id: module.id,
            course_id: module.course.id,
            title: module.title,
            description: module.description,
            order: module.order,
            pdf_content: module.pdf_content,
            video_content: module.video_content,
            is_completed: !!progress,
            created_at: module.created_at,
            updated_at: module.updated_at
        };
    }

    async updateModuleWithFiles(
        id: string, 
        data: { title: string; description: string }, 
        files?: { pdf_content?: any[], video_content?: any[] }
    ) {
        const module = await this.courseModuleRepo.findOne({ where: { id }, relations: ['course'] });
        if (!module) throw new NotFoundException('Module not found');

        // Handle file uploads
        if (files?.pdf_content?.[0]) {
            module.pdf_content = `uploads/pdf/${Date.now()}_${files.pdf_content[0].originalname}`;
        }

        if (files?.video_content?.[0]) {
            module.video_content = `uploads/video/${Date.now()}_${files.video_content[0].originalname}`;
        }

        // Update other fields
        module.title = data.title;
        module.description = data.description;

        return await this.courseModuleRepo.save(module);
    }

    async updateModule(id: string, data: Partial<CourseModule>) {
    const module = await this.courseModuleRepo.findOneBy({ id });
    if (!module) throw new NotFoundException('Module not found');

    Object.assign(module, data);
    return this.courseModuleRepo.save(module);
    }

    async deleteModule(id: string) {
    const module = await this.courseModuleRepo.findOneBy({ id });
    if (!module) throw new NotFoundException('Module not found');

    return this.courseModuleRepo.remove(module);
    }

    // Get course details with all modules included
    async findByIdWithModules(id: string, userId?: string) {
        const course = await this.courseRepo.createQueryBuilder('course')
            .leftJoinAndSelect('course.modules', 'module')
            .where('course.id = :id', { id })
            .orderBy('module.order', 'ASC')
            .getOne();

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // If userId is provided, get completion status for each module
        if (userId && course.modules) {
            const moduleIds = course.modules.map(m => m.id);
            
            const completedModules = await this.userProgressRepo.find({
                where: {
                    user: { id: userId },
                    module: { id: In(moduleIds) }
                },
                relations: ['module']
            });

            const completedModuleIds = new Set(completedModules.map(p => p.module.id));
            
            course.modules = course.modules.map(module => ({
                ...module,
                is_completed: completedModuleIds.has(module.id)
            })) as any;
        }

        return {
            ...course,
            total_modules: course.modules ? course.modules.length : 0
        };
    }

    // Get the next module to study (first incomplete or first module)
    async getNextModuleToStudy(courseId: string, userId: string): Promise<string | null> {
        // First check if user owns the course
        const userCourse = await this.userCourseRepo.findOne({
            where: {
                user: { id: userId },
                course: { id: courseId }
            }
        });

        if (!userCourse) {
            throw new NotFoundException('Course not purchased or not found');
        }

        // Get all modules ordered by order
        const modules = await this.courseModuleRepo.find({
            where: { course: { id: courseId } },
            order: { order: 'ASC' }
        });

        if (modules.length === 0) {
            return null; // No modules in this course
        }

        // Find the first incomplete module
        for (const module of modules) {
            const progress = await this.userProgressRepo.findOne({
                where: {
                    user: { id: userId },
                    module: { id: module.id }
                }
            });

            if (!progress) {
                // This module is not completed, return it
                return module.id;
            }
        }

        // All modules are completed, return the last module for review
        return modules[modules.length - 1].id;
    }

    // Get user's progress summary for a course
    async getCourseProgressSummary(courseId: string, userId: string) {
        const course = await this.courseRepo.findOne({
            where: { id: courseId },
            relations: ['modules']
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        const totalModules = course.modules.length;
        const completedModules = await this.userProgressRepo.count({
            where: {
                user: { id: userId },
                module: { course: { id: courseId } }
            }
        });

        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
        
        const nextModuleId = await this.getNextModuleToStudy(courseId, userId);

        return {
            total_modules: totalModules,
            completed_modules: completedModules,
            progress_percentage: progressPercentage,
            next_module_id: nextModuleId,
            is_completed: progressPercentage === 100
        };
    }


}
