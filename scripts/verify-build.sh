#!/bin/bash
echo "🚀 Railway Build Verification Script"
echo "====================================="

echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Checking dist folder..."
ls -la dist/

echo "🎯 Testing production start..."
echo "NODE_ENV=production npm run start:prod"
