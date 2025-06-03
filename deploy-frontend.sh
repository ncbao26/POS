#!/bin/bash

# Frontend Deployment Script for Render
echo "🚀 Starting Frontend Deployment..."

# Set environment variables
export NODE_ENV=production
export VITE_API_URL=${VITE_API_URL:-"https://webthanhtoan-backend.onrender.com"}

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🏗️ Building application..."
npm run build

echo "🔧 Setting up nginx..."
# Copy nginx config if it doesn't exist
if [ ! -f /etc/nginx/nginx.conf.backup ]; then
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
fi

# Use our custom nginx config
cp nginx.conf /etc/nginx/nginx.conf

echo "✅ Frontend build completed successfully!"
echo "📁 Build output in: ./dist"
echo "🌐 API URL: $VITE_API_URL" 