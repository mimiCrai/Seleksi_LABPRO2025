# Database Seeding and Migration Guide

This guide explains how to set up and test the Grocademy backend database with comprehensive test data.

## Quick Start

### 1. Set up Environment Variables
Make sure your `.env` file has the correct database configuration:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
```

### 2. Run the Setup Script (Automated)
```bash
node setup-database.js
```

This will:
- Install dependencies
- Run database seeders
- Display test credentials

### 3. Manual Setup (Alternative)
```bash
# Install dependencies
npm install

# Run all seeders
npm run seed

# Or run individual seeders
npm run seed:users
npm run seed:courses
```

## Test Data Overview

### 🎯 Test Credentials

#### Primary Test User
- **Username:** `testuser`
- **Password:** `password123`
- **Email:** test@example.com
- **Balance:** 5000 credits
- **Courses:** Test Course (partial progress)

#### Admin User
- **Username:** `nimon_master` (existing)
- **Balance:** High credits
- **Admin privileges:** Yes

#### Other Test Users
- `nimon02` - Has Test Course with 50% progress (2/4 modules completed)
- `nimon01` - Regular user
- `nimon_master_01` - Another admin user

### 📚 Available Courses

#### 1. Test Course
- **Price:** 500 credits
- **Modules:** 4 modules
- **Topics:** Testing, Development, Learning
- **Progress:** Some users have partial completion
- **Purpose:** Perfect for testing course/module functionality

#### 2. Advanced Banana Studies (Existing)
- **Purpose:** Pre-existing course for testing

### 🧪 Test Scenarios

#### Scenario 1: New User Experience
1. Login as `testuser` / `password123`
2. Browse courses (should see all available courses)
3. Purchase Test Course (500 credits)
4. Start learning → Should go to first module
5. Complete modules and test progress tracking

#### Scenario 2: Continuing User
1. Login as `nimon02`
2. Go to My Courses
3. Test Course should show 50% progress
4. Click "Continue Learning" → Should go to 3rd module (next incomplete)
5. Click "Course Details" → Should show all 4 modules with completion status

#### Scenario 3: Course Details & Modules
1. Visit any course details page
2. Should see all modules listed
3. Modules should show completion status if user owns the course
4. "Start Learning" should go to first module
5. "Continue Learning" should go to next incomplete module

## Database Structure

### Tables Created
- `user` - User accounts and profiles
- `course` - Available courses
- `course_module` - Individual modules within courses
- `user_course` - Course purchases by users
- `user_progress` - Module completion tracking

### Key Features Implemented
- **Progressive Learning:** Next module logic based on completion
- **Progress Tracking:** Percentage-based progress calculation
- **Course Management:** Full CRUD operations
- **User Management:** Authentication and balance tracking

## API Endpoints for Testing

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/self` - Get current user profile

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get single course
- `GET /api/courses/:id/details` - Get course with modules and progress
- `POST /api/courses/:id/buy` - Purchase course

### My Courses
- `GET /api/courses/my-courses` - Get user's purchased courses
- `GET /api/courses/:id/modules` - Get course modules with progress

### Module Progress
- `PATCH /api/modules/:id/complete` - Mark module as completed

### Frontend Pages
- `GET /my-courses` - User's course dashboard
- `GET /courses/:id` - Course details page
- `GET /my-courses/:id/continue` - Continue learning (redirects to next module)
- `GET /modules/:id` - Individual module learning page

## Scripts Available

```bash
# Database operations
npm run seed                 # Run all seeders
npm run migration:run        # Run migrations
npm run migration:revert     # Revert last migration

# Development
npm run start:dev           # Start development server
npm run build              # Build for production
npm run test               # Run tests

# Custom scripts
node setup-database.js     # Full database setup with test data
```

## Testing the Implementation

### 1. Course Details Functionality
✅ "Course Details" button shows all modules
✅ Modules display completion status
✅ Course progress is accurately calculated
✅ Module order is maintained

### 2. Learning Continuation
✅ "Start Learning" goes to first module
✅ "Continue Learning" goes to next incomplete module  
✅ Progress tracking works correctly
✅ Completed courses show "Review" option

### 3. My Courses Page
✅ Shows all purchased courses
✅ Displays accurate progress percentages
✅ Course statistics are calculated correctly
✅ Filtering and sorting work

### 4. Module Learning
✅ Individual module pages load correctly
✅ Module completion updates progress
✅ Next module navigation works
✅ Content is properly displayed

## Troubleshooting

### Database Connection Issues
```bash
# Check your .env configuration
# Ensure MySQL is running
# Verify database exists and user has permissions
```

### Migration Issues
```bash
# Reset database schema
npm run migration:revert
npm run migration:run
```

### Seeding Issues
```bash
# Clear and re-seed data
npm run seed
```

### Server Not Starting
```bash
# Check for port conflicts
# Verify all dependencies are installed
npm install
npm run start:dev
```

## Development Notes

- The system uses TypeORM with MySQL database
- JWT authentication for API security  
- Handlebars templating for frontend
- Comprehensive error handling
- Proper relationship management between entities
- Progress calculation based on completed modules
- Next module logic for seamless learning experience

Happy testing! 🚀
