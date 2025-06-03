# WebThanhToan Docker Deployment Script for Windows
Write-Host "🐳 Starting WebThanhToan Docker Deployment..." -ForegroundColor Cyan
Write-Host "📊 Optimized for 4GB RAM laptops with SQL Server 2019" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check system resources
Write-Status "Checking system resources..."
$memory = Get-WmiObject -Class Win32_ComputerSystem
$totalRAM = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
Write-Host "💾 Total RAM: $totalRAM GB" -ForegroundColor Cyan

if ($totalRAM -lt 4) {
    Write-Warning "RAM dưới 4GB có thể gây chậm. Khuyến nghị tăng swap file."
} elseif ($totalRAM -le 6) {
    Write-Success "RAM $totalRAM GB - Đã tối ưu cho cấu hình này"
} else {
    Write-Success "RAM $totalRAM GB - Cấu hình tốt"
}

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Success "Docker is installed"
} catch {
    Write-Error "Docker is not installed. Please install Docker Desktop first."
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Success "Docker Compose is installed"
} catch {
    Write-Error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
}

# Stop existing containers
Write-Status "Stopping existing containers..."
docker-compose down

# Remove old images (optional)
$removeImages = Read-Host "Do you want to remove old images? (y/N)"
if ($removeImages -eq "y" -or $removeImages -eq "Y") {
    Write-Status "Removing old images..."
    docker-compose down --rmi all
    docker system prune -f
}

# Build and start services
Write-Status "Building and starting services (optimized for 4GB RAM)..."
Write-Host "🗄️  Using SQL Server 2019 with 512MB memory limit" -ForegroundColor Cyan
Write-Host "☕ Java heap limited to 512MB for backend" -ForegroundColor Cyan
Write-Host "🌐 Nginx frontend with minimal memory footprint" -ForegroundColor Cyan

docker-compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start services!"
    Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "   - Check if ports 80, 8080, 1433 are available" -ForegroundColor White
    Write-Host "   - Increase Docker memory limit in Docker Desktop" -ForegroundColor White
    Write-Host "   - Close other applications to free up RAM" -ForegroundColor White
    exit 1
}

# Wait for services to be healthy
Write-Status "Waiting for services to be healthy (may take 2-3 minutes on 4GB RAM)..."
Start-Sleep -Seconds 15

# Check service status
Write-Status "Checking service status..."

# Check database
$dbStatus = docker-compose ps database
if ($dbStatus -match "healthy") {
    Write-Success "SQL Server 2019 is healthy"
} else {
    Write-Warning "SQL Server 2019 is starting up (this may take longer on 4GB RAM)"
}

# Check backend
$backendStatus = docker-compose ps backend
if ($backendStatus -match "healthy") {
    Write-Success "Spring Boot backend is healthy"
} else {
    Write-Warning "Backend is starting up (JVM optimization in progress)"
}

# Check frontend
$frontendStatus = docker-compose ps frontend
if ($frontendStatus -match "healthy") {
    Write-Success "React frontend is healthy"
} else {
    Write-Warning "Frontend is starting up"
}

# Show running containers
Write-Status "Running containers:"
docker-compose ps

# Show memory usage
Write-Status "Memory usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Show logs
Write-Status "Recent logs:"
docker-compose logs --tail=10

Write-Host ""
Write-Success "Deployment completed!"
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8080/api" -ForegroundColor White
Write-Host "   Database: localhost:1433 (SQL Server 2019)" -ForegroundColor White
Write-Host ""
Write-Host "💾 Memory optimization active:" -ForegroundColor Green
Write-Host "   Total usage: ~1.5GB (suitable for 4GB RAM)" -ForegroundColor White
Write-Host "   SQL Server: Limited to 512MB" -ForegroundColor White
Write-Host "   Backend: JVM heap 128MB-512MB" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose logs -f [service_name]" -ForegroundColor White
Write-Host "   Stop services: docker-compose down" -ForegroundColor White
Write-Host "   Restart service: docker-compose restart [service_name]" -ForegroundColor White
Write-Host "   View status: docker-compose ps" -ForegroundColor White
Write-Host "   Check memory: docker stats" -ForegroundColor White 