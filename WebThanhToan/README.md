# WebThanhToan - Hệ thống POS (Point of Sale)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.0-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-green.svg)

## 🚀 Tổng quan

**WebThanhToan** là hệ thống quản lý bán hàng (POS) hiện đại, được xây dựng với công nghệ mới nhất để phục vụ các cửa hàng bán lẻ, nhà hàng, và doanh nghiệp vừa và nhỏ.

### ✨ Tính năng chính

- 🛒 **Quản lý bán hàng**: Tạo hóa đơn nhanh chóng với giao diện trực quan
- 📊 **Dashboard thông minh**: Biểu đồ doanh thu real-time với Chart.js
- 📦 **Quản lý kho**: Theo dõi tồn kho, cảnh báo hết hàng
- 👥 **Quản lý khách hàng**: CRM đơn giản với autocomplete
- 🧾 **Quản lý hóa đơn**: Xem, chỉnh sửa, in hóa đơn chuyên nghiệp
- 📈 **Báo cáo chi tiết**: Phân tích doanh thu, sản phẩm bán chạy
- 🔐 **Bảo mật**: JWT authentication, phân quyền người dùng
- 📱 **Responsive**: Hoạt động mượt mà trên mọi thiết bị

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React 19      │◄──►│  Spring Boot    │◄──►│  SQL Server     │
│   TailwindCSS   │    │   Java 21       │    │                 │
│   Chart.js      │    │   JWT Auth      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🛠️ Công nghệ sử dụng

#### Frontend
- **React 19** - UI Framework hiện đại
- **Vite** - Build tool nhanh chóng
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js** - Thư viện biểu đồ tương tác
- **React Router** - Navigation
- **React Hot Toast** - Notifications

#### Backend
- **Spring Boot 3.3.0** - Java framework
- **Java 21** - LTS version mới nhất
- **Spring Security** - Authentication & Authorization
- **JWT** - Stateless authentication
- **JPA/Hibernate** - ORM
- **Maven** - Dependency management

#### Database
- **SQL Server** - Enterprise database
- **Optimized queries** - Performance tuning
- **Proper indexing** - Fast data retrieval

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Java 21+** (LTS)
- **Node.js 18+** 
- **SQL Server** (hoặc SQL Server Express)
- **Maven 3.6+**
- **Git**

### 1. Clone repository

```bash
git clone https://github.com/your-username/WebThanhToan.git
cd WebThanhToan
```

### 2. Cài đặt Database

```bash
# Chạy script tạo database
cd database
# Windows
.\setup_database.bat
# hoặc PowerShell
.\setup_database.ps1
```

### 3. Cấu hình Backend

```bash
cd backend
# Copy và chỉnh sửa file cấu hình
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Cập nhật thông tin database connection
```

### 4. Chạy Backend

```bash
# Windows
.\mvnw.cmd spring-boot:run
# Linux/Mac
./mvnw spring-boot:run
```

### 5. Cài đặt và chạy Frontend

```bash
# Cài đặt dependencies
npm install
# Chạy development server
npm run dev
```

### 6. Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api

**Tài khoản mặc định:**
- Username: `admin`
- Password: `admin123`

## 🐳 Deploy với Docker

### Quick Start với Docker Compose

```bash
# Copy environment file
cp env.example .env
# Chỉnh sửa .env theo môi trường của bạn

# Build và chạy
docker-compose up -d
```

### Manual Docker Build

```bash
# Build frontend
docker build -f Dockerfile.frontend -t webthanhtoan-frontend .

# Build backend
cd backend
docker build -t webthanhtoan-backend .
```

## 📖 Hướng dẫn sử dụng

### 1. Đăng nhập
- Truy cập ứng dụng và đăng nhập với tài khoản admin
- Hệ thống sẽ chuyển hướng đến Dashboard

### 2. Quản lý sản phẩm
- Vào **Quản lý sản phẩm** để thêm/sửa/xóa sản phẩm
- Cập nhật giá bán, giá vốn, số lượng tồn kho

### 3. Tạo hóa đơn
- Vào **Quản lý thanh toán** để tạo hóa đơn mới
- Tìm kiếm và thêm sản phẩm vào hóa đơn
- Chọn khách hàng (hoặc để trống cho khách lẻ)
- Áp dụng giảm giá nếu cần
- Chọn phương thức thanh toán và hoàn tất

### 4. Xem báo cáo
- **Dashboard**: Xem tổng quan doanh thu với biểu đồ
- **Báo cáo**: Phân tích chi tiết theo thời gian
- **Danh sách hóa đơn**: Quản lý tất cả giao dịch

## 🔧 Cấu hình nâng cao

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=1433
DB_NAME=WebThanhToan
DB_USERNAME=sa
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# App
APP_PORT=8080
FRONTEND_URL=http://localhost:5173
```

### Production Deployment

Xem chi tiết trong [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Email**: support@webthanhtoan.com
- **Website**: https://webthanhtoan.com
- **Documentation**: https://docs.webthanhtoan.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [TailwindCSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)

---

**Made with ❤️ for Vietnamese businesses**
