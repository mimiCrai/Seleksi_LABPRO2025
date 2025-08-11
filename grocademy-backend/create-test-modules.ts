import dataSource from './src/data-source';
import { CourseModule } from './src/course/entities/course/course-module';
import { Course } from './src/course/entities/course/course';

async function createTestModules() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    const courseRepository = dataSource.getRepository(Course);
    const moduleRepository = dataSource.getRepository(CourseModule);

    const testCourse = await courseRepository.findOne({ 
      where: { title: 'Test Course' } 
    });
    
    if (!testCourse) {
      console.log('❌ Test Course not found');
      return;
    }

    // Check if modules already exist
    const existingModules = await moduleRepository.find({ 
      where: { course: { id: testCourse.id } }
    });

    if (existingModules.length > 0) {
      console.log(`✅ Test Course already has ${existingModules.length} modules`);
      return;
    }

    // Create test modules
    const modules = [
      {
        title: 'Introduction to Testing',
        description: 'Learn the basics of software testing and test-driven development.',
        course: testCourse,
        order: 1,
        pdf_content: '/static/modules/intro-testing.pdf',
        video_content: '/static/modules/intro-testing.mp4',
      },
      {
        title: 'Unit Testing',
        description: 'Master unit testing techniques and frameworks.',
        course: testCourse,
        order: 2,
        pdf_content: '/static/modules/unit-testing.pdf',
        video_content: '/static/modules/unit-testing.mp4',
      },
      {
        title: 'Integration Testing',
        description: 'Learn how to test component interactions and API endpoints.',
        course: testCourse,
        order: 3,
        pdf_content: '/static/modules/integration-testing.pdf',
        video_content: '/static/modules/integration-testing.mp4',
      },
      {
        title: 'Test Automation',
        description: 'Automate your testing workflow and continuous integration.',
        course: testCourse,
        order: 4,
        pdf_content: '/static/modules/test-automation.pdf',
        video_content: '/static/modules/test-automation.mp4',
      },
    ];

    await moduleRepository.save(modules);
    console.log(`✅ Created ${modules.length} modules for Test Course`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

createTestModules();
