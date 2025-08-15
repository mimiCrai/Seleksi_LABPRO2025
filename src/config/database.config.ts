import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(): TypeOrmModuleOptions {
  // Railway provides MYSQL_URL, local development uses individual variables
  const mysqlUrl = process.env.MYSQL_URL;
  
  if (mysqlUrl) {
    // Parse Railway's MySQL URL format: mysql://user:password@host:port/database
    return {
      type: 'mysql',
      url: mysqlUrl,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // Only sync in dev
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }

  // Fallback to individual environment variables (for local development)
  return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
  };
}
