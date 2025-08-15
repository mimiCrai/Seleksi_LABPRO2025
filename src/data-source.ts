import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';

// Load environment variables
ConfigModule.forRoot();

export default new DataSource({
  ...getDatabaseConfig(),
  entities: ['src/**/*.entity.ts', 'src/**/entities/**/*.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Set to false for production
  logging: true,
} as any);
