import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';

// Load environment variables
ConfigModule.forRoot();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts', 'src/**/entities/**/*.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Set to false for production
  logging: true,
});
