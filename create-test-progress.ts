import dataSource from './src/data-source';
import { UserProgress } from './src/user/entities/user/user-progress';
import { User } from './src/user/entities/user/user';
import { CourseModule } from './src/course/entities/course/course-module';
import { Course } from './src/course/entities/course/course';
import { UserCourse } from './src/user/entities/user/user-course';

async function createTestProgress() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    const userRepository = dataSource.getRepository(User);
    const courseRepository = dataSource.getRepository(Course);
    const moduleRepository = dataSource.getRepository(CourseModule);
    const userCourseRepository = dataSource.getRepository(UserCourse);
    const progressRepository = dataSource.getRepository(UserProgress);

    // Clear existing progress
    await progressRepository.clear();
    console.log('🗑️  Cleared existing user progress');

    // Get existing data
    const users = await userRepository.find();
    const testCourse = await courseRepository.findOne({ 
      where: { title: 'Test Course' } 
    });
    
    if (!testCourse) {
      console.log('❌ Test Course not found');
      return;
    }

    const testModules = await moduleRepository.find({ 
      where: { course: { id: testCourse.id } },
      relations: ['course'],
      order: { order: 'ASC' }
    });

    console.log(`Found ${users.length} users and ${testModules.length} modules in Test Course`);

    // Create a purchase for the first non-admin user if they don't already have it
    const testUser = users.find(u => !u.is_admin);
    if (testUser && testModules.length > 0) {
      const existingPurchase = await userCourseRepository.findOne({
        where: { 
          user: { id: testUser.id }, 
          course: { id: testCourse.id } 
        }
      });

      if (!existingPurchase) {
        const userCourse = userCourseRepository.create({
          user: testUser,
          course: testCourse,
          purchased_at: new Date()
        });
        await userCourseRepository.save(userCourse);
        console.log(`✅ Created course purchase for ${testUser.username}`);
      }

      // Create some progress (complete first 2 modules, leave others incomplete)
      const progressToCreate: Partial<UserProgress>[] = [];
      for (let i = 0; i < Math.min(2, testModules.length); i++) {
        progressToCreate.push({
          user: testUser,
          module: testModules[i],
          completed_at: new Date(Date.now() - (2 - i) * 24 * 60 * 60 * 1000) // Days ago
        });
      }

      await progressRepository.save(progressToCreate);
      console.log(`✅ Created ${progressToCreate.length} progress records for ${testUser.username}`);
    }

    console.log('🎉 Test progress setup completed!');
    console.log(`👤 Test with user: ${testUser?.username}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

createTestProgress();
