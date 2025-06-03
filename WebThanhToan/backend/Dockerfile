# Multi-stage build for Spring Boot backend
FROM openjdk:21-jdk-slim AS build

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Production stage - using eclipse-temurin which has JRE 21
FROM eclipse-temurin:21-jre-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create app user
RUN addgroup -g 1001 -S spring && \
    adduser -u 1001 -S spring -G spring

# Set working directory
WORKDIR /app

# Copy jar file from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar

# Switch to spring user
USER spring:spring

# Expose port (Render uses PORT environment variable)
EXPOSE ${PORT:-8080}

# Environment variables for production
ENV SPRING_PROFILES_ACTIVE=production
ENV JAVA_OPTS="-Xms128m -Xmx512m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:MaxGCPauseMillis=200 -XX:+UseCompressedOops -XX:+OptimizeStringConcat"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

# Start the application with dynamic port
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"] 