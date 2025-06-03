# 📊 Data Migration Guide (Optional)

## 🎯 Khi nào cần migration?

Chỉ cần migration nếu bạn muốn đưa dữ liệu từ SQL Server local lên PostgreSQL production.

## 🔄 Phương pháp Migration

### Option 1: Export/Import SQL
```sql
-- 1. Export data từ SQL Server
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM customers;
SELECT * FROM invoices;
SELECT * FROM invoice_items;

-- 2. Convert sang PostgreSQL format và import
```

### Option 2: Sử dụng Spring Boot
```java
// Tạo REST API để export/import data
@RestController
public class DataMigrationController {
    
    @GetMapping("/api/admin/export")
    public ResponseEntity<?> exportData() {
        // Export all data to JSON
    }
    
    @PostMapping("/api/admin/import")
    public ResponseEntity<?> importData(@RequestBody DataImport data) {
        // Import data from JSON
    }
}
```

### Option 3: Database Tools
- Sử dụng tools như DBeaver, pgAdmin
- Export từ SQL Server → Import vào PostgreSQL

## 📝 Lưu ý

- **Không bắt buộc**: Production có thể bắt đầu với dữ liệu trống
- **User admin**: Sẽ được tạo tự động bởi `DataInitializer`
- **Schema**: Hibernate tự động tạo từ Entity classes 