# WebThanhToan Database Setup Script
Write-Host "=============================================" -ForegroundColor Green
Write-Host "WebThanhToan Database Setup" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Kiểm tra kết nối SQL Server
Write-Host "Checking SQL Server connection..." -ForegroundColor Yellow
try {
    $result = Invoke-Sqlcmd -ServerInstance "localhost" -Query "SELECT @@VERSION" -ErrorAction Stop
    Write-Host "SQL Server connection successful!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Cannot connect to SQL Server!" -ForegroundColor Red
    Write-Host "Please make sure SQL Server is running and you have proper permissions." -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Tạo database và tables
Write-Host "Creating database and tables..." -ForegroundColor Yellow
try {
    Invoke-Sqlcmd -ServerInstance "localhost" -InputFile "create_database.sql" -ErrorAction Stop
    Write-Host "Database and tables created successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create database and tables!" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Insert sample data
Write-Host "Inserting sample data..." -ForegroundColor Yellow
try {
    Invoke-Sqlcmd -ServerInstance "localhost" -InputFile "insert_sample_data.sql" -ErrorAction Stop
    Write-Host "Sample data inserted successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to insert sample data!" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Database: WebThanhToan" -ForegroundColor Cyan
Write-Host "Default admin user: admin / admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start the Spring Boot application." -ForegroundColor Yellow
Write-Host ""

# Hiển thị thống kê database
Write-Host "Database Statistics:" -ForegroundColor Magenta
try {
    $stats = Invoke-Sqlcmd -ServerInstance "localhost" -Database "WebThanhToan" -Query @"
    SELECT 
        'Users' as TableName, COUNT(*) as RecordCount FROM users
    UNION ALL
    SELECT 'Products', COUNT(*) FROM products
    UNION ALL
    SELECT 'Customers', COUNT(*) FROM customers
    UNION ALL
    SELECT 'Invoices', COUNT(*) FROM invoices
    UNION ALL
    SELECT 'Invoice Items', COUNT(*) FROM invoice_items
    UNION ALL
    SELECT 'System Settings', COUNT(*) FROM system_settings
"@
    
    $stats | Format-Table -AutoSize
} catch {
    Write-Host "Could not retrieve database statistics." -ForegroundColor Yellow
}

Read-Host "Press Enter to exit" 