# 🐳 DOCKER SETUP HOÀN CHỈNH - HỆ THỐNG POS

## 📋 TỔNG QUAN DỰ ÁN

**Hệ thống POS (Point of Sale) - Full Stack**
- **Frontend**: React 19 + Vite + Nginx
- **Backend**: Spring Boot 3 + Java 21
- **Database**: PostgreSQL 15
- **Authentication**: JWT
- **Deployment**: Docker + Render

## 🏗️ CẤU TRÚC DOCKER

```
WebThanhToan/
├── Dockerfile                 # Frontend Docker
├── nginx.conf                # Nginx config cho frontend
├── .dockerignore             # Frontend ignore
├── docker-compose.yml        # Local development
├── deploy-frontend.sh        # Frontend deploy script
├── deploy-backend.sh         # Backend deploy script
└── backend/
    ├── Dockerfile            # Backend Docker
    └── .dockerignore         # Backend ignore
```

## 🚀 QUICK START - LOCAL DEVELOPMENT

### 1. Clone và Setup
```bash
git clone https://github.com/ncbao26/POS.git
cd POS/WebThanhToan
```

### 2. Chạy với Docker Compose
```bash
# Build và start tất cả services
docker-compose up --build

# Hoặc chạy background
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Database**: localhost:5432

### 4. Test Login
```
Username: admin
Password: admin123
```

## 🌐 PRODUCTION DEPLOYMENT - RENDER

### Bước 1: Tạo Database
1. Đăng nhập [Render Dashboard](https://dashboard.render.com)
2. **New +** → **PostgreSQL**
3. Cấu hình:
   - Name: `webthanhtoan-db`
   - Database: `webthanhtoan`
   - User: `webthanhtoan_user`
   - Region: `Singapore`
   - Plan: `Free`

### Bước 2: Deploy Backend
1. **New +** → **Web Service**
2. Connect: `ncbao26/POS`
3. Settings:
   - Name: `webthanhtoan-backend`
   - Root Directory: `WebThanhToan/backend`
   - Runtime: `Docker`
   - Region: `Singapore`

**Environment Variables:**
```bash
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=<Database Internal URL>
SPRING_DATASOURCE_USERNAME=webthanhtoan_user
SPRING_DATASOURCE_PASSWORD=<Database Password>
JWT_SECRET=your-super-secret-jwt-key-2024
CORS_ALLOWED_ORIGINS=https://webthanhtoan-frontend.onrender.com
PORT=10000
```

### Bước 3: Deploy Frontend
1. **New +** → **Web Service**
2. Connect: `ncbao26/POS`
3. Settings:
   - Name: `webthanhtoan-frontend`
   - Root Directory: `WebThanhToan`
   - Runtime: `Docker`
   - Region: `Singapore`

**Environment Variables:**
```bash
NODE_ENV=production
VITE_API_URL=https://webthanhtoan-backend.onrender.com
```

## 🔧 DOCKER CONFIGURATIONS

### Frontend Dockerfile
- **Multi-stage build**: Node.js build + Nginx serve
- **Security**: Non-root user, security headers
- **Performance**: Gzip compression, static caching
- **Health check**: Automated health monitoring

### Backend Dockerfile
- **Multi-stage build**: Maven build + JRE runtime
- **Optimization**: G1GC, memory tuning
- **Security**: Non-root spring user
- **Dynamic port**: Support Render's PORT variable

### Nginx Configuration
- **SPA Support**: React Router handling
- **API Proxy**: Backend API routing
- **Caching**: Static assets optimization
- **Security**: Security headers, CORS

### Docker Compose
- **Services**: Frontend, Backend, PostgreSQL
- **Networks**: Isolated network communication
- **Health checks**: Service dependency management
- **Volumes**: Database persistence

## 🛠️ DEVELOPMENT COMMANDS

### Docker Commands
```bash
# Build specific service
docker-compose build frontend
docker-compose build backend

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# View logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres

# Execute commands in container
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec postgres psql -U webthanhtoan_user -d webthanhtoan
```

### Database Commands
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U webthanhtoan_user -d webthanhtoan

# Backup database
docker-compose exec postgres pg_dump -U webthanhtoan_user webthanhtoan > backup.sql

# Restore database
docker-compose exec -T postgres psql -U webthanhtoan_user webthanhtoan < backup.sql
```

## 🔍 TROUBLESHOOTING

### Common Issues

#### 1. Frontend không build được
```bash
# Clear node_modules và rebuild
docker-compose down
docker-compose build --no-cache frontend
docker-compose up frontend
```

#### 2. Backend không connect database
```bash
# Kiểm tra database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Kiểm tra connection string
docker-compose exec backend env | grep SPRING_DATASOURCE
```

#### 3. Port conflicts
```bash
# Kiểm tra ports đang sử dụng
netstat -an | findstr :3000
netstat -an | findstr :8080
netstat -an | findstr :5432

# Stop conflicting services
docker-compose down
# Hoặc change ports trong docker-compose.yml
```

#### 4. Memory issues
```bash
# Giảm memory usage
# Trong docker-compose.yml thêm:
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m
```

## 📊 MONITORING & HEALTH CHECKS

### Health Check URLs
```bash
# Frontend
curl http://localhost:3000/health

# Backend
curl http://localhost:8080/actuator/health

# Database
docker-compose exec postgres pg_isready -U webthanhtoan_user
```

### Performance Monitoring
```bash
# Container stats
docker stats

# Service logs
docker-compose logs --tail=100 -f

# Database performance
docker-compose exec postgres psql -U webthanhtoan_user -d webthanhtoan -c "SELECT * FROM pg_stat_activity;"
```

## 🔐 SECURITY CONSIDERATIONS

### Production Security
- ✅ Non-root users in containers
- ✅ Security headers in Nginx
- ✅ Environment variables for secrets
- ✅ HTTPS/SSL on Render
- ✅ CORS configuration
- ✅ JWT token security

### Database Security
- ✅ Strong passwords
- ✅ Limited user permissions
- ✅ Network isolation
- ✅ Backup encryption

## 📈 PERFORMANCE OPTIMIZATION

### Frontend Optimization
- ✅ Multi-stage Docker build
- ✅ Nginx gzip compression
- ✅ Static asset caching
- ✅ Bundle size optimization

### Backend Optimization
- ✅ JVM tuning (G1GC)
- ✅ Memory optimization
- ✅ Connection pooling
- ✅ Database indexing

## 🎯 NEXT STEPS

1. **Setup CI/CD**: GitHub Actions cho auto-deploy
2. **Monitoring**: Setup logging và monitoring
3. **Backup**: Automated database backups
4. **Scaling**: Load balancing và horizontal scaling
5. **Testing**: Integration tests với Docker

## 📞 SUPPORT

- **Documentation**: `RENDER_MANUAL_DEPLOY.md`
- **Issues**: GitHub Issues
- **Logs**: Render Dashboard
- **Database**: Render PostgreSQL Dashboard

---

**🎉 Setup hoàn tất! Dự án POS đã sẵn sàng deploy với Docker trên Render.** 