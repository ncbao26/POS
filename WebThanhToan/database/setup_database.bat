@echo off
echo =============================================
echo WebThanhToan Database Setup
echo =============================================
echo.

echo Checking SQL Server connection...
sqlcmd -S localhost -E -Q "SELECT @@VERSION" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to SQL Server!
    echo Please make sure SQL Server is running and you have proper permissions.
    pause
    exit /b 1
)

echo SQL Server connection successful!
echo.

echo Creating database and tables...
sqlcmd -S localhost -E -i "create_database.sql"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database and tables!
    pause
    exit /b 1
)

echo.
echo Inserting sample data...
sqlcmd -S localhost -E -i "insert_sample_data.sql"
if %errorlevel% neq 0 (
    echo ERROR: Failed to insert sample data!
    pause
    exit /b 1
)

echo.
echo =============================================
echo Database setup completed successfully!
echo =============================================
echo.
echo Database: WebThanhToan
echo Default admin user: admin / admin123
echo.
echo You can now start the Spring Boot application.
echo.
pause 