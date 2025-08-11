import dataSource from './src/data-source';
import { User } from './src/user/entities/user/user';
import { Course } from './src/course/entities/course/course';

async function debugData() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    const userRepository = dataSource.getRepository(User);
    const courseRepository = dataSource.getRepository(Course);

    const users = await userRepository.find();
    const courses = await courseRepository.find();

    console.log('\n👥 Users:');
    users.forEach(user => {
      console.log(`  ${user.id} - ${user.username} (${user.email})`);
    });

    console.log('\n📚 Courses:');
    courses.forEach(course => {
      console.log(`  ${course.id} - ${course.title}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

debugData();
