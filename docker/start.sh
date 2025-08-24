#!/bin/bash

# Grocademy Docker Startup Script
echo "🎓 Starting Grocademy Platform..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check for environment argument
ENV=${1:-production}

if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
    echo "🛠️  Starting DEVELOPMENT environment..."
    docker-compose -f docker-compose.dev.yml up -d
    echo ""
    echo "✅ Development environment started!"
    echo "📱 App: http://localhost:3000"
    echo "📖 API Docs: http://localhost:3000/docs"
    echo "🗄️  Database Admin: http://localhost:8080"
    echo ""
    echo "To view logs: docker-compose -f docker-compose.dev.yml logs -f app"
    echo "To stop: docker-compose -f docker-compose.dev.yml down"
else
    echo "🚀 Starting PRODUCTION environment..."
    docker-compose up -d
    echo ""
    echo "✅ Production environment started!"
    echo "📱 App: http://localhost:3000"
    echo "📖 API Docs: http://localhost:3000/docs"
    echo "🗄️  Database Admin: http://localhost:8080"
    echo ""
    echo "🔐 Admin Login:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: After first successful startup, disable auto-seeding:"
    echo "   Edit docker-compose.yml and change AUTO_SEED to 'false'"
    echo ""
    echo "To view logs: docker-compose logs -f app"
    echo "To stop: docker-compose down"
fi

echo ""
echo "🎉 Setup complete! Your Grocademy platform is starting up..."
echo "   Please wait 30-60 seconds for database initialization."
