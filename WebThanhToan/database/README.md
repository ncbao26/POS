# WebThanhToan Database Setup

Hướng dẫn thiết lập database SQL Server cho hệ thống WebThanhToan.

## Yêu cầu

- SQL Server 2019+ hoặc SQL Server Express
- SQL Server Management Studio (SSMS) - khuyến nghị
- Quyền tạo database và tables

## Cách 1: Sử dụng Script Tự Động

### Windows Command Prompt
```cmd
cd database
setup_database.bat
```

### PowerShell
```powershell
cd database
.\setup_database.ps1
```

## Cách 2: Chạy Thủ Công

### 1. Mở SQL Server Management Studio

### 2. Chạy script tạo database
```sql
-- Mở file create_database.sql và chạy
```

### 3. Chạy script insert dữ liệu mẫu
```sql
-- Mở file insert_sample_data.sql và chạy
```

## Cách 3: Sử dụng Command Line

```cmd
sqlcmd -S localhost -E -i "create_database.sql"
sqlcmd -S localhost -E -i "insert_sample_data.sql"
```

## Cấu trúc Database

### Bảng chính

| Bảng | Mô tả | Số bản ghi mẫu |
|------|-------|----------------|
| `users` | Quản lý người dùng | 4 |
| `products` | Quản lý sản phẩm | 20 |
| `customers` | Quản lý khách hàng | 10 |
| `invoices` | Quản lý hóa đơn | 33 |
| `invoice_items` | Chi tiết hóa đơn | Tương ứng |
| `inventory_transactions` | Lịch sử xuất nhập kho | Tự động |
| `payment_transactions` | Lịch sử thanh toán | Tự động |
| `system_settings` | Cài đặt hệ thống | 10 |
| `audit_logs` | Nhật ký hoạt động | 4 |

### Views báo cáo

- `vw_daily_revenue` - Báo cáo doanh thu theo ngày
- `vw_top_selling_products` - Sản phẩm bán chạy
- `vw_low_stock_products` - Sản phẩm sắp hết hàng

### Triggers

- `tr_users_updated_at` - Tự động cập nhật thời gian sửa đổi
- `tr_products_updated_at` - Tự động cập nhật thời gian sửa đổi
- `tr_customers_updated_at` - Tự động cập nhật thời gian sửa đổi
- `tr_invoices_updated_at` - Tự động cập nhật thời gian sửa đổi

## Dữ liệu mẫu

### Tài khoản người dùng
| Username | Password | Role | Tên đầy đủ |
|----------|----------|------|------------|
| admin | admin123 | ADMIN | Administrator |
| manager | admin123 | USER | Quản lý cửa hàng |
| cashier1 | admin123 | USER | Thu ngân 1 |
| cashier2 | admin123 | USER | Thu ngân 2 |

### Sản phẩm mẫu
- 20 sản phẩm công nghệ đa dạng
- Giá từ 1.2 triệu đến 50 triệu VND
- Tồn kho từ 1 đến 50 sản phẩm

### Khách hàng mẫu
- 10 khách hàng với thông tin đầy đủ
- Số điện thoại, email, địa chỉ

### Hóa đơn mẫu
- 3 hóa đơn chi tiết với trạng thái PAID
- 30 hóa đơn lịch sử cho báo cáo
- Tổng doanh thu mẫu > 1 tỷ VND

## Kiểm tra Database

### Kiểm tra kết nối
```sql
SELECT @@VERSION;
```

### Kiểm tra tables
```sql
USE WebThanhToan;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
```

### Kiểm tra dữ liệu
```sql
SELECT 
    'Users' as TableName, COUNT(*) as RecordCount FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoices;
```

### Kiểm tra views
```sql
SELECT * FROM vw_daily_revenue;
SELECT TOP 5 * FROM vw_top_selling_products ORDER BY total_sold DESC;
SELECT * FROM vw_low_stock_products;
```

## Cấu hình Spring Boot

Cập nhật file `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=WebThanhToan;encrypt=false;trustServerCertificate=true
    username: sa
    password: YOUR_PASSWORD_HERE
```

## Troubleshooting

### Lỗi kết nối SQL Server
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra SQL Server Browser service
3. Kiểm tra firewall
4. Kiểm tra TCP/IP enabled trong SQL Server Configuration Manager

### Lỗi quyền truy cập
1. Đảm bảo user có quyền tạo database
2. Chạy với quyền Administrator
3. Kiểm tra Mixed Mode authentication

### Lỗi script
1. Kiểm tra encoding file (UTF-8)
2. Kiểm tra đường dẫn file
3. Chạy từng script riêng lẻ để debug

## Backup và Restore

### Backup
```sql
BACKUP DATABASE WebThanhToan 
TO DISK = 'C:\Backup\WebThanhToan.bak'
```

### Restore
```sql
RESTORE DATABASE WebThanhToan 
FROM DISK = 'C:\Backup\WebThanhToan.bak'
```

## Performance

### Indexes đã tạo
- Primary keys trên tất cả bảng
- Foreign key indexes
- Search indexes cho name, phone, email
- Date indexes cho báo cáo

### Monitoring
```sql
-- Kiểm tra index usage
SELECT * FROM sys.dm_db_index_usage_stats 
WHERE database_id = DB_ID('WebThanhToan');

-- Kiểm tra missing indexes
SELECT * FROM sys.dm_db_missing_index_details 
WHERE database_id = DB_ID('WebThanhToan');
```

## Maintenance

### Cleanup old data
```sql
-- Xóa audit logs cũ hơn 90 ngày
DELETE FROM audit_logs WHERE created_at < DATEADD(DAY, -90, GETDATE());

-- Xóa inventory transactions cũ hơn 1 năm
DELETE FROM inventory_transactions WHERE created_at < DATEADD(YEAR, -1, GETDATE());
```

### Update statistics
```sql
UPDATE STATISTICS users;
UPDATE STATISTICS products;
UPDATE STATISTICS invoices;
``` 