# 🚀 Deployment Guide - WebThanhToan

## 📋 Prerequisites

1. **GitHub Account**: Đảm bảo code đã được push lên GitHub
2. **Render Account**: Tạo tài khoản tại [render.com](https://render.com)
3. **Repository**: `https://github.com/ncbao26/POS`

## 🌐 Deploy to Render

### Step 1: Push Code to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add Render deployment configuration"

# Push to GitHub
git push origin main
```

### Step 2: Deploy on Render

1. **Login to Render Dashboard**
   - Truy cập [Render Dashboard](https://dashboard.render.com)
   - Đăng nhập với GitHub account

2. **Create New Blueprint**
   - Click "New" → "Blueprint"
   - Connect GitHub repository: `https://github.com/ncbao26/POS`
   - Render sẽ tự động phát hiện file `render.yaml`

3. **Review Services**
   - **Frontend**: `webthanhtoan-frontend` (React + Vite)
   - **Backend**: `webthanhtoan-backend` (Spring Boot)
   - **Database**: `webthanhtoan-db` (PostgreSQL)

4. **Deploy**
   - Click "Apply" để bắt đầu deployment
   - Quá trình deploy sẽ mất 5-10 phút

### Step 3: Access Your Application

- **Frontend URL**: `https://webthanhtoan-frontend.onrender.com`
- **Backend API**: `https://webthanhtoan-backend.onrender.com/api`
- **Database**: Managed by Render (internal access only)

## 🔧 Configuration Details

### Frontend Configuration
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `VITE_API_URL` (auto-configured from backend service)

### Backend Configuration
- **Build Command**: `cd backend && ./mvnw clean package -DskipTests`
- **Start Command**: `cd backend && java -Xms128m -Xmx512m -XX:+UseG1GC -jar target/*.jar`
- **Environment Variables**:
  - `SPRING_PROFILES_ACTIVE=production`
  - `SERVER_PORT=10000`
  - Database connection (auto-configured)
  - `JWT_SECRET` (auto-generated)

### Database Configuration
- **Type**: PostgreSQL (Free tier)
- **Database Name**: `webthanhtoan`
- **User**: `webthanhtoan_user`
- **Connection**: Auto-configured for backend

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check if all dependencies are in package.json
   npm install
   npm run build
   ```

2. **Backend Fails to Start**
   - Check Java version (should be 21)
   - Verify PostgreSQL connection
   - Check environment variables

3. **CORS Issues**
   - Frontend and backend URLs are pre-configured
   - Check `WebSecurityConfig.java` for allowed origins

4. **Database Connection Issues**
   - Render auto-configures database connection
   - Check environment variables in Render dashboard

### Monitoring

1. **Logs**
   - Frontend logs: Render Dashboard → webthanhtoan-frontend → Logs
   - Backend logs: Render Dashboard → webthanhtoan-backend → Logs

2. **Health Checks**
   - Frontend: `https://webthanhtoan-frontend.onrender.com`
   - Backend: `https://webthanhtoan-backend.onrender.com/api/auth/me`

## 🔄 Updates and Redeployment

### Automatic Deployment
- Render tự động deploy khi có commit mới trên `main` branch
- Push code mới lên GitHub để trigger deployment

### Manual Deployment
1. Truy cập Render Dashboard
2. Chọn service cần redeploy
3. Click "Manual Deploy" → "Deploy latest commit"

## 💡 Tips

1. **Free Tier Limitations**
   - Services sleep after 15 minutes of inactivity
   - First request after sleep có thể mất 30-60 giây
   - Database có giới hạn 1GB storage

2. **Performance Optimization**
   - Backend đã được tối ưu với JVM flags
   - Frontend sử dụng code splitting
   - Static assets được cache

3. **Security**
   - JWT secret được auto-generate
   - Database credentials được manage bởi Render
   - HTTPS được enable mặc định

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ncbao26/POS/issues)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Contact**: support@webthanhtoan.com