import { DataSource } from 'typeorm';
import { CourseModule } from '../../course/entities/course/course-module';
import { Course } from '../../course/entities/course/course';

export class SeedCourseModules {
  static async run(dataSource: DataSource): Promise<void> {
    const moduleRepository = dataSource.getRepository(CourseModule);
    const courseRepository = dataSource.getRepository(Course);

    // Check if modules already exist
    const existingModules = await moduleRepository.count();
    if (existingModules > 0) {
      console.log('Course modules already exist, skipping seed...');
      return;
    }

    // Get courses by their IDs
    const courses = await courseRepository.find();
    const courseMap = new Map(courses.map(course => [course.id, course]));

    const modules = [
      // JavaScript Mastery Course Modules
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript including variables, data types, and basic operations.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440101'),
        order: 1,
        pdf_content: '/static/modules/js-fundamentals.pdf',
        video_content: '/static/modules/js-fundamentals.mp4',
      },
      {
        title: 'Functions and Scope',
        description: 'Deep dive into JavaScript functions, scope, closures, and hoisting.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440101'),
        order: 2,
        pdf_content: '/static/modules/js-functions.pdf',
        video_content: '/static/modules/js-functions.mp4',
      },
      {
        title: 'DOM Manipulation',
        description: 'Learn how to interact with HTML elements using JavaScript DOM methods.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440101'),
        order: 3,
        pdf_content: '/static/modules/js-dom.pdf',
        video_content: '/static/modules/js-dom.mp4',
      },
      {
        title: 'ES6+ Features',
        description: 'Explore modern JavaScript features like arrow functions, destructuring, and modules.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440101'),
        order: 4,
        pdf_content: '/static/modules/js-es6.pdf',
        video_content: '/static/modules/js-es6.mp4',
      },
      {
        title: 'Async Programming',
        description: 'Master promises, async/await, and asynchronous JavaScript programming.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440101'),
        order: 5,
        pdf_content: '/static/modules/js-async.pdf',
        video_content: '/static/modules/js-async.mp4',
      },

      // Python for Data Science Modules
      {
        title: 'Python Basics',
        description: 'Introduction to Python syntax, variables, and data structures.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440102'),
        order: 1,
        pdf_content: '/static/modules/python-basics.pdf',
        video_content: '/static/modules/python-basics.mp4',
      },
      {
        title: 'NumPy Fundamentals',
        description: 'Learn numerical computing with NumPy arrays and operations.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440102'),
        order: 2,
        pdf_content: '/static/modules/numpy-fundamentals.pdf',
        video_content: '/static/modules/numpy-fundamentals.mp4',
      },
      {
        title: 'Pandas for Data Analysis',
        description: 'Master data manipulation and analysis with Pandas DataFrames.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440102'),
        order: 3,
        pdf_content: '/static/modules/pandas-analysis.pdf',
        video_content: '/static/modules/pandas-analysis.mp4',
      },
      {
        title: 'Data Visualization',
        description: 'Create compelling visualizations with Matplotlib and Seaborn.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440102'),
        order: 4,
        pdf_content: '/static/modules/data-visualization.pdf',
        video_content: '/static/modules/data-visualization.mp4',
      },

      // React Development Bootcamp Modules
      {
        title: 'React Fundamentals',
        description: 'Learn React components, JSX, and the virtual DOM.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440103'),
        order: 1,
        pdf_content: '/static/modules/react-fundamentals.pdf',
        video_content: '/static/modules/react-fundamentals.mp4',
      },
      {
        title: 'React Hooks',
        description: 'Master useState, useEffect, and custom hooks.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440103'),
        order: 2,
        pdf_content: '/static/modules/react-hooks.pdf',
        video_content: '/static/modules/react-hooks.mp4',
      },
      {
        title: 'State Management',
        description: 'Learn Context API and Redux for application state management.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440103'),
        order: 3,
        pdf_content: '/static/modules/react-state.pdf',
        video_content: '/static/modules/react-state.mp4',
      },

      // Database Design & SQL Modules
      {
        title: 'Database Fundamentals',
        description: 'Introduction to databases, tables, and relationships.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440104'),
        order: 1,
        pdf_content: '/static/modules/database-fundamentals.pdf',
        video_content: '/static/modules/database-fundamentals.mp4',
      },
      {
        title: 'SQL Queries',
        description: 'Learn SELECT, INSERT, UPDATE, and DELETE operations.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440104'),
        order: 2,
        pdf_content: '/static/modules/sql-queries.pdf',
        video_content: '/static/modules/sql-queries.mp4',
      },
      {
        title: 'Advanced SQL',
        description: 'Master JOINs, subqueries, and complex database operations.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440104'),
        order: 3,
        pdf_content: '/static/modules/advanced-sql.pdf',
        video_content: '/static/modules/advanced-sql.mp4',
      },

      // Node.js Backend Development Modules
      {
        title: 'Node.js Basics',
        description: 'Introduction to Node.js runtime and core modules.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440105'),
        order: 1,
        pdf_content: '/static/modules/nodejs-basics.pdf',
        video_content: '/static/modules/nodejs-basics.mp4',
      },
      {
        title: 'Express Framework',
        description: 'Build web applications and APIs with Express.js.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440105'),
        order: 2,
        pdf_content: '/static/modules/express-framework.pdf',
        video_content: '/static/modules/express-framework.mp4',
      },
      {
        title: 'Database Integration',
        description: 'Connect to databases and perform CRUD operations.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440105'),
        order: 3,
        pdf_content: '/static/modules/database-integration.pdf',
        video_content: '/static/modules/database-integration.mp4',
      },

      // Test Course Modules
      {
        title: 'Introduction to Testing',
        description: 'Learn the basics of software testing and test-driven development.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440106'),
        order: 1,
        pdf_content: '/static/modules/intro-testing.pdf',
        video_content: '/static/modules/intro-testing.mp4',
      },
      {
        title: 'Unit Testing',
        description: 'Master unit testing techniques and frameworks.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440106'),
        order: 2,
        pdf_content: '/static/modules/unit-testing.pdf',
        video_content: '/static/modules/unit-testing.mp4',
      },
      {
        title: 'Integration Testing',
        description: 'Learn how to test component interactions and API endpoints.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440106'),
        order: 3,
        pdf_content: '/static/modules/integration-testing.pdf',
        video_content: '/static/modules/integration-testing.mp4',
      },
      {
        title: 'Test Automation',
        description: 'Automate your testing workflow and continuous integration.',
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440106'),
        order: 4,
        pdf_content: '/static/modules/test-automation.pdf',
        video_content: '/static/modules/test-automation.mp4',
      },
    ];

    await moduleRepository.save(modules);
    console.log(`✅ Seeded ${modules.length} course modules successfully!`);
  }
}
