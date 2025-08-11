import dataSource from './src/data-source';

async function checkCourses() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    // Direct query to check courses
    const courseRepo = dataSource.getRepository('Course');
    const courses = await courseRepo.find();
    
    console.log(`\n📊 Found ${courses.length} courses in database:`);
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ID: ${course.id.substring(0, 8)}...`);
      console.log(`   Title: ${course.title}`);
      console.log(`   Instructor: ${course.instructor}`);
      console.log(`   Price: $${course.price}`);
      console.log(`   Created: ${course.created_at}`);
      console.log('');
    });

    // Check with relations
    console.log('\n🔗 Checking with module relations:');
    const coursesWithModules = await courseRepo.find({
      relations: ['modules'],
    });
    
    coursesWithModules.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - ${course.modules?.length || 0} modules`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

checkCourses();
