# 🚀 MixxStore POS - Hướng Dẫn Deploy Lại với Tên Mới

## 🎯 **Tên Service Mới**

### **Backend Service:**
```
Tên cũ: pos-backend
Tên mới: mixxstorepos-backend
URL mới: https://mixxstorepos-backend.onrender.com
```

### **Frontend Service:**
```
Tên cũ: pos-frontend  
Tên mới: mixxstorepos-frontend
URL mới: https://mixxstorepos-frontend.onrender.com
```

## 🔧 **Bước 1: Tạo Services Mới trên Render**

### **1.1 Tạo Backend Service Mới**
1. Vào [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect GitHub repository
4. Cấu hình:
   ```yaml
   Name: mixxstorepos-backend
   Environment: Docker
   Region: Singapore
   Branch: main
   Root Directory: . (root)
   Dockerfile Path: Dockerfile.backend
   ```

### **1.2 Cấu hình Environment Variables cho Backend**
Copy tất cả variables từ `render-backend-env.txt`:

```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://dpg-d0vc7eh5pdvs738bf6h0-a.singapore-postgres.render.com:5432/pos_db_nofc
DB_DRIVER=org.postgresql.Driver
DB_USERNAME=pos_user
DB_PASSWORD=mSGLyGwgs1usyKfvCmgWLH9WLvQOrVDE
DB_POOL_SIZE=3
DB_POOL_MIN=1
DB_CONNECTION_TIMEOUT=30000
DB_IDLE_TIMEOUT=600000
DB_MAX_LIFETIME=1800000

# Spring Boot Configuration
SPRING_PROFILES_ACTIVE=production
PORT=8080

# JPA/Hibernate Configuration
JPA_DDL_AUTO=create-drop
JPA_SHOW_SQL=false
JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect
JPA_FORMAT_SQL=false

# Flyway Configuration
FLYWAY_ENABLED=false
FLYWAY_BASELINE_ON_MIGRATE=true
FLYWAY_VALIDATE_ON_MIGRATE=false

# Security Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-admin-password-change-this
JWT_SECRET=mixxstorepos-super-secret-jwt-key-here-make-it-long-and-secure-at-least-32-characters-long-for-production
JWT_EXPIRATION=86400000

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://mixxstorepos-frontend.onrender.com,http://localhost:3000
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*
CORS_ALLOW_CREDENTIALS=true

# Logging Configuration
LOG_LEVEL_APP=INFO
LOG_LEVEL_SECURITY=WARN
LOG_LEVEL_HIBERNATE=WARN
LOG_LEVEL_WEB=WARN
LOG_LEVEL_BOOT=INFO

# Actuator Configuration
ACTUATOR_ENDPOINTS=health,info
ACTUATOR_HEALTH_DETAILS=when-authorized
H2_CONSOLE_ENABLED=false

# JVM Optimization
JAVA_OPTS=-Xms256m -Xmx512m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:MaxGCPauseMillis=200
```

### **1.3 Deploy Backend**
1. Click **"Create Web Service"**
2. Đợi build và deploy hoàn thành
3. Kiểm tra: `https://mixxstorepos-backend.onrender.com/actuator/health`

## 🎨 **Bước 2: Tạo Frontend Service Mới**

### **2.1 Tạo Frontend Service**
1. Click **"New"** → **"Web Service"**
2. Connect cùng GitHub repository
3. Cấu hình:
   ```yaml
   Name: mixxstorepos-frontend
   Environment: Docker
   Region: Singapore
   Branch: main
   Root Directory: . (root)
   Dockerfile Path: Dockerfile
   ```

### **2.2 Cấu hình Environment Variables cho Frontend**
Copy variables từ `render-frontend-env.txt`:

```bash
# API Configuration
VITE_API_URL=https://mixxstorepos-backend.onrender.com

# App Configuration
VITE_APP_NAME=MixxStore POS
VITE_VERSION=1.0.0
VITE_APP_DESCRIPTION=Modern Point of Sale System for MixxStore

# Build Configuration
NODE_ENV=production
```

### **2.3 Deploy Frontend**
1. Click **"Create Web Service"**
2. Đợi build và deploy hoàn thành
3. Kiểm tra: `https://mixxstorepos-frontend.onrender.com`

## 🗑️ **Bước 3: Xóa Services Cũ (Tùy Chọn)**

### **3.1 Xóa Services Cũ**
1. Vào Render Dashboard
2. Tìm services cũ: `pos-backend`, `pos-frontend`
3. Vào Settings → Delete Service
4. Confirm deletion

### **3.2 Giữ Database**
- **KHÔNG** xóa PostgreSQL database
- Database có thể dùng chung cho service mới

## 🧪 **Bước 4: Kiểm Tra Hệ Thống Mới**

### **4.1 Test Backend**
```bash
# Health check
curl https://mixxstorepos-backend.onrender.com/actuator/health

# Expected response:
{"status":"UP","components":{"db":{"status":"UP"}}}
```

### **4.2 Test Frontend**
```bash
# Check frontend
curl -I https://mixxstorepos-frontend.onrender.com

# Expected: HTTP 200 OK
```

### **4.3 Test Full System**
1. Truy cập: `https://mixxstorepos-frontend.onrender.com`
2. Login với: `admin` / `admin123`
3. Kiểm tra các chức năng chính

## 🌐 **URLs Mới Chính Thức**

### **🏪 Main Application:**
```
🌐 Frontend: https://mixxstorepos-frontend.onrender.com
🔧 Backend: https://mixxstorepos-backend.onrender.com
📊 Health: https://mixxstorepos-backend.onrender.com/actuator/health
```

### **🔐 Login Credentials:**
```
👤 Username: admin
🔑 Password: admin123
```

## 🔄 **Bước 5: Cập Nhật Code (Đã Hoàn Thành)**

Các file đã được cập nhật:
- ✅ `render-backend-env.txt` - Environment variables cho backend
- ✅ `render-frontend-env.txt` - Environment variables cho frontend  
- ✅ `DEPLOYMENT_URLS.md` - URLs và hướng dẫn truy cập
- ✅ `backend/src/main/resources/application.yml` - Application name
- ✅ `package.json` - Project name

## 🚀 **Bước 6: Push Code và Deploy**

### **6.1 Commit Changes**
```bash
git add .
git commit -m "Update project name to MixxStore POS"
git push origin main
```

### **6.2 Trigger Redeploy**
- Render sẽ tự động detect code changes và redeploy
- Hoặc click "Manual Deploy" trong Render Dashboard

## ✅ **Checklist Deploy Hoàn Thành**

### **Backend Service:**
- [ ] Service name: `mixxstorepos-backend`
- [ ] All environment variables configured
- [ ] Health check working: `/actuator/health`
- [ ] Database connected successfully

### **Frontend Service:**
- [ ] Service name: `mixxstorepos-frontend`
- [ ] Environment variables configured
- [ ] VITE_API_URL pointing to new backend
- [ ] Website loading successfully

### **Testing:**
- [ ] Frontend accessible: `https://mixxstorepos-frontend.onrender.com`
- [ ] Login working with admin/admin123
- [ ] API calls working between frontend and backend
- [ ] All main features functional

## 🎉 **Kết Quả**

Sau khi hoàn thành, bạn sẽ có:

✅ **MixxStore POS System** với URLs mới
✅ **Tên riêng** không bị trùng với ai khác
✅ **Cùng database** và data như cũ
✅ **Performance** và features giống hệt

**🌐 Truy cập ngay:** https://mixxstorepos-frontend.onrender.com

**Chúc mừng! Bây giờ bạn đã có hệ thống POS riêng với tên MixxStore! 🎊** 