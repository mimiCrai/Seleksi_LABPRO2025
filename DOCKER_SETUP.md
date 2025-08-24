# 🐳 Docker Setup Guide

## Quick Start

### 🚀 Production Deployment
```bash
# Start production environment
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### 🛠️ Development Environment
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Check logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## What's Included

### Services
- **app**: NestJS application
- **db**: MySQL 8.0 database
- **phpmyadmin**: Database management UI (accessible at http://localhost:8080)

### Auto-Seeding
Both configurations have `AUTO_SEED=true` by default, which means:
- Database will be automatically seeded on first startup
- Admin user will be created: `admin` / `admin123`
- Sample courses and users will be added

## Environment Variables

The Docker configurations set these automatically:

```yaml
environment:
  NODE_ENV: production  # or development
  DB_HOST: db
  DB_PORT: 3306
  DB_USERNAME: grocademy_user
  DB_PASSWORD: grocademy_password
  DB_NAME: grocademy_db
  JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
  AUTO_SEED: "true"  # Set to "false" after initial deployment
  BASE_URL: http://localhost:3000
```

## Production Deployment Steps

### 1. Initial Deployment
```bash
# Clone repository
git clone <your-repo>
cd grocademy-backend

# Start services
docker-compose up -d
```

### 2. After First Successful Start
**Important**: Disable auto-seeding after initial deployment:

Edit `docker-compose.yml`:
```yaml
environment:
  AUTO_SEED: "false"  # Change from "true" to "false"
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### 3. Access Your App
- **Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs
- **Database Management**: http://localhost:8080 (phpMyAdmin)

## Customization

### Change Database Credentials
Update both files:
- `docker-compose.yml`
- `docker-compose.dev.yml`

Change:
```yaml
db:
  environment:
    MYSQL_ROOT_PASSWORD: your-root-password
    MYSQL_USER: your-username
    MYSQL_PASSWORD: your-password

app:
  environment:
    DB_USERNAME: your-username
    DB_PASSWORD: your-password
```

### Change JWT Secret
```yaml
app:
  environment:
    JWT_SECRET: your-super-secure-secret-key
```

### Persistent Data
Database data is stored in Docker volumes:
- Production: `db_data`
- Development: `db_data_dev`

## Troubleshooting

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs db

# Follow logs
docker-compose logs -f app
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Clean Start (Remove all data)
```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Database Connection Issues
If the app can't connect to the database:

1. Check if database is healthy:
   ```bash
   docker-compose logs db
   ```

2. Wait for database initialization (can take 30-60 seconds on first start)

3. Restart the app service:
   ```bash
   docker-compose restart app
   ```

## File Uploads
The `uploads/` directory is mounted as a volume, so uploaded files persist between container restarts.

## Manual Seeding
If you prefer manual control over seeding:

1. Set `AUTO_SEED: "false"` in docker-compose.yml
2. Start services: `docker-compose up -d`
3. Run seeding manually:
   ```bash
   # Via API
   curl -X POST http://localhost:3000/admin/seed
   
   # Or via container
   docker exec grocademy_app npm run seed:prod
   ```
