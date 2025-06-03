# Render Deployment Guide

## Prerequisites
- Code đã được commit và push lên GitHub repository: `ncbao26/POS`
- Render account connected với GitHub

## Deployment Steps

### 1. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub account
3. Connect your GitHub account

### 2. Deploy using Blueprint
1. In Render Dashboard, click **"New"** → **"Blueprint"**
2. Select repository: `ncbao26/POS`
3. Render will automatically detect `render.yaml` in the root
4. Click **"Apply"**

### 3. Services Created
The blueprint will create 3 services:

#### PostgreSQL Database (`pos-database`)
- **Type**: PostgreSQL
- **Plan**: Free
- **Database**: pos_db
- **User**: pos_user
- **Auto-generated password**

#### Backend Service (`pos-backend`)
- **Type**: Web Service
- **Environment**: Java
- **Build Command**: `cd WebThanhToan/backend && ./mvnw clean package -DskipTests`
- **Start Command**: `cd WebThanhToan/backend && java -jar target/*.jar --spring.profiles.active=production`
- **Environment Variables** (auto-configured):
  - `DATABASE_URL` - from PostgreSQL service
  - `DB_USERNAME` - from PostgreSQL service
  - `DB_PASSWORD` - from PostgreSQL service
  - `JWT_SECRET` - auto-generated
  - `CORS_ALLOWED_ORIGINS` - frontend URL

#### Frontend Service (`pos-frontend`)
- **Type**: Static Site
- **Build Command**: `cd WebThanhToan && npm ci && npm run build`
- **Publish Directory**: `WebThanhToan/dist`
- **Environment Variables**:
  - `VITE_API_URL` - backend service URL

### 4. Deployment Process
1. **Database**: Creates PostgreSQL instance (~2-3 minutes)
2. **Backend**: Builds Java application (~5-10 minutes)
3. **Frontend**: Builds React application (~3-5 minutes)

### 5. Access URLs
After deployment completes:
- **Frontend**: `https://pos-frontend.onrender.com`
- **Backend API**: `https://pos-backend.onrender.com`
- **Database**: Internal connection only

### 6. Login Credentials
- **Username**: admin, manager, cashier1, cashier2, mixxstore, user1, user2
- **Password**: admin123 (for all users)

### 7. Data Migration
The application will automatically:
- Create PostgreSQL tables
- Initialize users from SQL Server data
- Create sample products and customers

## Troubleshooting

### If Build Fails
1. Check build logs in Render dashboard
2. Ensure all files are committed to GitHub
3. Verify `render.yaml` is in repository root

### If Database Connection Fails
1. Check environment variables are set correctly
2. Verify PostgreSQL service is healthy
3. Check backend logs for connection errors

### If Frontend Can't Connect to Backend
1. Verify `VITE_API_URL` points to backend service
2. Check CORS configuration in backend
3. Ensure backend service is running

## Manual Deployment Alternative

If Blueprint fails, deploy services manually:

### 1. PostgreSQL Database
- New → PostgreSQL
- Name: `pos-database`
- Database: `pos_db`
- User: `pos_user`

### 2. Backend Service
- New → Web Service
- Connect repository: `ncbao26/POS`
- Name: `pos-backend`
- Environment: Java
- Build Command: `cd WebThanhToan/backend && ./mvnw clean package -DskipTests`
- Start Command: `cd WebThanhToan/backend && java -jar target/backend-1.0.0.jar --spring.profiles.active=production`
- Add environment variables manually

### 3. Frontend Service
- New → Static Site
- Connect repository: `ncbao26/POS`
- Name: `pos-frontend`
- Build Command: `cd WebThanhToan && npm ci && npm run build`
- Publish Directory: `WebThanhToan/dist`
- Add environment variables manually

## Post-Deployment
1. Test login with admin/admin123
2. Verify all features work
3. Check database has sample data
4. Test API endpoints 