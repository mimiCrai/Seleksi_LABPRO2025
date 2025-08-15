# 🎓 Grocademy Backend

> A comprehensive e-learning platform built with NestJS, TypeScript, and MySQL.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)

## ⚡ Quick Start

### 🐳 Using Docker (Recommended)

```bash
# 1. Start the application
docker-compose -f docker/docker-compose.yml up --build

# 2. Initialize database (first time only)
docker-compose -f docker/docker-compose.yml exec app npm run migration:run
docker-compose -f docker/docker-compose.yml exec app npm run seed

# 3. Open your browser
# - App: http://localhost:3000
# - Database Admin: http://localhost:8080
```

### 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Setup database (MySQL required)
mysql -u root -p -e "CREATE DATABASE grocademy_db;"

# 3. Configure environment
cp .env.example .env  # Edit with your settings

# 4. Run migrations and seed data
npm run migration:run && npm run seed

# 5. Start development server
npm run start:dev
```

## 📁 Project Structure

```
├── src/                 # Source code
│   ├── auth/           # Authentication module
│   ├── course/         # Course management
│   ├── user/           # User management
│   ├── database/       # Migrations & seeds
│   └── views/          # Frontend templates
├── docker/             # Docker configuration
├── scripts/            # Utility scripts
├── docs/              # Documentation
└── test/              # Test files
```

## � Test Accounts

| Role | Username | Password | Balance |
|------|----------|----------|---------|
| Admin | `nimon_master` | `password123` | 50,000 credits |
| User | `alice_student` | `password123` | 1,000 credits |

## 🛠️ Development

```bash
# Start development server
npm run start:dev

# Run tests
npm test

# Database operations
npm run migration:generate    # Create new migration
npm run migration:run        # Apply migrations
npm run seed                # Seed test data
npm run db:reset            # Reset & re-seed database

# Code quality
npm run lint                # Check code style
npm run format              # Format code
```

## � Documentation

- 📖 **[Docker Guide](./docs/DOCKER.md)** - Detailed Docker setup
- 🗄️ **[Database Guide](./docs/DATABASE-TESTING.md)** - Database operations
- 🔧 **[API Reference](http://localhost:3000/api)** - Swagger docs (when running)

## ✨ Features

- 🔐 **JWT Authentication** - Secure login system
- 📚 **Course Management** - Create and manage courses
- 👥 **User Profiles** - Student and admin accounts  
- 💳 **Credit System** - Virtual currency for purchases
- 📈 **Progress Tracking** - Learning progress analytics
- 🎯 **Module System** - Structured course content
- 📱 **Responsive UI** - Modern web interface
- 🛡️ **Admin Panel** - Management dashboard

## � Common Issues

<details>
<summary><strong>Port 3000 already in use</strong></summary>

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```
</details>

<details>
<summary><strong>Database connection failed</strong></summary>

```bash
# Check MySQL status
sudo systemctl status mysql

# Reset database
npm run db:reset
```
</details>

<details>
<summary><strong>Docker containers won't start</strong></summary>

```bash
docker-compose -f docker/docker-compose.yml down
docker system prune -f
docker-compose -f docker/docker-compose.yml up --build
```
</details>

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** pull request

## 📄 License

This project is **UNLICENSED**. All rights reserved.

---

<div align="center">
  
**[⭐ Star this repo](https://github.com/mimiCrai/Seleksi_LABPRO2025)** • **[🐛 Report Bug](https://github.com/mimiCrai/Seleksi_LABPRO2025/issues)** • **[💡 Request Feature](https://github.com/mimiCrai/Seleksi_LABPRO2025/issues)**

Made with ❤️ for LABPRO 2025

</div>
