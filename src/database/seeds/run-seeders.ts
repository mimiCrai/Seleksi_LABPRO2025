import dataSource from '../../data-source';
import { SeedUsers } from './user.seeder';
import { SeedCourses } from './course.seeder';
import { SeedCourseModules } from './course-module.seeder';
import { SeedUserCourses } from './user-course.seeder';
import { SeedUserProgress } from './user-progress.seeder';

async function runSeeders() {
  try {
    // Initialize data source
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    // Run seeders in order (important for relationships)
    console.log('🌱 Starting database seeding...');
    
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
    
    console.log('🎉 All seeders completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('📦 Database connection closed.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  runSeeders();
}

export default runSeeders;
