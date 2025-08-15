import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user/user';
import * as bcrypt from 'bcrypt';

export class SeedUsers {
  static async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seed...');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        username: 'admin',
        email: 'admin@grocademy.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        balance: 10000,
        is_admin: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'User',
        balance: 5000,
        is_admin: false,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        balance: 3000,
        is_admin: false,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        username: 'janedoe',
        email: 'jane.doe@example.com',
        password: hashedPassword,
        first_name: 'Jane',
        last_name: 'Doe',
        balance: 7500,
        is_admin: false,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        username: 'student1',
        email: 'student1@example.com',
        password: hashedPassword,
        first_name: 'Alice',
        last_name: 'Johnson',
        balance: 2000,
        is_admin: false,
      },
    ];

    await userRepository.save(users);
    console.log(`✅ Seeded ${users.length} users successfully!`);
  }
}
