import dataSource from '../../data-source';
import { UserProgress } from '../../user/entities/user/user-progress';
import { SeedUserProgress } from './user-progress.seeder';

async function resetUserProgress() {
  try {
    // Initialize data source
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    // Clear existing user progress
    const progressRepository = dataSource.getRepository(UserProgress);
    await progressRepository.clear(); // Use clear() instead of delete({})
    console.log('🗑️  Cleared existing user progress');

    // Seed new progress data
    await SeedUserProgress.run(dataSource);
    
    console.log('🎉 User progress reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting user progress:', error);
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
  resetUserProgress();
}

export default resetUserProgress;
