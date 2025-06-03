# 🚀 Hướng Dẫn Deploy POS System lên Render bằng Docker

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn deploy dự án WebThanhToan POS System lên Render platform sử dụng Docker containers một cách manual.

## 🏗️ Kiến Trúc Deploy

```
┌─────────────────────────────────────────────────────────────┐
│                        RENDER CLOUD                        │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Frontend      │  │    Backend      │  │  Database   │ │
│  │   (Docker)      │  │   (Docker)      │  │ (PostgreSQL)│ │
│  │   Port: 3000    │  │   Port: 8080    │  │ Port: 5432  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                     │                   │       │
│           └─────────────────────┼───────────────────┘       │
│                                 │                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Custom Domain (Optional)                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Yêu Cầu Trước Khi Deploy

### ✅ **Tài Khoản & Tools**
- [x] Tài khoản GitHub (free)
- [x] Tài khoản Render (free tier available)
- [x] Git đã cài đặt
- [x] Docker Desktop (để test local)

### ✅ **Chuẩn Bị Code**
- [x] Code đã push lên GitHub repository
- [x] Dockerfile cho frontend và backend
- [x] Environment variables đã cấu hình

## 🚀 Bước 1: Chuẩn Bị Repository

### 1.1 Kiểm Tra Cấu Trúc Project
```
POS/
├── backend/
│   ├── Dockerfile              # ✅ Backend Docker config
│   ├── src/
│   └── pom.xml
├── src/                        # Frontend React code
├── Dockerfile                  # ✅ Frontend Docker config
├── docker-compose.yml          # Local development
├── nginx.conf                  # ✅ Nginx config
├── package.json
└── README.md
```

### 1.2 Push Code lên GitHub
```bash
# Nếu chưa có remote repository
git remote add origin https://github.com/YOUR_USERNAME/POS.git

# Push code
git add .
git commit -m "Prepare for Render deployment"
git push -u origin main
```

## 🗄️ Bước 2: Tạo PostgreSQL Database

### 2.1 Tạo Database Service
1. Đăng nhập [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"PostgreSQL"**
3. Cấu hình database:
   ```
   Name: pos-database
   Database: pos_db
   User: pos_user
   Region: Singapore (gần Việt Nam nhất)
   Plan: Free
   ```
4. Click **"Create Database"**

### 2.2 Lưu Database Connection Info
Sau khi tạo xong, lưu lại thông tin:
```
Internal Database URL: postgresql://pos_user:password@hostname:5432/pos_db
External Database URL: postgresql://pos_user:password@external-hostname:5432/pos_db
Host: dpg-xxxxx-a.singapore-postgres.render.com
Port: 5432
Database: pos_db
Username: pos_user
Password: [auto-generated]
```

## 🔧 Bước 3: Deploy Backend (Spring Boot)

### 3.1 Tạo Backend Web Service
1. Trong Render Dashboard, click **"New"** → **"Web Service"**
2. Connect GitHub repository: `https://github.com/YOUR_USERNAME/POS`
3. Cấu hình service:

```yaml
Name: pos-backend
Environment: Docker
Region: Singapore
Branch: main
Root Directory: backend
Dockerfile Path: backend/Dockerfile
```

### 3.2 Cấu hình Environment Variables
Trong phần **Environment Variables**, thêm:

```bash
# Database Configuration
DATABASE_URL=postgresql://pos_user:PASSWORD@HOST:5432/pos_db
DB_HOST=dpg-xxxxx-a.singapore-postgres.render.com
DB_PORT=5432
DB_NAME=pos_db
DB_USERNAME=pos_user
DB_PASSWORD=YOUR_DB_PASSWORD

# Spring Profiles
SPRING_PROFILES_ACTIVE=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
JWT_EXPIRATION=86400000

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://pos-frontend.onrender.com,http://localhost:3000

# Server Configuration
SERVER_PORT=8080

# JVM Optimization for Render
JAVA_OPTS=-Xms256m -Xmx512m -XX:+UseG1GC -XX:+UseStringDeduplication
```

### 3.3 Cấu hình Build & Deploy
```yaml
Build Command: (leave empty - Docker handles this)
Start Command: (leave empty - Docker handles this)
```

### 3.4 Deploy Backend
1. Click **"Create Web Service"**
2. Render sẽ tự động:
   - Clone repository
   - Build Docker image từ `backend/Dockerfile`
   - Deploy container
   - Assign URL: `https://pos-backend.onrender.com`

## 🎨 Bước 4: Deploy Frontend (React)

### 4.1 Tạo Frontend Web Service
1. Click **"New"** → **"Web Service"**
2. Connect cùng GitHub repository
3. Cấu hình service:

```yaml
Name: pos-frontend
Environment: Docker
Region: Singapore
Branch: main
Root Directory: . (root)
Dockerfile Path: Dockerfile
```

### 4.2 Cấu hình Environment Variables
```bash
# API Configuration
VITE_API_URL=https://pos-backend.onrender.com

# App Configuration
VITE_APP_NAME=WebThanhToan POS
VITE_VERSION=1.0.0

# Build Configuration
NODE_ENV=production
```

### 4.3 Deploy Frontend
1. Click **"Create Web Service"**
2. Render sẽ:
   - Build React app với Vite
   - Tạo production build
   - Serve với Nginx
   - Assign URL: `https://pos-frontend.onrender.com`

