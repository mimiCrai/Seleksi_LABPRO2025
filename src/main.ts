import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import * as hbs from 'hbs';
import { existsSync } from 'fs';
import { DataSource } from 'typeorm';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

// Import seeders for auto-seeding
import { SeedUsers } from './database/seeds/user.seeder';
import { SeedCourses } from './database/seeds/course.seeder';
import { SeedCourseModules } from './database/seeds/course-module.seeder';
import { SeedUserCourses } from './database/seeds/user-course.seeder';
import { SeedUserProgress } from './database/seeds/user-progress.seeder';



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true, // Allow cookies to be sent
  });
  
  // View engine - handle both development and production paths
  let viewsPath: string;
  
  // Try different possible paths for views
  if (existsSync(join(__dirname, '..', 'views'))) {
    viewsPath = join(__dirname, '..', 'views'); // Development (from src/ to views/)
  } else if (existsSync(join(__dirname, '..', '..', 'views'))) {
    viewsPath = join(__dirname, '..', '..', 'views'); // Development (from dist/src/ to views/)
  } else if (existsSync(join(__dirname, 'views'))) {
    viewsPath = join(__dirname, 'views'); // Production (dist/views)
  } else {
    viewsPath = join(__dirname, '..'); // Fallback (dist root with .hbs files)
  }
  
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');
  app.useGlobalPipes(new ValidationPipe());

  // Register Handlebars helpers
  const handlebars = hbs.handlebars;
  handlebars.registerHelper('eq', (a, b) => a === b);
  handlebars.registerHelper('gt', (a, b) => a > b);
  handlebars.registerHelper('lt', (a, b) => a < b);
  handlebars.registerHelper('add', (a, b) => parseInt(a) + parseInt(b));
  handlebars.registerHelper('subtract', (a, b) => parseInt(a) - parseInt(b));
  handlebars.registerHelper('multiply', (a, b) => parseInt(a) * parseInt(b));
  handlebars.registerHelper('range', (start: number, end: number) => {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  });
  handlebars.registerHelper('formatDate', (date, format) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    
    if (format === 'MMM DD, YYYY HH:mm') {
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  });

  app.use(cookieParser());

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Serve static files from static directory (for course thumbnails, etc.)
  app.useStaticAssets(join(__dirname, '..', 'static'), {
    prefix: '/static/',
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Grocademy API')
    .setDescription('Dokumentasi API Grocademy untuk seleksi.\n\n'
      + 'Main Endpoints:\n'
      + '- /api/auth: Authentication (register, login, profile)\n'
      + '- /api/courses: Course listing, buying, modules, progress\n'
      + '- /api/modules: Mark module as completed\n\n'
      + 'See each endpoint for details, required fields, and responses.'
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token for authentication. Get token from /api/auth/login.'
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // bisa diakses di /docs

  // Auto-seed database if AUTO_SEED environment variable is set
  if (process.env.AUTO_SEED === 'true') {
    try {
      console.log('🌱 AUTO_SEED enabled, running database seeding...');
      const dataSource = app.get(DataSource);
      
      await SeedUsers.run(dataSource);
      await SeedCourses.run(dataSource);
      await SeedCourseModules.run(dataSource);
      await SeedUserCourses.run(dataSource);
      await SeedUserProgress.run(dataSource);
      
      console.log('✅ Auto-seeding completed successfully!');
    } catch (error) {
      console.error('❌ Auto-seeding failed:', error);
      // Don't crash the app if seeding fails
    }
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
bootstrap();
