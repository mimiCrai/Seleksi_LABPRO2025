#!/bin/bash

# Test script for local file storage

echo "🚀 Testing Local File Storage Setup"
echo "=================================="

# Check if uploads directory structure exists
echo "📁 Checking directory structure..."

if [ -d "uploads" ]; then
    echo "✅ uploads/ directory exists"
else
    echo "❌ uploads/ directory missing"
    mkdir -p uploads/{images,videos,pdfs}
    echo "✅ Created uploads directory structure"
fi

if [ -d "uploads/images" ]; then
    echo "✅ uploads/images/ directory exists"
else
    echo "❌ uploads/images/ directory missing"
fi

if [ -d "uploads/videos" ]; then
    echo "✅ uploads/videos/ directory exists"
else
    echo "❌ uploads/videos/ directory missing"
fi

if [ -d "uploads/pdfs" ]; then
    echo "✅ uploads/pdfs/ directory exists"
else
    echo "❌ uploads/pdfs/ directory missing"
fi

echo ""
echo "📊 Directory Status:"
ls -la uploads/ 2>/dev/null || echo "No uploads directory found"

echo ""
echo "🔧 Environment Check:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    if grep -q "BASE_URL" .env; then
        echo "✅ BASE_URL configured in .env"
    else
        echo "⚠️  BASE_URL not found in .env (using default: http://localhost:3000)"
    fi
else
    echo "⚠️  .env file not found - using defaults"
    echo "   Copy .env.example to .env and configure as needed"
fi

echo ""
echo "🏗️  Build Status:"
if npm run build >/dev/null 2>&1; then
    echo "✅ Application builds successfully"
else
    echo "❌ Build failed - check your code"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Copy .env.example to .env if you haven't already"
echo "2. Start your application: npm run start:dev"
echo "3. Test file upload via API or Swagger at http://localhost:3000/docs"
echo "4. Files will be accessible at http://localhost:3000/uploads/folder/filename"

echo ""
echo "🔗 Useful URLs:"
echo "- API Documentation: http://localhost:3000/docs" 
echo "- Upload Image: POST http://localhost:3000/api/upload/image"
echo "- Upload Video: POST http://localhost:3000/api/upload/video"
echo "- Upload PDF: POST http://localhost:3000/api/upload/pdf"

echo ""
echo "Test completed! ✨"
