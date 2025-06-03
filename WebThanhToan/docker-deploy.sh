#!/bin/bash

# WebThanhToan Docker Deployment Script
echo "🐳 Starting WebThanhToan Docker Deployment..."
echo "📊 Optimized for 4GB RAM laptops with SQL Server 2019"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check system resources
print_status "Checking system resources..."
if command -v free &> /dev/null; then
    TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
    echo -e "${CYAN}💾 Total RAM: ${TOTAL_RAM}GB${NC}"
    
    if [ "$TOTAL_RAM" -lt 4 ]; then
        print_warning "RAM dưới 4GB có thể gây chậm. Khuyến nghị tăng swap."
    elif [ "$TOTAL_RAM" -le 6 ]; then
        print_success "RAM ${TOTAL_RAM}GB - Đã tối ưu cho cấu hình này"
    else
        print_success "RAM ${TOTAL_RAM}GB - Cấu hình tốt"
    fi
elif command -v sysctl &> /dev/null; then
    # macOS
    TOTAL_RAM=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
    echo -e "${CYAN}💾 Total RAM: ${TOTAL_RAM}GB${NC}"
    
    if [ "$TOTAL_RAM" -lt 4 ]; then
        print_warning "RAM dưới 4GB có thể gây chậm."
    elif [ "$TOTAL_RAM" -le 6 ]; then
        print_success "RAM ${TOTAL_RAM}GB - Đã tối ưu cho cấu hình này"
    else
        print_success "RAM ${TOTAL_RAM}GB - Cấu hình tốt"
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Remove old images (optional)
read -p "Do you want to remove old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing old images..."
    docker-compose down --rmi all
    docker system prune -f
fi

# Build and start services
print_status "Building and starting services (optimized for 4GB RAM)..."
echo -e "${CYAN}🗄️  Using SQL Server 2019 with 512MB memory limit${NC}"
echo -e "${CYAN}☕ Java heap limited to 512MB for backend${NC}"
echo -e "${CYAN}🌐 Nginx frontend with minimal memory footprint${NC}"

docker-compose up --build -d

if [ $? -ne 0 ]; then
    print_error "Failed to start services!"
    echo -e "${YELLOW}💡 Troubleshooting tips:${NC}"
    echo -e "   - Check if ports 80, 8080, 1433 are available"
    echo -e "   - Increase Docker memory limit"
    echo -e "   - Close other applications to free up RAM"
    exit 1
fi

# Wait for services to be healthy
print_status "Waiting for services to be healthy (may take 2-3 minutes on 4GB RAM)..."
sleep 15

# Check service status
print_status "Checking service status..."

# Check database
if docker-compose ps database | grep -q "healthy"; then
    print_success "SQL Server 2019 is healthy"
else
    print_warning "SQL Server 2019 is starting up (this may take longer on 4GB RAM)"
fi

# Check backend
if docker-compose ps backend | grep -q "healthy"; then
    print_success "Spring Boot backend is healthy"
else
    print_warning "Backend is starting up (JVM optimization in progress)"
fi

# Check frontend
if docker-compose ps frontend | grep -q "healthy"; then
    print_success "React frontend is healthy"
else
    print_warning "Frontend is starting up"
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

# Show memory usage
print_status "Memory usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Show logs
print_status "Recent logs:"
docker-compose logs --tail=10

echo ""
print_success "Deployment completed!"
echo ""
echo -e "${CYAN}🌐 Access the application:${NC}"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8080/api"
echo "   Database: localhost:1433 (SQL Server 2019)"
echo ""
echo -e "${GREEN}💾 Memory optimization active:${NC}"
echo "   Total usage: ~1.5GB (suitable for 4GB RAM)"
echo "   SQL Server: Limited to 512MB"
echo "   Backend: JVM heap 128MB-512MB"
echo ""
echo -e "${CYAN}📋 Useful commands:${NC}"
echo "   View logs: docker-compose logs -f [service_name]"
echo "   Stop services: docker-compose down"
echo "   Restart service: docker-compose restart [service_name]"
echo "   View status: docker-compose ps"
echo "   Check memory: docker stats" 