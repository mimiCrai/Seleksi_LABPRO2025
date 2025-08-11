import { DataSource } from 'typeorm';
import { UserProgress } from '../../user/entities/user/user-progress';
import { User } from '../../user/entities/user/user';
import { CourseModule } from '../../course/entities/course/course-module';
import { Course } from '../../course/entities/course/course';

export class SeedUserProgress {
  static async run(dataSource: DataSource): Promise<void> {
    const progressRepository = dataSource.getRepository(UserProgress);
    const userRepository = dataSource.getRepository(User);
    const moduleRepository = dataSource.getRepository(CourseModule);
    const courseRepository = dataSource.getRepository(Course);

    // Check if progress already exists
    const existingProgress = await progressRepository.count();
    if (existingProgress > 0) {
      console.log('User progress already exists, skipping seed...');
      return;
    }

    // Get all entities
    const users = await userRepository.find();
    const modules = await moduleRepository.find({ relations: ['course'] });
    const courses = await courseRepository.find();

    const userMap = new Map(users.map(user => [user.id, user]));
    
    // Group modules by course
    const modulesByCourse = new Map<string, CourseModule[]>();
    modules.forEach(module => {
      if (module.course && module.course.id) {
        const courseId = module.course.id;
        if (!modulesByCourse.has(courseId)) {
          modulesByCourse.set(courseId, []);
        }
        modulesByCourse.get(courseId)?.push(module);
      }
    });

    // Sort modules by order within each course
    modulesByCourse.forEach((modules, courseId) => {
      modules.sort((a, b) => a.order - b.order);
      modulesByCourse.set(courseId, modules);
    });

    const progressData: Partial<UserProgress>[] = [];

    console.log('DEBUG: Users found:', users.length);
    console.log('DEBUG: Modules found:', modules.length);
    console.log('DEBUG: Modules by course:', modulesByCourse.size);
    console.log('DEBUG: User IDs:', users.map(u => u.id));

    // testuser progress: Completed Test Course (all modules), partial progress on JavaScript
    const testUser = userMap.get('550e8400-e29b-41d4-a716-446655440002');
    console.log('DEBUG: Test user found:', !!testUser);
    
    if (testUser) {
      // Complete all Test Course modules
      const testCourseModules = modulesByCourse.get('550e8400-e29b-41d4-a716-446655440106') || [];
      console.log('DEBUG: Test course modules found:', testCourseModules.length);
      
      testCourseModules.forEach((module, index) => {
        progressData.push({
          user: testUser,
          module: module,
          completed_at: new Date(2025, 7, 5 + index), // Completed over several days
        });
      });

      // Partial progress on JavaScript Mastery (first 2 modules)
      const jsModules = modulesByCourse.get('550e8400-e29b-41d4-a716-446655440101') || [];
      for (let i = 0; i < Math.min(2, jsModules.length); i++) {
        progressData.push({
          user: testUser,
          module: jsModules[i],
          completed_at: new Date(2025, 7, 8 + i),
        });
      }
    }

    // johndoe progress: Some progress on Python course
    const johnUser = userMap.get('550e8400-e29b-41d4-a716-446655440003');
    if (johnUser) {
      // Completed first 2 modules of Python course
      const pythonModules = modulesByCourse.get('550e8400-e29b-41d4-a716-446655440102') || [];
      for (let i = 0; i < Math.min(2, pythonModules.length); i++) {
        progressData.push({
          user: johnUser,
          module: pythonModules[i],
          completed_at: new Date(2025, 6, 30 + i),
        });
      }

      // Started Database course (first module only)
      const dbModules = modulesByCourse.get('550e8400-e29b-41d4-a716-446655440104') || [];
      if (dbModules.length > 0) {
        progressData.push({
          user: johnUser,
          module: dbModules[0],
          completed_at: new Date(2025, 7, 4),
        });
      }
    }

    // janedoe progress: Completed Node.js course, started JavaScript
    const janeUser = userMap.get('550e8400-e29b-41d4-a716-446655440004');
    if (janeUser) {
      // Complete all Node.js modules
      const nodeModules = modulesByCourse.get('550e8400-e29b-41d4-a716-446655440105') || [];
      nodeModules.forEach((module, index) => {
        progressData.push({
          user: janeUser,
          module: module,
          completed_at: new Date(2025, 7, 1 + index),
        });
      });

      // Started JavaScript course (first module)
      const jsModules = modulesByCourse.get('550e8400-e29b-41d4-a716-446655440101') || [];
      if (jsModules.length > 0) {
        progressData.push({
          user: janeUser,
          module: jsModules[0],
          completed_at: new Date(2025, 7, 7),
        });
      }
    }

    // student1 progress: Just started Test Course (first module only)
    const studentUser = userMap.get('550e8400-e29b-41d4-a716-446655440005');
    if (studentUser) {
      const testCourseModules = modulesByCourse.get('550e8400-e29b-41d4-a716-446655440106') || [];
      if (testCourseModules.length > 0) {
        progressData.push({
          user: studentUser,
          module: testCourseModules[0],
          completed_at: new Date(2025, 7, 6),
        });
      }
    }

    await progressRepository.save(progressData);
    console.log(`✅ Seeded ${progressData.length} user progress records successfully!`);
  }
}
