# Docker Setup for Grocademy

This project includes Docker configuration for easy deployment and development.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

### Production Mode

1. **Build and start the application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Application: http://localhost:3000
   - phpMyAdmin: http://localhost:8080

### Development Mode

1. **Start in development mode:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **The application will:**
   - Auto-reload on file changes
   - Enable debug mode on port 9229
   - Mount source code as volume for live editing

## Commands

### Basic Operations
```bash
# Start services
docker-compose up

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs app
docker-compose logs db

# Rebuild and start
docker-compose up --build
```

### Database Operations
```bash
# Run migrations inside the container
docker-compose exec app npm run migration:run

# Run seeds
docker-compose exec app npm run seed

# Reset database
docker-compose exec app npm run db:reset

# Access MySQL directly
docker-compose exec db mysql -u grocademy_user -p grocademy_db
```

### Development Operations
```bash
# Install new packages (rebuild required after)
docker-compose exec app npm install package-name

# Run tests
docker-compose exec app npm test

# Access container shell
docker-compose exec app sh
```

## Environment Variables

The following environment variables are configured in `docker-compose.yml`:

- `DB_HOST`: Database host (set to `db` service)
- `DB_PORT`: Database port (3306)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: JWT secret key
- `NODE_ENV`: Node environment

## Database Access

### phpMyAdmin
- URL: http://localhost:8080
- Username: `grocademy_user`
- Password: `grocademy_password`

### Direct MySQL Connection
```bash
# From host machine
mysql -h localhost -P 3306 -u grocademy_user -p

# From inside container
docker-compose exec db mysql -u grocademy_user -p
```

## Troubleshooting

### Port Already in Use
If you get port conflicts:
```bash
# Stop existing services
docker-compose down

# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :3306

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if database is ready
docker-compose exec db mysqladmin ping -h localhost

# Check application logs
docker-compose logs app
```

### Container Build Issues
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## File Structure

```
.
├── Dockerfile              # Production container
├── Dockerfile.dev          # Development container
├── docker-compose.yml      # Production compose file
├── docker-compose.dev.yml  # Development compose file
├── .dockerignore           # Files to exclude from build
├── .env.docker            # Docker environment variables
└── init-db/               # Database initialization scripts
```

## Production Deployment

For production deployment, make sure to:

1. Change default passwords in `docker-compose.yml`
2. Update JWT secret key
3. Use environment variables for sensitive data
4. Consider using Docker secrets for production
