# 🌱 Database Seeding Guide for Production

## Admin User Credentials
After seeding, you can login with:
- **Username:** `admin`
- **Password:** `admin123`

## How to Seed Your Database in Production

### 🚀 Option 1: Auto-Seed on Startup (Recommended)

Set the `AUTO_SEED` environment variable to `true` in your deployment platform:

```bash
AUTO_SEED=true
```

The app will automatically seed the database on first startup. After seeding is complete, **disable** auto-seeding:

```bash
AUTO_SEED=false
```

### 🌐 Option 2: Via API Endpoint

After your app is deployed, make a POST request to trigger seeding:

```bash
curl -X POST https://your-app-url.com/admin/seed
```

### 💻 Option 3: Manual Script (if you have server access)

```bash
# Build the app first
npm run build

# Run production seeder
npm run seed:prod
```

## Platform-Specific Instructions

### Railway.app
1. Set environment variable: `AUTO_SEED=true`
2. Deploy your app
3. After successful deployment and seeding, update: `AUTO_SEED=false`

### Heroku
```bash
# Set via CLI
heroku config:set AUTO_SEED=true -a your-app-name

# Or use the Heroku dashboard to add the environment variable
```

### Vercel/Netlify
Add `AUTO_SEED=true` in your environment variables dashboard.

### Docker
Add to your docker-compose.yml:
```yaml
environment:
  - AUTO_SEED=true
```

## Seeded Data

The seeder creates:
- **1 Admin User:** username: `admin`, password: `admin123`
- **4 Regular Users** with sample data
- **6 Sample Courses** (JavaScript, Python, React, Node.js, SQL, Data Science)
- **Course modules** for each course
- **Sample user enrollments** and progress

## Important Notes

⚠️ **Security:** Always set `AUTO_SEED=false` after initial seeding to prevent accidental re-seeding.

✅ **Idempotent:** The seeder checks if data exists and skips seeding if users already exist.

🔒 **Admin Protection:** Admin users cannot be deleted or modified through the API (hardcoded protection).
