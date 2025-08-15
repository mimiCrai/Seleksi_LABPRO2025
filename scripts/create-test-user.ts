import dataSource from './src/data-source';
import { User } from './src/user/entities/user/user';
import * as bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected successfully!');

    const userRepository = dataSource.getRepository(User);

    // Check if testuser already exists
    const existingUser = await userRepository.findOne({ 
      where: { username: 'testuser' } 
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      return;
    }

    // Create testuser
    const hashedPassword = await bcrypt.hash('password123', 10);

    const testUser = userRepository.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      balance: 5000,
      is_admin: false,
    });

    await userRepository.save(testUser);
    console.log('✅ Created testuser with password: password123');
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Balance: ${testUser.balance} credits`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

createTestUser();