## 🔗 Bước 5: Cấu Hình CORS & Connectivity

### 5.1 Update Backend CORS
Đảm bảo backend cho phép frontend domain:
```java
// Trong backend/src/main/java/.../config/CorsConfig.java
@CrossOrigin(origins = {
    "https://pos-frontend.onrender.com",
    "http://localhost:3000"
})
```

### 5.2 Update Frontend API URL
Đảm bảo frontend gọi đúng backend URL:
```javascript
// Trong src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pos-backend.onrender.com';
```

## 🧪 Bước 6: Testing & Verification

### 6.1 Kiểm Tra Database
```bash
# Test database connection
curl https://pos-backend.onrender.com/actuator/health
```

### 6.2 Kiểm Tra Backend API
```bash
# Test API endpoints
curl https://pos-backend.onrender.com/api/products
curl https://pos-backend.onrender.com/api/health
```

### 6.3 Kiểm Tra Frontend
1. Truy cập: `https://pos-frontend.onrender.com`
2. Test các chức năng:
   - Login/Register
   - Product Management
   - POS Interface
   - Reports & Analytics

## 🔧 Bước 7: Troubleshooting

### 7.1 Common Issues

#### **Backend không start được**
```bash
# Check logs trong Render Dashboard
# Thường do:
- Database connection failed
- Environment variables missing
- Memory limit exceeded
```

#### **Frontend không load được**
```bash
# Check:
- VITE_API_URL đúng chưa
- CORS configuration
- Build process successful
```

#### **Database connection issues**
```bash
# Verify:
- Database URL format
- Username/password correct
- Database is running
- Network connectivity
```

### 7.2 Debug Commands
```bash
# Check backend health
curl https://pos-backend.onrender.com/actuator/health

# Check frontend
curl -I https://pos-frontend.onrender.com

# Check database (from backend logs)
# Look for connection success/failure messages
```

## 📊 Bước 8: Monitoring & Maintenance

### 8.1 Render Dashboard Monitoring
- **Metrics**: CPU, Memory, Response time
- **Logs**: Real-time application logs
- **Deployments**: History và rollback options

### 8.2 Application Health Checks
```bash
# Backend health endpoint
GET https://pos-backend.onrender.com/actuator/health

# Response should be:
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

### 8.3 Performance Optimization
```yaml
# Backend optimization
JAVA_OPTS: -Xms256m -Xmx512m -XX:+UseG1GC

# Frontend optimization
- Enable gzip compression
- Optimize bundle size
- Use CDN for static assets
```

## 🚀 Bước 9: Custom Domain (Optional)

### 9.1 Setup Custom Domain
1. Trong Render service settings
2. Add custom domain: `pos.yourdomain.com`
3. Configure DNS records:
   ```
   Type: CNAME
   Name: pos
   Value: pos-frontend.onrender.com
   ```

### 9.2 SSL Certificate
- Render tự động cung cấp SSL certificate
- HTTPS được enable mặc định

## 💰 Bước 10: Cost Optimization

### 10.1 Free Tier Limits
```
PostgreSQL: 1GB storage, 1 month retention
Web Services: 750 hours/month (sleep after 15min inactive)
Bandwidth: 100GB/month
```

### 10.2 Upgrade Options
```
Starter Plan: $7/month
- No sleep
- More resources
- Better performance
```

## 📋 Checklist Deploy Hoàn Chỉnh

### ✅ **Pre-deployment**
- [ ] Code pushed to GitHub
- [ ] Dockerfiles tested locally
- [ ] Environment variables prepared
- [ ] Database schema ready

### ✅ **Deployment**
- [ ] PostgreSQL database created
- [ ] Backend service deployed
- [ ] Frontend service deployed
- [ ] Environment variables configured

### ✅ **Post-deployment**
- [ ] All services running
- [ ] Database connected
- [ ] API endpoints working
- [ ] Frontend loading correctly
- [ ] CORS configured properly

### ✅ **Testing**
- [ ] User registration/login
- [ ] Product CRUD operations
- [ ] POS functionality
- [ ] Reports generation
- [ ] Mobile responsiveness

## 🆘 Support & Resources

### 📚 **Documentation**
- [Render Docker Guide](https://render.com/docs/docker)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render PostgreSQL](https://render.com/docs/databases)

### 💬 **Community Support**
- [Render Community](https://community.render.com/)
- [GitHub Issues](https://github.com/ncbao26/POS/issues)

### 📧 **Contact**
- Email: support@webthanhtoan.com
- GitHub: [@ncbao26](https://github.com/ncbao26)

---

## 🎉 Kết Luận

Sau khi hoàn thành tất cả các bước trên, bạn sẽ có:

- ✅ **Production-ready POS System** chạy trên Render
- ✅ **Scalable architecture** với Docker containers
- ✅ **Managed PostgreSQL database**
- ✅ **HTTPS-enabled** với custom domain
- ✅ **Monitoring & logging** capabilities

**Live URLs:**
- Frontend: `https://pos-frontend.onrender.com`
- Backend API: `https://pos-backend.onrender.com`
- Database: Managed PostgreSQL on Render

Chúc bạn deploy thành công! 🚀 