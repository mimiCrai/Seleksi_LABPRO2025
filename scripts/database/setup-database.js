#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting database setup...');

try {
  // Change to the project directory
  process.chdir(path.dirname(__filename));

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🌱 Running database seeders...');
  execSync('npm run seed', { stdio: 'inherit' });

  console.log('✅ Database setup completed successfully!');
  console.log('');
  console.log('🎯 Test credentials:');
  console.log('   Username: testuser');
  console.log('   Password: password123');
  console.log('   Balance: 5000 credits');
  console.log('');
  console.log('👤 Admin credentials:');
  console.log('   Username: admin');
  console.log('   Password: password123');
  console.log('   Balance: 10000 credits');
  console.log('');
  console.log('🎓 Available test courses:');
  console.log('   • Test Course (4 modules)');
  console.log('   • Complete JavaScript Mastery (5 modules)');
  console.log('   • Python for Data Science (4 modules)');
  console.log('   • React Development Bootcamp (3 modules)');
  console.log('   • Database Design & SQL (3 modules)');
  console.log('   • Node.js Backend Development (3 modules)');
  console.log('');
  console.log('🚀 Start the application with: npm run start:dev');

} catch (error) {
  console.error('❌ Error during database setup:', error.message);
  process.exit(1);
}
