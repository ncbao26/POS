# 🚀 HƯỚNG DẪN DEPLOY MANUAL TRÊN RENDER

## 📋 TỔNG QUAN DỰ ÁN

**Hệ thống POS (Point of Sale)**
- **Frontend**: React + Vite + Nginx
- **Backend**: Spring Boot + Java 21
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Deployment**: Docker trên Render

## 🔧 SETUP TRƯỚC KHI DEPLOY

### 1. Chuẩn bị Repository
```bash
# Đảm bảo code đã được push lên GitHub
git add .
git commit -m "Setup Docker for production deployment"
git push origin main
```

### 2. Tạo Database trên Render
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Cấu hình:
   - **Name**: `webthanhtoan-db`
   - **Database**: `webthanhtoan`
   - **User**: `webthanhtoan_user`
   - **Region**: `Singapore` (gần Việt Nam nhất)
   - **Plan**: `Free`
4. Click **"Create Database"**
5. **LƯU LẠI** thông tin connection:
   - **Internal Database URL**: `postgresql://webthanhtoan_user:xxx@xxx/webthanhtoan`
   - **External Database URL**: `postgresql://webthanhtoan_user:xxx@xxx/webthanhtoan`

## 🐳 DEPLOY BACKEND (Spring Boot)

### 1. Tạo Web Service cho Backend
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository: `ncbao26/POS`
3. Cấu hình:
   - **Name**: `webthanhtoan-backend`
   - **Region**: `Singapore`
   - **Branch**: `main`
   - **Root Directory**: `WebThanhToan/backend`
   - **Runtime**: `Docker`
   - **Plan**: `Free`

### 2. Build & Deploy Settings
```bash
# Build Command (để trống - sử dụng Dockerfile)

# Start Command (để trống - sử dụng Dockerfile)
```

### 3. Environment Variables
```bash
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=<Internal Database URL từ bước trên>
SPRING_DATASOURCE_USERNAME=webthanhtoan_user
SPRING_DATASOURCE_PASSWORD=<password từ database>
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure-2024
CORS_ALLOWED_ORIGINS=https://webthanhtoan-frontend.onrender.com
PORT=10000
```

### 4. Deploy Backend
1. Click **"Create Web Service"**
2. Đợi build và deploy (5-10 phút)
3. Kiểm tra logs để đảm bảo không có lỗi
4. Test health check: `https://webthanhtoan-backend.onrender.com/actuator/health`

## 🌐 DEPLOY FRONTEND (React + Nginx)

### 1. Tạo Web Service cho Frontend
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository: `ncbao26/POS`
3. Cấu hình:
   - **Name**: `webthanhtoan-frontend`
   - **Region**: `Singapore`
   - **Branch**: `main`
   - **Root Directory**: `WebThanhToan`
   - **Runtime**: `Docker`
   - **Plan**: `Free`

### 2. Environment Variables
```bash
NODE_ENV=production
VITE_API_URL=https://webthanhtoan-backend.onrender.com
```

### 3. Deploy Frontend
1. Click **"Create Web Service"**
2. Đợi build và deploy (3-5 phút)
3. Kiểm tra logs
4. Test: `https://webthanhtoan-frontend.onrender.com`

## 🔍 KIỂM TRA VÀ DEBUG

### 1. Health Checks
```bash
# Backend Health
curl https://webthanhtoan-backend.onrender.com/actuator/health

# Frontend Health
curl https://webthanhtoan-frontend.onrender.com/health

# Database Connection
# Kiểm tra logs của backend service
```

### 2. Common Issues & Solutions

#### Backend không start được
```bash
# Kiểm tra logs
# Thường do:
# 1. Database connection failed
# 2. Environment variables sai
# 3. Port configuration

# Fix:
# - Kiểm tra DATABASE_URL
# - Đảm bảo PORT=10000
# - Kiểm tra SPRING_PROFILES_ACTIVE=production
```

#### Frontend không load được
```bash
# Kiểm tra:
# 1. VITE_API_URL đúng chưa
# 2. CORS settings ở backend
# 3. Nginx configuration

# Fix:
# - Update VITE_API_URL
# - Kiểm tra CORS_ALLOWED_ORIGINS ở backend
```

#### Database connection issues
```bash
# Kiểm tra:
# 1. Database service đã running chưa
# 2. Connection string đúng chưa
# 3. Credentials đúng chưa

# Fix:
# - Restart database service
# - Update connection string
# - Kiểm tra username/password
```

## 🎯 TESTING DEPLOYMENT

### 1. Functional Tests
```bash
# 1. Truy cập frontend
https://webthanhtoan-frontend.onrender.com

# 2. Test login
Username: admin
Password: admin123

# 3. Test API endpoints
https://webthanhtoan-backend.onrender.com/api/auth/login
https://webthanhtoan-backend.onrender.com/api/products
https://webthanhtoan-backend.onrender.com/api/orders
```

### 2. Performance Tests
```bash
# Load time should be < 3s for first load
# API response time should be < 1s
# Database queries should be < 500ms
```

## 🔧 MAINTENANCE

### 1. Monitoring
- Kiểm tra logs hàng ngày
- Monitor resource usage
- Set up alerts cho downtime

### 2. Updates
```bash
# Deploy new version:
git add .
git commit -m "Update: description"
git push origin main
# Render sẽ tự động deploy
```

### 3. Backup
- Database backup tự động (Render free plan: 7 days)
- Code backup trên GitHub
- Environment variables backup

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra logs trên Render Dashboard
2. Kiểm tra GitHub Actions (nếu có)
3. Test local với Docker Compose
4. Liên hệ Render Support (nếu cần)

## 🎉 HOÀN THÀNH

Sau khi deploy thành công:
- ✅ Frontend: `https://webthanhtoan-frontend.onrender.com`
- ✅ Backend: `https://webthanhtoan-backend.onrender.com`
- ✅ Database: PostgreSQL trên Render
- ✅ SSL/HTTPS tự động
- ✅ Auto-deploy từ GitHub 