#!/bin/bash

# Grocademy Docker Management Script

case "$1" in
    "prod")
        echo "🚀 Starting production environment..."
        docker-compose up --build
        ;;
    "dev")
        echo "🛠️  Starting development environment..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    "db")
        echo "🗄️  Starting only database..."
        docker-compose up db
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        ;;
    "clean")
        echo "🧹 Cleaning up Docker resources..."
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        ;;
    "logs")
        echo "📋 Showing application logs..."
        docker-compose logs app
        ;;
    *)
        echo "Grocademy Docker Management"
        echo ""
        echo "Usage: $0 {prod|dev|db|stop|clean|logs}"
        echo ""
        echo "Commands:"
        echo "  prod  - Start production environment"
        echo "  dev   - Start development environment with hot reload"
        echo "  db    - Start only MySQL database"
        echo "  stop  - Stop all services"
        echo "  clean - Clean up all Docker resources"
        echo "  logs  - Show application logs"
        echo ""
        ;;
esac
