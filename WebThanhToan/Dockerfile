# Multi-stage build for React Frontend
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create directories and set permissions for nginx to run as non-root
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run /tmp/nginx /usr/share/nginx/html /etc/nginx && \
    chmod -R 755 /var/run /tmp/nginx

# Switch to nginx user
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx in foreground with custom pid file location
CMD ["nginx", "-g", "daemon off; pid /tmp/nginx/nginx.pid;"] 