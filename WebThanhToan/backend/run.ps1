# WebThanhToan Backend Startup Script
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Starting WebThanhToan Backend Server" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Java Version:" -ForegroundColor Yellow
java -version
Write-Host ""

Write-Host "Starting Spring Boot application..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

./mvnw spring-boot:run 