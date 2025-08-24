# 🎓 Grocademy - Seleksi LABPRO 2025

## 👤 Identitas Diri

**Nama:** Aloisius Adrian Stevan Gunawan
**NIM:** 13523054

---


## 🚀 Cara Menjalankan Aplikasi

Buka website [https://seleksilabpro2025-production.up.railway.app/login]

### 💻 Development Lokal

```bash
# 1. Install dependencies
npm install

# 2. Setup database MySQL
mysql -u root -p -e "CREATE DATABASE grocademy_db;"

# 3. Setup environment variables
cp config/.env.example .env
# Edit file .env dengan konfigurasi database Anda

# 4. Jalankan migrasi dan seeding
npm run migration:run
npm run seed

# 5. Start development server
npm run start:dev

# Aplikasi akan berjalan di http://localhost:3000
```

### 📱 Production Deployment

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm run start:prod
```

## 🎯 Design Pattern yang Digunakan

### 1. **Model-View-Controller (MVC)**
- **Alasan:** Memisahkan logika bisnis, presentasi, dan kontrol aplikasi untuk maintainability yang lebih baik
- **Implementasi:** 
  - **Model:** Entitas TypeORM (`src/*/entities/`)
  - **View:** Template Handlebars (`views/`)
  - **Controller:** NestJS Controllers (`src/*/*.controller.ts`)

### 2. **Repository Pattern**
- **Alasan:** Abstraksi akses database dan memudahkan testing dengan mock data
- **Implementasi:** Service layer yang menggunakan TypeORM Repository

### 3. **Dependency Injection (DI)**
- **Alasan:** Loose coupling antar komponen dan memudahkan testing
- **Implementasi:** NestJS built-in DI container dengan decorators `@Injectable()`

### 4. **Data Transfer Object (DTO)**
- **Alasan:** Validasi input, type safety, dan dokumentasi API yang konsisten
- **Implementasi:** Class-based DTOs dengan class-validator (`src/*/dto/`)

### 5. **Guard Pattern**
- **Alasan:** Centralized authentication dan authorization logic
- **Implementasi:** 
  - `AuthGuard('jwt')` untuk API authentication
  - `CookieAuthGuard` untuk web page authentication
  - `AdminGuard` untuk admin-only endpoints

### 6. **Module Pattern**
- **Alasan:** Modular architecture untuk scalability dan separation of concerns
- **Implementasi:** NestJS Modules (`src/*/*.module.ts`)

### 7. **Interceptor Pattern**
- **Alasan:** Cross-cutting concerns seperti logging, transformation, dan error handling
- **Implementasi:** File upload interceptors, response transformation

### 8. **Strategy Pattern**
- **Alasan:** Multiple authentication strategies (JWT, Local)
- **Implementasi:** Passport strategies untuk berbagai metode autentikasi

## 🛠️ Technology Stack

### Backend Framework & Language
- **Node.js:** v18+
- **NestJS:** v11.0.1 - Progressive Node.js framework
- **TypeScript:** v5+ - Type-safe JavaScript

### Database & ORM
- **MySQL:** v8.0+ - Relational database
- **TypeORM:** v0.3.25 - Object-Relational Mapping
- **mysql2:** v3.14.3 - MySQL driver

### Authentication & Security
- **Passport.js:** v0.7.0 - Authentication middleware
- **passport-jwt:** v4.0.1 - JWT authentication strategy
- **@nestjs/jwt:** v11.0.0 - JWT utilities
- **bcrypt:** v6.0.0 - Password hashing

### API Documentation & Validation
- **@nestjs/swagger:** v11.2.0 - OpenAPI documentation
- **class-validator:** v0.14.2 - Validation decorators
- **class-transformer:** v0.5.1 - Object transformation

### File Storage & Upload
- **multer:** v2.0.2 - File upload middleware
- **@aws-sdk/client-s3:** v3.872.0 - AWS S3 integration
- **uuid:** v11.1.0 - Unique identifier generation

### Template Engine & Frontend
- **Handlebars (hbs):** v4.2.0 - Template engine
- **cookie-parser:** v1.4.7 - Cookie parsing

### Development & DevOps
- **Docker** - Containerization
- **ESLint:** v9.18.0 - Code linting
- **Prettier:** v10.0.1 - Code formatting
- **Jest:** v30.0.0 - Testing framework

### Deployment & Configuration
- **dotenv:** v17.2.1 - Environment configuration
- **@nestjs/config:** v4.0.2 - Configuration management

## 📋 Endpoint API

### 🔐 Authentication Endpoints
- `GET /` - Uptime
- `GET /health` - Health check
- `GET /register` - Registration page
- `POST /register` - User registration (web)
- `GET /login` - Login page
- `POST /login` - User login (web)
- `POST /logout` - User logout (web)
- `POST /api/auth/register` - User registration (API)
- `POST /api/auth/login` - User login (API)
- `GET /api/auth/self` - Get current user info (API)

### 👥 User Management Endpoints
**Web Pages:**
- `GET /dashboard` - User dashboard
- `GET /profile` - User profile page
- `GET /certificates` - User certificates page

**Admin API:**
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users/:id/balance` - Add/subtract user balance (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### 📚 Course Management Endpoints
**Web Pages:**
- `GET /browse` - Browse courses page
- `GET /courses/:id` - Course detail page
- `GET /courses/:id/modules` - Course modules page
- `GET /my-courses` - My courses page
- `GET /my-courses/:courseId/continue` - Continue course learning
- `GET /my-courses/:courseId/modules` - My course modules
- `POST /buy/:id` - Buy course (web form)
- `POST /buy-course` - Buy course (AJAX)

**Course API:**
- `GET /api/courses` - Get all courses (public)
- `GET /api/courses/:id` - Get course by ID (public)
- `GET /api/courses/:id/details` - Get course details with modules (public)
- `POST /api/courses` - Create new course (authenticated)
- `PUT /api/courses/:id` - Update course (authenticated)
- `DELETE /api/courses/:id` - Delete course (authenticated)
- `GET /api/courses/my-courses` - Get user's purchased courses
- `POST /api/courses/:id/buy` - Buy course (API)

### 📖 Module Management Endpoints
**Web Pages:**
- `GET /modules/:id` - Module detail page
- `POST /modules/:moduleId/complete` - Mark module as complete

**Module API:**
- `POST /api/courses/:courseId/modules` - Create module for course
- `GET /api/courses/:courseId/modules` - Get course modules
- `PATCH /api/courses/:courseId/modules/reorder` - Reorder modules
- `GET /api/modules/:id` - Get module by ID
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module
- `PATCH /api/modules/:id/complete` - Mark module as complete

### 📁 File Upload Endpoints
- `POST /api/upload/image` - Upload image file
- `POST /api/upload/pdf` - Upload PDF file
- `POST /api/upload/video` - Upload video file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/file/:key` - Delete uploaded file

### 🏆 Certificate Endpoints
- `GET /api/certificates/:userId/:courseId` - Generate/get certificate


## 🎉 Bonus yang Dikerjakan

### ✅ 1. **Deployment**
- Link: ![LINK_WEBSITE](https://seleksilabpro2025-production.up.railway.app/login)

### ✅ 2. **Lighthouse**
- JWT-based API authentication
- Cookie-based web authentication  
- Role-based access control (Admin/User)
- Secure password hashing dengan bcrypt

### ✅ 3. **Responsive Layout**
- AWS S3 integration untuk production
- Local storage untuk development
- Multiple file type support (images, PDFs, videos)
- File upload dengan validation

### ✅ 4. **Dokumentasi API**
- Complete OpenAPI/Swagger documentation
- Interactive API testing interface
- Automatic schema generation dari DTOs

## 📸 Screenshot Aplikasi

