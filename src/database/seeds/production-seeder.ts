import { getDatabaseConfig } from '../../config/database.config';
import { DataSource } from 'typeorm';
import { SeedUsers } from './user.seeder';
import { SeedCourses } from './course.seeder';
import { SeedCourseModules } from './course-module.seeder';
import { SeedUserCourses } from './user-course.seeder';
import { SeedUserProgress } from './user-progress.seeder';

// Import all entities (Railway needs compiled JS paths)
import { User } from '../../user/entities/user/user';
import { Course } from '../../course/entities/course/course';
import { CourseModule } from '../../course/entities/course/course-module';
import { UserCourse } from '../../user/entities/user/user-course';
import { UserProgress } from '../../user/entities/user/user-progress';

async function runProductionSeeders() {
  const config = getDatabaseConfig();
  
  // Create data source with entities for production
  const dataSource = new DataSource({
    ...config,
    entities: [User, Course, CourseModule, UserCourse, UserProgress],
    synchronize: false,
    logging: true,
  } as any);

  try {
    console.log('🚀 Starting production database seeding...');
    
    // Initialize data source
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    // Run seeders in order (important for relationships)
    console.log('🌱 Running seeders...');
    
    console.log('1️⃣ Seeding users...');
    await SeedUsers.run(dataSource);
    
    console.log('2️⃣ Seeding courses...');
    await SeedCourses.run(dataSource);
    
    console.log('3️⃣ Seeding course modules...');
    await SeedCourseModules.run(dataSource);
    
    console.log('4️⃣ Seeding user course purchases...');
    await SeedUserCourses.run(dataSource);
    
    console.log('5️⃣ Seeding user progress...');
    await SeedUserProgress.run(dataSource);
    
    console.log('🎉 Production seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running production seeders:', error);
    throw error;
  } finally {
    // Close database connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('📦 Database connection closed.');
    }
  }
}

export { runProductionSeeders };

// Run if called directly
if (require.main === module) {
  runProductionSeeders().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}
