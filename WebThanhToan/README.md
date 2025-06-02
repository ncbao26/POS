# WebThanhToan - Hệ thống quản lý thanh toán

Hệ thống quản lý thanh toán và kho hàng được xây dựng với React + Vite (Frontend) và Spring Boot + SQL Server (Backend).

## 🚀 Tính năng chính

### Frontend (React + Vite)
- **Dashboard**: Thống kê doanh thu, giao dịch gần đây, cảnh báo hàng tồn kho
- **Quản lý hóa đơn**: Tạo hóa đơn đa tab, tìm kiếm sản phẩm, quản lý khách hàng, áp dụng giảm giá
- **Quản lý sản phẩm**: CRUD sản phẩm với mô tả chi tiết, theo dõi tồn kho
- **Báo cáo**: Lọc theo ngày, xuất báo cáo, thống kê bán hàng, in hóa đơn
- **Xác thực**: Đăng nhập JWT, bảo vệ route

### Backend (Spring Boot + Java 21)
- **API RESTful**: Quản lý sản phẩm, khách hàng, hóa đơn
- **Bảo mật**: JWT Authentication, Spring Security, BCrypt password
- **Database**: SQL Server với 9 bảng, 3 view, 4 trigger
- **Validation**: Kiểm tra dữ liệu đầu vào, xử lý lỗi

## 🆕 Tính năng nổi bật

### 🎯 **Tự động in hóa đơn sau thanh toán**
- Khi nhấn "Thanh toán", hệ thống tự động mở cửa sổ in hóa đơn chính thức
- Tránh việc quên in hóa đơn cho khách hàng
- Hỗ trợ in hóa đơn tạm thời và hóa đơn chính thức

### 📦 **Kiểm tra tồn kho thông minh**
- Kiểm tra thời gian thực khi thêm sản phẩm vào hóa đơn
- Cảnh báo trực quan với badge màu sắc
- Ngăn chặn thanh toán khi vượt tồn kho
- Thông báo chi tiết cho từng sản phẩm

### 👥 **Autocomplete khách hàng**
- Gợi ý thông minh theo số điện thoại hoặc tên
- Dropdown trực quan với highlight text
- Hỗ trợ keyboard navigation (mũi tên, Enter, Escape)
- Thêm khách hàng mới nhanh chóng

### ✏️ **Sửa hóa đơn nâng cao**
- Tìm kiếm và thêm sản phẩm mới vào hóa đơn
- Quản lý số lượng thông minh
- Kiểm tra tồn kho khi sửa
- Form validation toàn diện

### 🖨️ **Hệ thống in chuyên nghiệp**
- In hóa đơn tạm thời (draft) và chính thức
- Template HTML đẹp mắt, tối ưu cho A4
- In từng hóa đơn hoặc báo cáo tổng hợp
- Tự động mở dialog in của trình duyệt

## 📋 Yêu cầu hệ thống

- **Java 21** (LTS)
- **Node.js 18+** và **npm**
- **SQL Server 2019+** hoặc SQL Server Express
- **Git**

## 🛠️ Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd WebThanhToan
```

### 2. Thiết lập Database
```bash
cd database
# Chạy script thiết lập (Windows)
./setup_database.ps1
# hoặc
setup_database.bat
```

### 3. Chạy Backend (Spring Boot)
```bash
cd backend
# Kiểm tra Java version
java -version

# Chạy ứng dụng
./mvnw spring-boot:run
# hoặc sử dụng script
./run.ps1
```

Backend sẽ chạy tại: `http://localhost:8080/api`

### 4. Chạy Frontend (React)
```bash
# Từ thư mục gốc
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 🔐 Tài khoản demo

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| manager | admin123 | USER |
| cashier1 | admin123 | USER |
| cashier2 | admin123 | USER |

## 📁 Cấu trúc project

```
WebThanhToan/
├── src/                    # Frontend React
│   ├── components/         # Components tái sử dụng
│   ├── context/           # React Context (state management)
│   ├── pages/             # Các trang chính
│   ├── services/          # API services
│   └── App.jsx            # Component gốc
├── backend/               # Backend Spring Boot
│   ├── src/main/java/     # Source code Java
│   ├── src/main/resources/ # Cấu hình và resources
│   └── pom.xml            # Maven dependencies
├── database/              # Scripts database
│   ├── create_database.sql # Tạo schema
│   ├── insert_sample_data.sql # Dữ liệu mẫu
│   └── setup_database.ps1  # Script tự động
├── public/                # Static files
└── package.json           # Frontend dependencies
```

## 🔧 Cấu hình

### Database (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;instanceName=CBAOSQL;databaseName=WebThanhToan;encrypt=false;trustServerCertificate=true
    username: sa
    password: your_password
```

