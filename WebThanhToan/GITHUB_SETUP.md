# 📚 GitHub Setup Guide

## 🔧 Cách thiết lập GitHub Repository

### Option 1: Tạo Repository Mới

1. **Truy cập GitHub**
   - Đi tới [github.com](https://github.com)
   - Đăng nhập vào tài khoản của bạn

2. **Tạo Repository Mới**
   - Click "New repository" hoặc dấu "+"
   - Repository name: `POS`
   - Description: `Modern POS (Point of Sale) system built with React and Spring Boot`
   - Chọn "Public" (để Render có thể truy cập)
   - **KHÔNG** check "Initialize with README" (vì đã có code)

3. **Cập nhật Remote URL**
   ```bash
   # Thay đổi remote URL (thay YOUR_USERNAME bằng username GitHub của bạn)
   git remote set-url origin https://github.com/ncbao26/POS.git
   
   # Kiểm tra remote
   git remote -v
   
   # Push code
   git push -u origin main
   ```

### Option 2: Sử dụng Repository Khác

Nếu bạn muốn sử dụng repository với tên khác:

```bash
# Thay đổi remote URL
git remote set-url origin https://github.com/ncbao26/POS.git

# Push code
git push -u origin main
```

### Option 3: Fork Repository Hiện Tại

Nếu repository `ncbao26/POS` tồn tại nhưng bạn không có quyền:

1. **Fork Repository**
   - Truy cập `https://github.com/ncbao26/POS`
   - Click "Fork" để tạo copy về tài khoản của bạn

2. **Cập nhật Remote**
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/POS.git
   git push -u origin main
   ```

## 🚀 Sau khi Push thành công

1. **Kiểm tra Repository**
   - Truy cập repository trên GitHub
   - Đảm bảo file `render.yaml` có mặt

2. **Deploy trên Render**
   - Truy cập [Render Dashboard](https://dashboard.render.com)
   - Chọn "New" → "Blueprint"
   - Connect repository của bạn
   - Render sẽ tự động deploy

## 🔍 Troubleshooting

### Lỗi Authentication
```bash
# Nếu gặp lỗi authentication, sử dụng Personal Access Token
# 1. Tạo token tại: GitHub Settings → Developer settings → Personal access tokens
# 2. Sử dụng token thay vì password khi push
```

### Lỗi Permission
- Đảm bảo repository là "Public" hoặc bạn có quyền "Write"
- Kiểm tra username trong URL có đúng không

### Repository không tồn tại
- Tạo repository mới trên GitHub
- Hoặc kiểm tra lại tên repository

## 📝 Lưu ý

- Repository phải là **Public** để Render free tier có thể truy cập
- File `render.yaml` phải ở root directory
- Đảm bảo tất cả file cần thiết đã được commit và push 