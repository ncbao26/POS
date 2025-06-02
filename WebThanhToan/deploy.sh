#!/bin/bash

# WebThanhToan Production Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="webthanhtoan"
BACKUP_DIR="/opt/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p $BACKUP_DIR
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    
    # Backup database
    docker exec webthanhtoan-db /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "YourStrong@Passw0rd" \
        -Q "BACKUP DATABASE [WebThanhToan] TO DISK = N'/var/opt/mssql/backup/$BACKUP_NAME.bak'"
    
    # Copy backup file to host
    docker cp webthanhtoan-db:/var/opt/mssql/backup/$BACKUP_NAME.bak $BACKUP_DIR/
    
    log "Backup created: $BACKUP_DIR/$BACKUP_NAME.bak"
}

# Deploy application
deploy() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose pull
    
    # Stop services gracefully
    log "Stopping services..."
    docker-compose down --timeout 30
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check health
    check_health
}

# Health check
check_health() {
    log "Performing health checks..."
    
    # Check database
    if docker exec webthanhtoan-db /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "YourStrong@Passw0rd" \
        -Q "SELECT 1" > /dev/null 2>&1; then
        log "✓ Database is healthy"
    else
        error "✗ Database health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log "✓ Backend is healthy"
    else
        error "✗ Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        log "✓ Frontend is healthy"
    else
        error "✗ Frontend health check failed"
    fi
    
    log "All services are healthy!"
}

# Rollback function
rollback() {
    warning "Rolling back to previous version..."
    
    # Stop current services
    docker-compose down
    
    # Restore from backup
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/*.bak | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restoring database from: $LATEST_BACKUP"
        # Restore database logic here
    fi
    
    # Start previous version
    docker-compose up -d
    
    log "Rollback completed"
}

# Cleanup old backups (keep last 7 days)
cleanup() {
    log "Cleaning up old backups..."
    find $BACKUP_DIR -name "*.bak" -mtime +7 -delete
    
    # Clean up Docker
    docker system prune -f
    
    log "Cleanup completed"
}

# Main execution
main() {
    log "=== WebThanhToan Deployment Started ==="
    
    check_docker
    
    case "${1:-deploy}" in
        "deploy")
            create_backup
            deploy
            cleanup
            ;;
        "rollback")
            rollback
            ;;
        "health")
            check_health
            ;;
        "backup")
            create_backup
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|backup}"
            exit 1
            ;;
    esac
    
    log "=== Deployment Completed Successfully ==="
}

# Create log directory
mkdir -p $(dirname $LOG_FILE)

# Run main function
main "$@" 