### JWT Configuration
```yaml
jwt:
  secret: mySecretKey
  expiration: 86400000  # 24 hours
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

### Products
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/products/{id}` - Xóa sản phẩm (soft delete)
- `GET /api/products/search?name=...` - Tìm kiếm sản phẩm
- `GET /api/products/low-stock?threshold=10` - Sản phẩm sắp hết hàng

### Customers
- `GET /api/customers` - Danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/{id}` - Cập nhật khách hàng
- `DELETE /api/customers/{id}` - Xóa khách hàng

### Invoices
- `GET /api/invoices` - Danh sách hóa đơn
- `POST /api/invoices` - Tạo hóa đơn mới
- `PUT /api/invoices/{id}` - Cập nhật hóa đơn
- `GET /api/invoices/{id}` - Chi tiết hóa đơn
- `GET /api/invoices/filter` - Lọc hóa đơn theo ngày/trạng thái

## 🗄️ Database Schema

### Bảng chính
- `users` - Quản lý người dùng
- `products` - Danh mục sản phẩm
- `customers` - Thông tin khách hàng
- `invoices` - Hóa đơn bán hàng
- `invoice_items` - Chi tiết hóa đơn
- `inventory_transactions` - Giao dịch kho
- `payment_transactions` - Giao dịch thanh toán
- `system_settings` - Cài đặt hệ thống
- `audit_logs` - Nhật ký hoạt động

### Views
- `daily_revenue_view` - Doanh thu theo ngày
- `top_selling_products_view` - Sản phẩm bán chạy
- `low_stock_view` - Sản phẩm sắp hết hàng

## 🚀 Tính năng hoạt động

### ✅ Đã hoàn thiện:
- 🔐 Đăng nhập/đăng xuất với JWT
- 📊 Dashboard với thống kê real-time
- 🛍️ Quản lý sản phẩm (CRUD) với kiểm tra tồn kho
- 👥 Quản lý khách hàng với autocomplete
- 🧾 Quản lý hóa đơn đa tab với tự động in
- 💰 Tính toán giá, lợi nhuận, giảm giá
- 🔍 Tìm kiếm sản phẩm và khách hàng
- 📱 Responsive design
- 🎨 UI/UX hiện đại với TailwindCSS
- 🖨️ In hóa đơn chuyên nghiệp
- 📈 Báo cáo chi tiết với xuất CSV

### 🔄 API Integration:
- ✅ Authentication với JWT
- ✅ CORS configuration
- ✅ Error handling
- ✅ Auto-logout khi token hết hạn
- ✅ Loading states
- ✅ Toast notifications

## 🛡️ Bảo mật

### ✅ Đã implement:
- JWT Authentication với refresh token
- Password encoding (BCrypt)
- CORS protection
- Input validation
- SQL injection protection (JPA)
- XSS protection

## 📈 Performance

### ✅ Tối ưu hóa:
- Database indexing
- Lazy loading
- Component optimization
- API caching
- Responsive design

## 🐛 Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra SQL Server đang chạy
services.msc -> SQL Server

# Test kết nối
sqlcmd -S localhost -E -Q "SELECT @@VERSION"
```

### Lỗi Java version
```bash
# Kiểm tra Java version
java -version

# Đảm bảo JAVA_HOME đúng
echo $JAVA_HOME
```

### Lỗi CORS
- Kiểm tra cấu hình CORS trong `application.yml`
- Đảm bảo frontend chạy trên port 5173

## 🎯 Kết luận

**Dự án WebThanhToan đã sẵn sàng sử dụng trong môi trường production!**

- ✅ Backend hoạt động ổn định với Spring Boot
- ✅ Frontend responsive và user-friendly với React
- ✅ Database đầy đủ với SQL Server
- ✅ API integration hoàn chỉnh
- ✅ Authentication & authorization
- ✅ Modern UI/UX design
- ✅ Professional printing system
- ✅ Comprehensive stock management

**Hệ thống có thể chạy ngay lập tức và sẵn sàng cho việc triển khai thực tế.**
