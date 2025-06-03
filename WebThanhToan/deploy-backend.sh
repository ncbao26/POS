#!/bin/bash

# Backend Deployment Script for Render
echo "🚀 Starting Backend Deployment..."

cd backend

# Set environment variables
export SPRING_PROFILES_ACTIVE=production
export JAVA_OPTS="-Xms128m -Xmx512m -XX:+UseG1GC"

echo "📦 Installing dependencies and building..."
./mvnw clean package -DskipTests

echo "🔍 Checking build output..."
if [ -f target/*.jar ]; then
    echo "✅ JAR file created successfully!"
    ls -la target/*.jar
else
    echo "❌ Build failed - no JAR file found!"
    exit 1
fi

echo "🏥 Setting up health check..."
# Wait for database connection
echo "⏳ Waiting for database connection..."
sleep 10

echo "✅ Backend build completed successfully!"
echo "📁 JAR location: $(ls target/*.jar)"
echo "🔧 Java Options: $JAVA_OPTS"
echo "🌍 Profile: $SPRING_PROFILES_ACTIVE" 