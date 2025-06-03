#!/bin/bash

echo "🚀 Starting WebThanhToan build process..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

echo "✅ Build completed successfully!" 