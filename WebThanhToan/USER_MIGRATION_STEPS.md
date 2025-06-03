# 👥 User Migration Steps

## 🎯 Mục tiêu
Đưa dữ liệu users từ SQL Server local sang PostgreSQL production

## 📋 Bước 1: Export Users từ Local

### Option A: Sử dụng API (Khuyến nghị)
```bash
# 1. Chạy ứng dụng local
cd backend
./mvnw spring-boot:run

# 2. Truy cập browser: http://localhost:8080
# 3. Login với admin/admin123
# 4. Truy cập: http://localhost:8080/api/admin/migration/generate-datainitializer
# 5. Copy code được generate
```

### Option B: Sử dụng SQL Script
```sql
-- Chạy trong SQL Server Management Studio
SELECT 
    'createUserIfNotExists("' + username + '", "' + email + '", "' + full_name + '", "defaultpassword123", User.Role.' + 
    CASE 
        WHEN role = 0 THEN 'USER'
        WHEN role = 1 THEN 'ADMIN'
        ELSE 'USER'
    END + ');'
FROM users
WHERE username != 'admin'
ORDER BY username;
```

## 📋 Bước 2: Cập nhật DataInitializer

1. **Mở file**: `backend/src/main/java/com/webthanhtoan/backend/config/DataInitializer.java`

2. **Thay thế** các dòng TODO bằng code đã copy:
```java
// Thay thế từ dòng này:
// TODO: Thay thế bằng dữ liệu users thực từ SQL Server của bạn

// Thành:
createUserIfNotExists("user1", "user1@example.com", "User One", "defaultpassword123", User.Role.USER);
createUserIfNotExists("user2", "user2@example.com", "User Two", "defaultpassword123", User.Role.USER);
// ... các users khác
```

## 📋 Bước 3: Deploy

```bash
# 1. Commit changes
git add .
git commit -m "Add users data for production deployment"

# 2. Push to GitHub
git push origin main

# 3. Deploy trên Render (tự động)
```

## 🔐 Lưu ý về Password

- **Tất cả users** sẽ có password mặc định: `defaultpassword123`
- **Users cần đổi password** sau khi login lần đầu
- **Admin user** vẫn giữ password: `admin123`

## ✅ Kiểm tra sau khi Deploy

1. **Truy cập**: `https://webthanhtoan-frontend.onrender.com`
2. **Login** với các users đã migrate
3. **Đổi password** nếu cần

## 🔄 Nếu cần cập nhật thêm Users

1. **Thêm vào DataInitializer.java**
2. **Commit và push**
3. **Render sẽ tự động redeploy** 