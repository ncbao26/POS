# 🌐 MixxStore POS - Production URLs & Access Guide

## 🎯 **Live System URLs**

### **🏪 Main Application (Frontend)**
```
🌐 URL: https://mixxstorepos-frontend.onrender.com
📱 Mobile: https://mixxstorepos-frontend.onrender.com (Responsive)
🔗 Status: ✅ Live
```

### **🔧 Backend API**
```
🌐 URL: https://mixxstorepos-backend.onrender.com
📊 Health: https://mixxstorepos-backend.onrender.com/actuator/health
📋 Info: https://mixxstorepos-backend.onrender.com/actuator/info
🔗 Status: ✅ Live
```

### **🗄️ Database**
```
🏢 Provider: Render PostgreSQL
🌍 Region: Singapore
🔗 Status: ✅ Connected
```

## 🔐 **Default Login Credentials**

### **👨‍💼 Admin Account**
```
Username: admin
Password: admin123
Role: Administrator
Access: Full system access
```

### **⚠️ Security Notice**
```
🔒 Change default password after first login
🔑 Create additional user accounts as needed
🛡️ Enable 2FA if available
```

## 📱 **How to Access**

### **1. Open Web Browser**
- Chrome, Firefox, Safari, Edge (recommended)
- Mobile browsers supported

### **2. Navigate to Frontend**
```
https://mixxstorepos-frontend.onrender.com
```

### **3. Login Process**
1. Enter username: `admin`
2. Enter password: `admin123`
3. Click "Login" button
4. System will redirect to dashboard

## 🎯 **Main Features Available**

### **🏪 Point of Sale**
- ✅ Product catalog browsing
- ✅ Add items to cart
- ✅ Process payments
- ✅ Print receipts
- ✅ Customer management

### **📊 Dashboard & Analytics**
- ✅ Sales overview
- ✅ Revenue charts
- ✅ Top selling products
- ✅ Daily/Monthly reports

### **📦 Inventory Management**
- ✅ Add/Edit/Delete products
- ✅ Stock level tracking
- ✅ Category management
- ✅ Price management

### **👥 Customer Management**
- ✅ Customer database
- ✅ Purchase history
- ✅ Contact information
- ✅ Loyalty tracking

### **📋 Reports**
- ✅ Sales reports
- ✅ Inventory reports
- ✅ Customer reports
- ✅ Financial summaries

## 🔧 **API Endpoints (For Developers)**

### **🔍 Health Checks**
```bash
GET https://mixxstorepos-backend.onrender.com/actuator/health
GET https://mixxstorepos-backend.onrender.com/actuator/info
```

### **🔐 Authentication**
```bash
POST https://mixxstorepos-backend.onrender.com/api/auth/login
POST https://mixxstorepos-backend.onrender.com/api/auth/register
```

### **📦 Products**
```bash
GET https://mixxstorepos-backend.onrender.com/api/products
POST https://mixxstorepos-backend.onrender.com/api/products
PUT https://mixxstorepos-backend.onrender.com/api/products/{id}
DELETE https://mixxstorepos-backend.onrender.com/api/products/{id}
```

### **👥 Customers**
```bash
GET https://mixxstorepos-backend.onrender.com/api/customers
POST https://mixxstorepos-backend.onrender.com/api/customers
PUT https://mixxstorepos-backend.onrender.com/api/customers/{id}
DELETE https://mixxstorepos-backend.onrender.com/api/customers/{id}
```

### **🧾 Invoices**
```bash
GET https://mixxstorepos-backend.onrender.com/api/invoices
POST https://mixxstorepos-backend.onrender.com/api/invoices
GET https://mixxstorepos-backend.onrender.com/api/invoices/{id}
```

## 🌍 **Browser Compatibility**

### **✅ Fully Supported**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **📱 Mobile Support**
- iOS Safari 14+
- Android Chrome 90+
- Mobile responsive design

## 🚀 **Performance Info**

### **⚡ Load Times**
- First load: ~3-5 seconds (cold start)
- Subsequent loads: ~1-2 seconds
- API responses: ~200-500ms

### **💾 Storage**
- Local storage for user preferences
- Session storage for temporary data
- No cookies required

## 🔧 **Troubleshooting**

### **❌ Cannot Access Frontend**
```bash
# Check if service is running
curl -I https://mixxstorepos-frontend.onrender.com

# Expected: HTTP 200 OK
```

### **❌ Login Issues**
```bash
# Verify credentials
Username: admin (case-sensitive)
Password: admin123 (case-sensitive)

# Check browser console for errors
F12 → Console tab
```

### **❌ API Connection Issues**
```bash
# Test backend connectivity
curl https://mixxstorepos-backend.onrender.com/actuator/health

# Expected response:
{"status":"UP","components":{"db":{"status":"UP"}}}
```

### **❌ Slow Loading**
```bash
# Render free tier limitations:
- Services sleep after 15 minutes of inactivity
- Cold start can take 30-60 seconds
- Consider upgrading to paid plan for better performance
```

## 📞 **Support & Contact**

### **🐛 Report Issues**
- GitHub Issues: [Create Issue](https://github.com/ncbao26/POS/issues)
- Email: support@mixxstore.com

### **📚 Documentation**
- README: [Project Documentation](../README.md)
- API Docs: [API Documentation](../API_DOCS.md)
- Deploy Guide: [Deployment Guide](../RENDER_DOCKER_DEPLOY.md)

### **💬 Community**
- GitHub Discussions: [Join Discussion](https://github.com/ncbao26/POS/discussions)
- Discord: [Join Server](https://discord.gg/mixxstore)

---

## 🎉 **System Status: LIVE & OPERATIONAL**

```
✅ Frontend: Running
✅ Backend: Running  
✅ Database: Connected
✅ All APIs: Functional
✅ Authentication: Working
✅ File Storage: Available

Last Updated: $(date)
Version: 1.0.0
Environment: Production
```

**🚀 Ready to use! Start managing your business with MixxStore POS!** 