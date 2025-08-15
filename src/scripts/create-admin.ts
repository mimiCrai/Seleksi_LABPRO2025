import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  try {
    // Check if admin already exists
    const existing = await userService.findByEmailOrUsername('admin@grocademy.com', 'nimon_master');
    
    if (existing) {
      console.log('Admin user already exists!');
      await app.close();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await userService.create({
      username: 'nimon_master',
      email: 'admin@grocademy.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      is_admin: true,
      balance: 1000000, // Give admin some balance
    });

    console.log('Admin user created successfully!');
    console.log('Username: nimon_master');
    console.log('Email: admin@grocademy.com');
    console.log('Password: admin123');
    console.log('Admin ID:', admin.id);
    
  } catch (error) {
    console.error('Error creating admin:', error);
  }

  await app.close();
}

createAdmin();
