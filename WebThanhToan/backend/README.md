# WebThanhToan Backend

Backend API cho hệ thống quản lý thanh toán WebThanhToan được xây dựng với Spring Boot 3.3.0 và Java 21.

## Yêu cầu hệ thống

- **Java 21** (LTS)
- **Maven 3.6+** (hoặc sử dụng Maven Wrapper đi kèm)
- **SQL Server 2019+** hoặc SQL Server Express
- **Git** (để clone project)

## Cài đặt và chạy

### 1. Kiểm tra Java version
```bash
java -version
```
Đảm bảo bạn đang sử dụng Java 21.

### 2. Thiết lập database
Chạy script thiết lập database trong thư mục `database/`:
```bash
cd ../database
./setup_database.ps1
# hoặc
setup_database.bat
```

### 3. Cấu hình database
Cập nhật file `src/main/resources/application.yml` với thông tin SQL Server của bạn:
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=WebThanhToan;encrypt=false;trustServerCertificate=true
    username: sa
    password: YOUR_PASSWORD_HERE
```

### 4. Chạy ứng dụng

#### Cách 1: Sử dụng script
```bash
# Windows Command Prompt
run.bat

# PowerShell
./run.ps1
```

#### Cách 2: Maven Wrapper
```bash
./mvnw spring-boot:run
```

#### Cách 3: Maven (nếu đã cài đặt)
```bash
mvn spring-boot:run
```

### 5. Kiểm tra ứng dụng
- Server sẽ chạy tại: `http://localhost:8080/api`
- Health check: `http://localhost:8080/api/actuator/health`

## API Endpointvn
### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Thông tin user hiện tại

### Products
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/products/{id}` - Xóa sản phẩm

## Tài khoản mặc định

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| manager | admin123 | USER |
| cashier1 | admin123 | USER |
| cashier2 | admin123 | USER |

## Cấu hình

### JWT
- Secret key: Được cấu hình trong `application.yml`
- Thời gian hết hạn: 24 giờ

### CORS
- Cho phép origin: `http://localhost:5173` (React frontend)
- Methods: GET, POST, PUT, DELETE, OPTIONS

### Database
- Hibernate DDL: `update` (tự động cập nhật schema)
- Show SQL: `true` (hiển thị SQL queries trong log)

## Development

### Build project
```bash
./mvnw clean compile
```

### Run tests
```bash
./mvnw test
```

### Package JAR
```bash
./mvnw clean package
```

### Run JAR file
```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## Troubleshooting

### Lỗi Java version
Đảm bảo `JAVA_HOME` trỏ đến Java 21:
```bash
echo $JAVA_HOME
# hoặc trên Windows
echo %JAVA_HOME%
```

### Lỗi kết nối database
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra firewall
3. Kiểm tra connection string trong `application.yml`

### Lỗi port đã được sử dụng
Thay đổi port trong `application.yml`:
```yaml
server:
  port: 8081
```

### Lỗi Maven
Sử dụng Maven Wrapper thay vì Maven global:
```bash
./mvnw clean spring-boot:run
```

## Logs

Logs được cấu hình với level DEBUG cho:
- `com.webthanhtoan`: Application logs
- `org.springframework.security`: Security logs
- `org.hibernate.SQL`: SQL queries

## Production

Để deploy production, cập nhật `application.yml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Không tự động thay đổi schema
    show-sql: false       # Tắt SQL logging

logging:
  level:
    com.webthanhtoan: INFO
    org.springframework.security: WARN
    org.hibernate.SQL: WARN
``` 