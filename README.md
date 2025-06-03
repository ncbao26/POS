# 🏪 WebThanhToan - Hệ Thống POS Hiện Đại

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-green.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)

Hệ thống Point of Sale (POS) hiện đại được xây dựng với React frontend và Spring Boot backend, hỗ trợ quản lý bán hàng, sản phẩm, khách hàng và báo cáo doanh thu.

## 📋 Mục Lục

- [✨ Tính Năng Chính](#-tính-năng-chính)
- [🏗️ Kiến Trúc Hệ Thống](#️-kiến-trúc-hệ-thống)
- [🚀 Cài Đặt và Triển Khai](#-cài-đặt-và-triển-khai)
- [💻 Phát Triển Local](#-phát-triển-local)
- [🐳 Docker Deployment](#-docker-deployment)
- [🌐 Production Deployment](#-production-deployment)
- [📊 Hiệu Năng](#-hiệu-năng)
- [🔧 Cấu Hình](#-cấu-hình)
- [📚 API Documentation](#-api-documentation)
- [🤝 Đóng Góp](#-đóng-góp)

## ✨ Tính Năng Chính

### 🛒 Quản Lý Bán Hàng
- **Multi-tab Checkout**: Hỗ trợ nhiều đơn hàng đồng thời
- **Barcode Scanner**: Quét mã vạch sản phẩm
- **Payment Processing**: Xử lý thanh toán đa dạng
- **Receipt Printing**: In hóa đơn tự động
- **Real-time Updates**: Cập nhật dữ liệu thời gian thực

### 📦 Quản Lý Sản Phẩm
- **CRUD Operations**: Thêm, sửa, xóa sản phẩm
- **Category Management**: Phân loại sản phẩm
- **Inventory Tracking**: Theo dõi tồn kho
- **Price Management**: Quản lý giá bán
- **Product Images**: Hỗ trợ hình ảnh sản phẩm

### 👥 Quản Lý Khách Hàng
- **Customer Database**: Cơ sở dữ liệu khách hàng
- **Purchase History**: Lịch sử mua hàng
- **Loyalty Program**: Chương trình khách hàng thân thiết
- **Contact Management**: Quản lý thông tin liên lạc

### 📊 Dashboard & Báo Cáo
- **Real-time Analytics**: Phân tích dữ liệu thời gian thực
- **Revenue Tracking**: Theo dõi doanh thu
- **Sales Reports**: Báo cáo bán hàng chi tiết
- **Interactive Charts**: Biểu đồ tương tác
- **Export Functions**: Xuất báo cáo Excel/PDF

### 🔐 Bảo Mật & Xác Thực
- **JWT Authentication**: Xác thực bằng JWT token
- **Role-based Access**: Phân quyền theo vai trò
- **Secure API**: API bảo mật với Spring Security
- **Session Management**: Quản lý phiên đăng nhập

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │  Dashboard  │ │   POS UI    │ │   Product Management    │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Reports   │ │  Customers  │ │    Invoice Management   │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Spring Boot)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Controllers │ │   Services  │ │      Repositories       │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │  Security   │ │     DTOs    │ │        Entities         │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JPA/Hibernate
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                          │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   PostgreSQL        │    │      SQL Server             │ │
│  │   (Production)      │    │   (Development)             │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

#### Frontend
- **React 19.1.0**: UI framework hiện đại
- **React Router DOM**: Routing và navigation
- **Chart.js**: Biểu đồ và visualization
- **Heroicons**: Icon library
- **React Hot Toast**: Notification system
- **Vite**: Build tool và dev server

#### Backend
- **Spring Boot 3.3.0**: Java framework
- **Spring Security**: Authentication & authorization
- **Spring Data JPA**: Database abstraction
- **JWT**: Token-based authentication
- **Flyway**: Database migration
- **Maven**: Dependency management

#### Database
- **PostgreSQL 15**: Production database
- **SQL Server**: Development database
- **JPA/Hibernate**: ORM mapping

#### DevOps & Deployment
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy và static serving
- **Render**: Cloud deployment platform

## 🚀 Cài Đặt và Triển Khai

### 📋 Yêu Cầu Hệ Thống

#### Minimum Requirements
- **RAM**: 4GB (khuyến nghị 8GB+)
- **CPU**: Dual-core 2.0GHz+
- **Storage**: 5GB free space
- **OS**: Windows 10/11, macOS 10.14+, Ubuntu 18.04+

#### Software Requirements
- **Docker**: 20.10+ với Docker Compose
- **Node.js**: 18.0+ (cho development)
- **Java**: 17+ (cho development)
- **Maven**: 3.8+ (cho development)

### 🐳 Docker Deployment (Khuyến Nghị)

#### 1. Clone Repository
```bash
git clone https://github.com/ncbao26/POS.git
cd POS
```

#### 2. Deploy với Docker Compose
```bash
# Build và start tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 3. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:5432 (PostgreSQL)

### 💻 Phát Triển Local

#### Backend Setup
```bash
cd backend

# Install dependencies và build
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Hoặc với profile cụ thể
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Production Deployment

### Render Deployment (Khuyến Nghị)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Deploy on Render**:
   - Truy cập [Render Dashboard](https://dashboard.render.com)
   - Chọn "New" → "Blueprint"
   - Connect repository: `https://github.com/ncbao26/POS`
   - Render sẽ tự động deploy theo `render.yaml`

3. **Services được tạo**:
   - **Frontend**: `webthanhtoan-frontend.onrender.com`
   - **Backend API**: `webthanhtoan-backend.onrender.com`
   - **Database**: PostgreSQL (managed by Render)

### Manual Deployment

#### Frontend (Nginx)
```bash
# Build production
npm run build

# Copy dist/ to web server
cp -r dist/* /var/www/html/
```

#### Backend (JAR)
```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/backend-1.0.0.jar
```

## 📊 Hiệu Năng

### Performance Benchmarks

#### Laptop 4GB RAM Test Results:
- **Startup Time**: ~2-3 minutes
- **Response Time**: <500ms average
- **Memory Usage**: ~1.5GB total
- **CPU Usage**: ~30-50% startup, ~10-20% idle
- **Database Queries**: <100ms average

#### Optimization Features:
- ✅ **Memory Optimization**: JVM tuning với G1GC
- ✅ **Database Indexing**: Optimized queries
- ✅ **Caching**: Redis caching layer
- ✅ **Lazy Loading**: Component lazy loading
- ✅ **Code Splitting**: Webpack optimization

### Resource Usage
```
Total Docker Memory Usage: ~1.5GB
├── PostgreSQL: ~256MB
├── Spring Boot Backend: ~512MB
├── React Frontend (Nginx): ~64MB
├── Redis Cache: ~64MB
└── Docker Overhead: ~256MB
```

## 🔧 Cấu Hình

### Environment Variables

#### Backend (.env hoặc application.yml)
```yaml
# Database Configuration
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/pos_db
    username: pos_user
    password: pos_password
  
  # JPA Configuration
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    
# JWT Configuration
jwt:
  secret: your-secret-key
  expiration: 86400000

# Server Configuration
server:
  port: 8080
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=WebThanhToan
VITE_VERSION=1.0.0
```

### Docker Configuration

#### Memory Limits (docker-compose.yml)
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 768M
          cpus: '0.5'
    environment:
      - JAVA_OPTS=-Xms128m -Xmx512m -XX:+UseG1GC
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login     - User login
POST /api/auth/register  - User registration
POST /api/auth/refresh   - Refresh token
POST /api/auth/logout    - User logout
```

### Product Management
```
GET    /api/products           - Get all products
GET    /api/products/{id}      - Get product by ID
POST   /api/products           - Create new product
PUT    /api/products/{id}      - Update product
DELETE /api/products/{id}      - Delete product
```

### Invoice Management
```
GET    /api/invoices           - Get all invoices
GET    /api/invoices/{id}      - Get invoice by ID
POST   /api/invoices           - Create new invoice
PUT    /api/invoices/{id}      - Update invoice
DELETE /api/invoices/{id}      - Delete invoice
```

### Customer Management
```
GET    /api/customers          - Get all customers
GET    /api/customers/{id}     - Get customer by ID
POST   /api/customers          - Create new customer
PUT    /api/customers/{id}     - Update customer
DELETE /api/customers/{id}     - Delete customer
```

### Reports & Analytics
```
GET /api/reports/revenue       - Revenue reports
GET /api/reports/sales         - Sales analytics
GET /api/reports/products      - Product performance
GET /api/reports/customers     - Customer analytics
```

## 🔍 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Restart services
docker-compose restart

# Rebuild containers
docker-compose up --build

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

#### Database Connection
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U pos_user

# Reset database
docker-compose down -v
docker-compose up postgres
```

#### Memory Issues (4GB RAM)
```bash
# Check memory usage
docker stats

# Optimize JVM settings
export JAVA_OPTS="-Xms128m -Xmx512m -XX:+UseG1GC"

# Increase swap space (Linux)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Performance Tuning

#### Backend Optimization
```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
```

#### Frontend Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test
./mvnw test -Dtest=ProductControllerTest
```

### Frontend Testing
```bash
npm test
npm run test:coverage
```

### Integration Testing
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full Support |
| Firefox | 88+     | ✅ Full Support |
| Safari  | 14+     | ✅ Full Support |
| Edge    | 90+     | ✅ Full Support |
| IE      | 11      | ❌ Not Supported |

## 🤝 Đóng Góp

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- **Java**: Google Java Style Guide
- **JavaScript**: ESLint + Prettier
- **Commit Messages**: Conventional Commits
- **Testing**: Minimum 80% coverage

### Project Structure
```
POS/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── src/test/           # Test files
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── context/           # React context
├── public/                # Static assets
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # Frontend container
└── README.md            # This file
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Contact

- 📧 **Email**: support@webthanhtoan.com
- 💬 **Issues**: [GitHub Issues](https://github.com/ncbao26/POS/issues)
- 📖 **Documentation**: [Wiki](https://github.com/ncbao26/POS/wiki)
- 🌐 **Website**: [WebThanhToan.com](https://webthanhtoan.com)

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Docker](https://www.docker.com/) - Containerization
- [Render](https://render.com/) - Deployment platform

---

<div align="center">
  <p>Made with ❤️ by WebThanhToan Team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
