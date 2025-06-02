@echo off
echo =============================================
echo Starting WebThanhToan Backend Server
echo =============================================
echo.
echo Java Version:
java -version
echo.
echo Starting Spring Boot application...
echo Server will be available at: http://localhost:8080/api
echo.
echo Press Ctrl+C to stop the server
echo.
./mvnw spring-boot:run 