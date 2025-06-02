# 🚀 WebThanhToan - Hướng dẫn Deploy Production

## 📋 Yêu cầu hệ thống

### Minimum Requirements:
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### Recommended for Production:
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Load Balancer**: Nginx/HAProxy
- **SSL Certificate**: Let's Encrypt hoặc commercial

## 🛠️ Cài đặt môi trường

### 1. Cài đặt Docker (Ubuntu/Debian)
```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Cài đặt Docker (Windows)
1. Download Docker Desktop từ [docker.com](https://www.docker.com/products/docker-desktop)
2. Chạy installer và follow hướng dẫn
3. Restart máy tính
4. Verify installation: `docker --version`

## 🚀 Deploy ứng dụng

### Option 1: Deploy với Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd WebThanhToan

# 2. Tạo environment file
cp .env.example .env

# 3. Cấu hình environment variables
nano .env

# 4. Build và start services
docker-compose up -d

# 5. Check logs
docker-compose logs -f

# 6. Verify deployment
curl http://localhost:80
curl http://localhost:8080/actuator/health
```

### Option 2: Deploy với script tự động

```bash
# Make script executable
chmod +x deploy.sh

# Deploy
./deploy.sh deploy

# Check health
./deploy.sh health

# Rollback if needed
./deploy.sh rollback
```

## 🔧 Cấu hình Production

### 1. Environment Variables (.env)
```bash
# Database Configuration
DB_PASSWORD=YourStrongPassword123!
DB_NAME=WebThanhToan

# JWT Configuration
JWT_SECRET=YourVeryLongAndSecureJWTSecretKey123456789
JWT_EXPIRATION=86400000

# Application Configuration
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT=8080

# Nginx Configuration
NGINX_PORT=80
NGINX_SSL_PORT=443

# Redis Configuration (Optional)
REDIS_PASSWORD=YourRedisPassword123!
```

### 2. SSL Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Firewall Configuration
```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if needed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## 📊 Monitoring và Logging

### 1. Application Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Follow logs in real-time
docker-compose logs -f backend
```

### 2. Health Monitoring
```bash
# Check service status
docker-compose ps

# Health check endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
curl http://localhost:8080/actuator/info
```

### 3. Database Monitoring
```bash
# Connect to database
docker exec -it webthanhtoan-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourPassword"

# Check database size
SELECT 
    DB_NAME(database_id) AS DatabaseName,
    (size * 8.0) / 1024 AS SizeMB
FROM sys.master_files
WHERE database_id = DB_ID('WebThanhToan')
```

## 🔄 Backup và Restore

### 1. Automated Backup
```bash
# Create backup
./deploy.sh backup

# Backup location
ls -la /opt/backups/webthanhtoan/
```

### 2. Manual Backup
```bash
# Database backup
docker exec webthanhtoan-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword" \
  -Q "BACKUP DATABASE [WebThanhToan] TO DISK = N'/var/opt/mssql/backup/manual_backup.bak'"

# Copy to host
docker cp webthanhtoan-db:/var/opt/mssql/backup/manual_backup.bak ./backup/
```

### 3. Restore Database
```bash
# Stop application
docker-compose stop backend

# Restore database
docker exec webthanhtoan-db /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword" \
  -Q "RESTORE DATABASE [WebThanhToan] FROM DISK = N'/var/opt/mssql/backup/backup_file.bak' WITH REPLACE"

# Start application
docker-compose start backend
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. Port already in use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8080

# Kill process if needed
sudo kill -9 <PID>
```

#### 2. Database connection failed
```bash
# Check database logs
docker-compose logs database

# Verify database is running
docker exec webthanhtoan-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourPassword" -Q "SELECT 1"
```

#### 3. Out of disk space
```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Clean old backups
find /opt/backups -name "*.bak" -mtime +7 -delete
```

#### 4. Memory issues
```bash
# Check memory usage
free -h

# Check container memory usage
docker stats

# Restart services if needed
docker-compose restart
```

## 📈 Performance Optimization

### 1. Database Optimization
```sql
-- Update statistics
UPDATE STATISTICS;

-- Rebuild indexes
ALTER INDEX ALL ON [TableName] REBUILD;

-- Check query performance
SELECT TOP 10 
    total_worker_time/execution_count AS avg_cpu_time,
    total_elapsed_time/execution_count AS avg_elapsed_time,
    execution_count,
    SUBSTRING(st.text, (qs.statement_start_offset/2)+1, 
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS statement_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY total_worker_time/execution_count DESC;
```

### 2. Application Optimization
```bash
# Increase JVM heap size
export JAVA_OPTS="-Xms1g -Xmx2g -XX:+UseG1GC"

# Enable compression
# Already configured in nginx.conf

# Use Redis for caching
# Already configured in docker-compose.yml
```

## 🔐 Security Best Practices

### 1. Change Default Passwords
```bash
# Update .env file with strong passwords
# Use password generators for production
```

### 2. Network Security
```bash
# Use Docker networks (already configured)
# Implement rate limiting in nginx
# Use fail2ban for SSH protection
```

### 3. Regular Updates
```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Update system packages
sudo apt update && sudo apt upgrade
```

## 📞 Support

### Logs Location:
- Application: `/var/log/webthanhtoan/`
- Nginx: `/var/log/nginx/`
- Docker: `docker-compose logs`

### Health Check URLs:
- Frontend: `http://localhost:80`
- Backend: `http://localhost:8080/actuator/health`
- Database: `docker exec webthanhtoan-db sqlcmd -S localhost -U sa -P "password" -Q "SELECT 1"`

### Emergency Contacts:
- System Admin: [your-email]
- Developer: [dev-email]
- Database Admin: [dba-email] 