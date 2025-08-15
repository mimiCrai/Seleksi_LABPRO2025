import { DataSource } from 'typeorm';
import { UserCourse } from '../../user/entities/user/user-course';
import { User } from '../../user/entities/user/user';
import { Course } from '../../course/entities/course/course';

export class SeedUserCourses {
  static async run(dataSource: DataSource): Promise<void> {
    const userCourseRepository = dataSource.getRepository(UserCourse);
    const userRepository = dataSource.getRepository(User);
    const courseRepository = dataSource.getRepository(Course);

    // Check if user courses already exist
    const existingUserCourses = await userCourseRepository.count();
    if (existingUserCourses > 0) {
      console.log('User courses already exist, skipping seed...');
      return;
    }

    // Get users and courses
    const users = await userRepository.find();
    const courses = await courseRepository.find();

    const userMap = new Map(users.map(user => [user.id, user]));
    const courseMap = new Map(courses.map(course => [course.id, course]));

    // Create sample user course purchases
    const userCourses = [
      // testuser purchases
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440002'), // testuser
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440106'), // Test Course
        purchased_at: new Date('2025-08-01'),
      },
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440002'), // testuser
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440101'), // JavaScript Mastery
        purchased_at: new Date('2025-08-02'),
      },
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440002'), // testuser
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440103'), // React Bootcamp
        purchased_at: new Date('2025-08-05'),
      },

      // johndoe purchases
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440003'), // johndoe
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440102'), // Python for Data Science
        purchased_at: new Date('2025-07-28'),
      },
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440003'), // johndoe
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440104'), // Database Design & SQL
        purchased_at: new Date('2025-08-03'),
      },

      // janedoe purchases
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440004'), // janedoe
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440105'), // Node.js Backend
        purchased_at: new Date('2025-07-30'),
      },
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440004'), // janedoe
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440101'), // JavaScript Mastery
        purchased_at: new Date('2025-08-06'),
      },
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440004'), // janedoe
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440106'), // Test Course
        purchased_at: new Date('2025-08-07'),
      },

      // student1 purchases
      {
        user: userMap.get('550e8400-e29b-41d4-a716-446655440005'), // student1
        course: courseMap.get('550e8400-e29b-41d4-a716-446655440106'), // Test Course
        purchased_at: new Date('2025-08-04'),
      },
    ];

    await userCourseRepository.save(userCourses);
    console.log(`✅ Seeded ${userCourses.length} user course purchases successfully!`);
  }
}
