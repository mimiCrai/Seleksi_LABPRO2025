import dataSource from './src/data-source';
import { CourseModule } from './src/course/entities/course/course-module';
import { UserProgress } from './src/user/entities/user/user-progress';
import { SeedCourseModules } from './src/database/seeds/course-module.seeder';

async function resetModules() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    const moduleRepo = dataSource.getRepository(CourseModule);
    const progressRepo = dataSource.getRepository(UserProgress);

    // 1. Check current modules
    const currentModules = await moduleRepo.find({
      relations: ['course']
    });
    console.log(`\n📊 Current modules in database: ${currentModules.length}`);
    
    // Show modules without parent courses (orphaned)
    const orphanedModules = currentModules.filter(module => !module.course);
    console.log(`🚨 Orphaned modules (no parent course): ${orphanedModules.length}`);
    
    if (orphanedModules.length > 0) {
      console.log('Orphaned modules:');
      orphanedModules.forEach(module => {
        console.log(`- ${module.title} (ID: ${module.id.substring(0, 8)}...)`);
      });
    }

    // Show modules with parent courses
    const validModules = currentModules.filter(module => module.course);
    console.log(`✅ Valid modules (with parent course): ${validModules.length}`);
    
    if (validModules.length > 0) {
      console.log('Valid modules:');
      validModules.forEach(module => {
        console.log(`- ${module.title} → ${module.course.title}`);
      });
    }

    // 2. Delete user progress first (to avoid foreign key constraints)
    if (currentModules.length > 0) {
      console.log(`\n🗑️ Deleting user progress records first...`);
      const allProgress = await progressRepo.find();
      if (allProgress.length > 0) {
        await progressRepo.remove(allProgress);
        console.log(`✅ Deleted ${allProgress.length} progress records!`);
      }

      // 3. Now delete all existing modules
      console.log(`\n🗑️ Deleting all ${currentModules.length} existing modules...`);
      await moduleRepo.remove(currentModules);
      console.log('✅ All modules deleted successfully!');
    } else {
      console.log('\n✅ No modules to delete.');
    }

    // 4. Re-seed modules with proper course relationships
    console.log('\n🌱 Starting module re-seeding...');
    await SeedCourseModules.run(dataSource);
    
    // 5. Verify the results
    console.log('\n🔍 Verification after seeding:');
    const newModules = await moduleRepo.find({
      relations: ['course']
    });
    
    console.log(`📊 Total modules seeded: ${newModules.length}`);
    
    // Group by course
    const modulesByCourse = new Map();
    newModules.forEach(module => {
      const courseTitle = module.course ? module.course.title : 'No Course';
      if (!modulesByCourse.has(courseTitle)) {
        modulesByCourse.set(courseTitle, []);
      }
      modulesByCourse.get(courseTitle).push(module);
    });

    console.log('\n📈 Modules by course:');
    for (const [courseTitle, modules] of modulesByCourse.entries()) {
      console.log(`\n📚 ${courseTitle}: ${modules.length} modules`);
      modules
        .sort((a, b) => a.order - b.order)
        .forEach(module => {
          console.log(`   ${module.order}. ${module.title}`);
        });
    }

    // Check for orphaned modules
    const orphaned = newModules.filter(m => !m.course);
    if (orphaned.length > 0) {
      console.log(`\n🚨 WARNING: ${orphaned.length} modules still have no parent course!`);
      orphaned.forEach(module => {
        console.log(`- ${module.title}`);
      });
    } else {
      console.log('\n✅ SUCCESS: All modules have parent courses!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

resetModules();
