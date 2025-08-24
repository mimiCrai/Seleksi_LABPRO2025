import dataSource from './src/data-source';
import { Course } from './src/course/entities/course/course';

async function addMissingCourses() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    const courseRepo = dataSource.getRepository(Course);

    // The 6 courses that should be seeded
    const coursesToAdd = [
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        title: 'Complete JavaScript Mastery',
        description: 'Master modern JavaScript from basics to advanced concepts. Learn ES6+, DOM manipulation, async programming, and popular frameworks.',
        instructor: 'Dr. Sarah Wilson',
        topics: ['JavaScript', 'ES6', 'DOM', 'Async Programming', 'Frameworks'],
        price: 1200,
        thumbnail_image: '/static/courses/javascript-mastery.jpg',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        title: 'Python for Data Science',
        description: 'Learn Python programming with focus on data analysis, visualization, and machine learning. Perfect for beginners and professionals.',
        instructor: 'Prof. Michael Chen',
        topics: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization'],
        price: 1500,
        thumbnail_image: '/static/courses/python-data-science.jpg',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        title: 'React Development Bootcamp',
        description: 'Build modern web applications with React. Learn hooks, context, routing, and state management with practical projects.',
        instructor: 'Alex Rodriguez',
        topics: ['React', 'Hooks', 'Context', 'Redux', 'Next.js'],
        price: 1800,
        thumbnail_image: '/static/courses/react-bootcamp.jpg',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440104',
        title: 'Database Design & SQL',
        description: 'Master database fundamentals, SQL queries, database design principles, and optimization techniques for real-world applications.',
        instructor: 'Dr. Emily Foster',
        topics: ['SQL', 'Database Design', 'MySQL', 'PostgreSQL', 'Optimization'],
        price: 1000,
        thumbnail_image: '/static/courses/database-sql.jpg',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440105',
        title: 'Node.js Backend Development',
        description: 'Build scalable backend applications with Node.js, Express, and MongoDB. Learn API development, authentication, and deployment.',
        instructor: 'James Miller',
        topics: ['Node.js', 'Express', 'MongoDB', 'API Development', 'Authentication'],
        price: 1400,
        thumbnail_image: '/static/courses/nodejs-backend.jpg',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440106',
        title: 'Test Course',
        description: 'A test course for testing functionality with multiple modules and progressive learning structure.',
        instructor: 'Test Instructor',
        topics: ['Testing', 'Development', 'Learning'],
        price: 500,
        thumbnail_image: '/static/courses/test-course.jpg',
      },
    ];

    // Check which courses are missing
    const existingCourses = await courseRepo.find();
    const existingIds = existingCourses.map(c => c.id);
    
    console.log(`\n📊 Current courses in database: ${existingCourses.length}`);
    existingCourses.forEach(course => {
      console.log(`- ${course.title}`);
    });

    const missingCourses = coursesToAdd.filter(course => !existingIds.includes(course.id));
    
    if (missingCourses.length === 0) {
      console.log('\n✅ All courses are already present!');
      return;
    }

    console.log(`\n➕ Adding ${missingCourses.length} missing courses:`);
    
    for (const courseData of missingCourses) {
      console.log(`   Adding: ${courseData.title}`);
      await courseRepo.save(courseData);
    }

    console.log(`\n🎉 Successfully added ${missingCourses.length} courses!`);
    
    // Verify final count
    const finalCount = await courseRepo.count();
    console.log(`📊 Total courses now: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

addMissingCourses();
