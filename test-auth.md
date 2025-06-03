# Test Authentication - Hướng dẫn kiểm tra đăng nhập

## Vấn đề hiện tại
- Deploy thành công nhưng đăng nhập báo lỗi
- Cần kiểm tra password đã được bcrypt encode đúng chưa

## Logic Authentication hiện tại

### Backend Authentication Flow:
1. **Password Encoding**: Sử dụng BCryptPasswordEncoder
2. **User Creation**: Password được encode khi tạo user trong DataInitializer
3. **Login Process**: Spring Security so sánh password raw với password đã encode

### Users được tạo sẵn trong DataInitializer:
```java
// Các user được tạo với password "admin123" (đã encode)
- admin / admin123 (ADMIN role)
- manager / admin123 (USER role) 
- cashier1 / admin123 (USER role)
- cashier2 / admin123 (USER role)
- mixxstore / admin123 (ADMIN role)
- user1 / admin123 (USER role)
- user2 / admin123 (USER role)
```

## Cách test authentication

### 1. Test qua API trực tiếp:
```bash
# Test login với curl
curl -X POST https://mixxstorepos-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 2. Test qua browser console:
```javascript
// Mở browser console và chạy:
fetch('https://mixxstorepos-backend.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
})
.then(response => response.json())
.then(data => console.log('Login result:', data))
.catch(error => console.error('Login error:', error));
```

### 3. Kiểm tra database connection:
```bash
# Test health endpoint
curl https://mixxstorepos-backend.onrender.com/actuator/health
```

## Các nguyên nhân có thể gây lỗi:

### 1. Database chưa có data
- DataInitializer chưa chạy
- Database connection lỗi
- JPA ddl-auto: create-drop xóa data mỗi lần restart

### 2. Environment variables sai
- JWT_SECRET không đúng
- DATABASE_URL không đúng
- CORS settings không đúng

### 3. Password encoding không match
- Frontend gửi password đã encode
- Backend encode lại lần nữa

## Giải pháp khắc phục:

### 1. Kiểm tra logs backend:
```bash
# Xem logs trên Render dashboard
# Tìm các dòng log:
# - "Created default admin user: admin/admin123"
# - "JWT validation failed"
# - "Authentication error"
```

### 2. Thay đổi JPA ddl-auto:
```yaml
# Trong application-production.yml
jpa:
  hibernate:
    ddl-auto: update  # Thay vì create-drop
```

### 3. Thêm logging debug:
```yaml
# Trong application-production.yml
logging:
  level:
    com.webthanhtoan: DEBUG
    org.springframework.security: DEBUG
```

### 4. Test với user khác:
- Thử đăng nhập với: mixxstore/admin123
- Thử đăng nhập với: manager/admin123

## Các bước debug tiếp theo:

1. **Kiểm tra backend logs** để xem DataInitializer có chạy không
2. **Test API health** để đảm bảo backend hoạt động
3. **Test login API** trực tiếp với curl/Postman
4. **Kiểm tra CORS** nếu frontend không gọi được API
5. **Kiểm tra JWT secret** trong environment variables

## Expected Response khi login thành công:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@webthanhtoan.com",
  "fullName": "Administrator",
  "role": "ADMIN"
}
```

## Expected Error khi login thất bại:
```json
{
  "message": "Tên đăng nhập hoặc mật khẩu không đúng"
}
``` 