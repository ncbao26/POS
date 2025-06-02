-- =============================================
-- WebThanhToan Sample Data Insert Script
-- =============================================

USE WebThanhToan;
GO

-- =============================================
-- Insert Sample Users
-- =============================================
IF NOT EXISTS (SELECT * FROM users WHERE username = 'admin')
BEGIN
    INSERT INTO users (username, email, full_name, password, role, is_active) VALUES
    ('admin', 'admin@webthanhtoan.com', 'Administrator', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'ADMIN', 1),
    ('manager', 'manager@webthanhtoan.com', 'Quản lý cửa hàng', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'USER', 1),
    ('cashier1', 'cashier1@webthanhtoan.com', 'Thu ngân 1', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'USER', 1),
    ('cashier2', 'cashier2@webthanhtoan.com', 'Thu ngân 2', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'USER', 1);
    
    PRINT 'Sample users inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Users already exist, skipping user insertion.';
END
GO

-- =============================================
-- Insert Sample Products
-- =============================================
IF NOT EXISTS (SELECT * FROM products WHERE name = 'Laptop Dell XPS 13')
BEGIN
    INSERT INTO products (name, description, cost_price, price, stock, is_active) VALUES
    ('Laptop Dell XPS 13', 'Laptop cao cấp với màn hình 13 inch, chip Intel Core i7, RAM 16GB, SSD 512GB', 20000000.00, 25000000.00, 10, 1),
    ('iPhone 15 Pro', 'Điện thoại thông minh mới nhất của Apple với chip A17 Pro, camera 48MP', 25000000.00, 30000000.00, 5, 1),
    ('Samsung Galaxy S24', 'Flagship Android với camera AI, màn hình Dynamic AMOLED 6.2 inch', 18000000.00, 22000000.00, 8, 1),
    ('MacBook Air M2', 'Laptop Apple với chip M2 mạnh mẽ, màn hình Retina 13.6 inch', 23000000.00, 28000000.00, 3, 1),
    ('iPad Pro 12.9', 'Máy tính bảng chuyên nghiệp với chip M2, màn hình Liquid Retina XDR', 16000000.00, 20000000.00, 7, 1),
    ('AirPods Pro', 'Tai nghe không dây chống ồn chủ động, chip H2', 4500000.00, 6000000.00, 15, 1),
    ('Apple Watch Series 9', 'Đồng hồ thông minh với chip S9, màn hình Always-On Retina', 8000000.00, 10000000.00, 12, 1),
    ('Sony WH-1000XM5', 'Tai nghe chống ồn cao cấp với thời lượng pin 30 giờ', 6000000.00, 8000000.00, 6, 1),
    ('Nintendo Switch OLED', 'Máy chơi game cầm tay với màn hình OLED 7 inch', 6500000.00, 8500000.00, 4, 1),
    ('Samsung 4K Monitor', 'Màn hình 27 inch 4K UHD với HDR10+', 5500000.00, 7000000.00, 9, 1),
    ('Logitech MX Master 3', 'Chuột không dây cao cấp cho productivity', 1800000.00, 2500000.00, 20, 1),
    ('Keychron K2', 'Bàn phím cơ không dây với switch Gateron', 2200000.00, 3000000.00, 15, 1),
    ('Canon EOS R6', 'Máy ảnh mirrorless full-frame với video 4K', 35000000.00, 45000000.00, 2, 1),
    ('Sony Alpha A7 IV', 'Máy ảnh mirrorless 33MP với khả năng quay video 4K', 40000000.00, 50000000.00, 1, 1),
    ('Bose QuietComfort 45', 'Tai nghe chống ồn với thời lượng pin 24 giờ', 5500000.00, 7500000.00, 8, 1),
    ('Razer DeathAdder V3', 'Chuột gaming với sensor Focus Pro 30K', 1300000.00, 1800000.00, 25, 1),
    ('SteelSeries Arctis 7', 'Tai nghe gaming không dây với âm thanh surround', 3200000.00, 4500000.00, 12, 1),
    ('ASUS ROG Strix RTX 4070', 'Card đồ họa gaming cao cấp với ray tracing', 15000000.00, 20000000.00, 3, 1),
    ('Corsair K95 RGB', 'Bàn phím cơ gaming với đèn RGB và macro keys', 3500000.00, 4800000.00, 8, 1),
    ('LG UltraWide 34"', 'Màn hình cong 34 inch UltraWide cho gaming và làm việc', 8000000.00, 12000000.00, 5, 1);
    
    PRINT 'Sample products inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Products already exist, skipping product insertion.';
END
GO

-- =============================================
-- Insert Sample Customers
-- =============================================
IF NOT EXISTS (SELECT * FROM customers WHERE phone = '0123456789')
BEGIN
    INSERT INTO customers (name, phone, email, address, is_active) VALUES
    ('Nguyễn Văn An', '0123456789', 'nguyenvanan@email.com', '123 Đường ABC, Quận 1, TP.HCM', 1),
    ('Trần Thị Bình', '0987654321', 'tranthibinh@email.com', '456 Đường DEF, Quận 2, TP.HCM', 1),
    ('Lê Hoàng Cường', '0369852147', 'lehoangcuong@email.com', '789 Đường GHI, Quận 3, TP.HCM', 1),
    ('Phạm Thị Dung', '0741258963', 'phamthidung@email.com', '321 Đường JKL, Quận 4, TP.HCM', 1),
    ('Hoàng Văn Em', '0852963741', 'hoangvanem@email.com', '654 Đường MNO, Quận 5, TP.HCM', 1),
    ('Vũ Thị Phương', '0159753486', 'vuthiphuong@email.com', '987 Đường PQR, Quận 6, TP.HCM', 1),
    ('Đặng Văn Giang', '0486159753', 'dangvangiang@email.com', '147 Đường STU, Quận 7, TP.HCM', 1),
    ('Bùi Thị Hoa', '0753159486', 'buithihoa@email.com', '258 Đường VWX, Quận 8, TP.HCM', 1),
    ('Ngô Văn Inh', '0357159486', 'ngovaninh@email.com', '369 Đường YZ, Quận 9, TP.HCM', 1),
    ('Lý Thị Kim', '0951357486', 'lythikim@email.com', '741 Đường ABC, Quận 10, TP.HCM', 1);
    
    PRINT 'Sample customers inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Customers already exist, skipping customer insertion.';
END
GO

-- =============================================
-- Insert Sample Invoices
-- =============================================
IF NOT EXISTS (SELECT * FROM invoices WHERE invoice_number = 'INV-2024-001')
BEGIN
    -- Lấy user_id của admin
    DECLARE @admin_user_id BIGINT = (SELECT id FROM users WHERE username = 'admin');
    DECLARE @customer1_id BIGINT = (SELECT id FROM customers WHERE phone = '0123456789');
    DECLARE @customer2_id BIGINT = (SELECT id FROM customers WHERE phone = '0987654321');
    DECLARE @customer3_id BIGINT = (SELECT id FROM customers WHERE phone = '0369852147');
    
    -- Insert 3 hóa đơn chi tiết
    INSERT INTO invoices (invoice_number, customer_id, user_id, subtotal, discount_amount, total_amount, payment_method, payment_status, notes) VALUES
    ('INV-2024-001', @customer1_id, @admin_user_id, 55000000.00, 2000000.00, 53000000.00, 'CASH', 'PAID', 'Khách hàng VIP - Giảm giá đặc biệt'),
    ('INV-2024-002', @customer2_id, @admin_user_id, 28000000.00, 0.00, 28000000.00, 'CARD', 'PAID', 'Thanh toán thẻ tín dụng'),
    ('INV-2024-003', @customer3_id, @admin_user_id, 14500000.00, 500000.00, 14000000.00, 'TRANSFER', 'PAID', 'Chuyển khoản ngân hàng');
    
    -- Lấy ID của các hóa đơn vừa tạo
    DECLARE @invoice1_id BIGINT = (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-001');
    DECLARE @invoice2_id BIGINT = (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-002');
    DECLARE @invoice3_id BIGINT = (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-003');
    
    -- Chi tiết hóa đơn 1: Laptop Dell XPS 13 (2 cái) + iPhone 15 Pro (1 cái)
    INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, discount_amount, total_price) VALUES
    (@invoice1_id, 1, 2, 25000000.00, 0.00, 50000000.00),
    (@invoice1_id, 2, 1, 30000000.00, 5000000.00, 25000000.00);
    
    -- Chi tiết hóa đơn 2: MacBook Air M2 (1 cái)
    INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, discount_amount, total_price) VALUES
    (@invoice2_id, 4, 1, 28000000.00, 0.00, 28000000.00);
    
    -- Chi tiết hóa đơn 3: AirPods Pro (2 cái) + Apple Watch Series 9 (1 cái) - Giảm giá 5%
    INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, discount_amount, total_price) VALUES
    (@invoice3_id, 6, 2, 6000000.00, 600000.00, 11400000.00),
    (@invoice3_id, 7, 1, 10000000.00, 500000.00, 9500000.00);
    
    PRINT 'Sample invoices and invoice items inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Invoices already exist, skipping invoice insertion.';
END
GO

-- =============================================
-- Insert Additional Sample Invoices (30 hóa đơn)
-- =============================================
IF NOT EXISTS (SELECT * FROM invoices WHERE invoice_number = 'INV-2024-004')
BEGIN
    DECLARE @admin_id BIGINT = (SELECT id FROM users WHERE username = 'admin');
    DECLARE @manager_id BIGINT = (SELECT id FROM users WHERE username = 'manager');
    
    -- Insert 30 hóa đơn với dữ liệu ngẫu nhiên
    INSERT INTO invoices (invoice_number, customer_id, user_id, subtotal, discount_amount, total_amount, payment_method, payment_status, created_at) VALUES
    ('INV-2024-004', NULL, @admin_id, 15000000.00, 0.00, 15000000.00, 'CASH', 'PAID', DATEADD(day, -30, GETDATE())),
    ('INV-2024-005', NULL, @manager_id, 8500000.00, 500000.00, 8000000.00, 'CARD', 'PAID', DATEADD(day, -29, GETDATE())),
    ('INV-2024-006', NULL, @admin_id, 22000000.00, 1000000.00, 21000000.00, 'TRANSFER', 'PAID', DATEADD(day, -28, GETDATE())),
    ('INV-2024-007', NULL, @manager_id, 6000000.00, 0.00, 6000000.00, 'CASH', 'PAID', DATEADD(day, -27, GETDATE())),
    ('INV-2024-008', NULL, @admin_id, 45000000.00, 2000000.00, 43000000.00, 'CARD', 'PAID', DATEADD(day, -26, GETDATE())),
    ('INV-2024-009', NULL, @manager_id, 12000000.00, 0.00, 12000000.00, 'CASH', 'PAID', DATEADD(day, -25, GETDATE())),
    ('INV-2024-010', NULL, @admin_id, 28000000.00, 1500000.00, 26500000.00, 'TRANSFER', 'PAID', DATEADD(day, -24, GETDATE())),
    ('INV-2024-011', NULL, @manager_id, 7500000.00, 0.00, 7500000.00, 'CASH', 'PAID', DATEADD(day, -23, GETDATE())),
    ('INV-2024-012', NULL, @admin_id, 20000000.00, 1000000.00, 19000000.00, 'CARD', 'PAID', DATEADD(day, -22, GETDATE())),
    ('INV-2024-013', NULL, @manager_id, 10000000.00, 0.00, 10000000.00, 'CASH', 'PAID', DATEADD(day, -21, GETDATE())),
    ('INV-2024-014', NULL, @admin_id, 35000000.00, 2500000.00, 32500000.00, 'TRANSFER', 'PAID', DATEADD(day, -20, GETDATE())),
    ('INV-2024-015', NULL, @manager_id, 8000000.00, 0.00, 8000000.00, 'CASH', 'PAID', DATEADD(day, -19, GETDATE())),
    ('INV-2024-016', NULL, @admin_id, 25000000.00, 1200000.00, 23800000.00, 'CARD', 'PAID', DATEADD(day, -18, GETDATE())),
    ('INV-2024-017', NULL, @manager_id, 6500000.00, 0.00, 6500000.00, 'CASH', 'PAID', DATEADD(day, -17, GETDATE())),
    ('INV-2024-018', NULL, @admin_id, 50000000.00, 3000000.00, 47000000.00, 'TRANSFER', 'PAID', DATEADD(day, -16, GETDATE())),
    ('INV-2024-019', NULL, @manager_id, 14000000.00, 500000.00, 13500000.00, 'CASH', 'PAID', DATEADD(day, -15, GETDATE())),
    ('INV-2024-020', NULL, @admin_id, 18000000.00, 800000.00, 17200000.00, 'CARD', 'PAID', DATEADD(day, -14, GETDATE())),
    ('INV-2024-021', NULL, @manager_id, 9000000.00, 0.00, 9000000.00, 'CASH', 'PAID', DATEADD(day, -13, GETDATE())),
    ('INV-2024-022', NULL, @admin_id, 30000000.00, 1800000.00, 28200000.00, 'TRANSFER', 'PAID', DATEADD(day, -12, GETDATE())),
    ('INV-2024-023', NULL, @manager_id, 11000000.00, 0.00, 11000000.00, 'CASH', 'PAID', DATEADD(day, -11, GETDATE())),
    ('INV-2024-024', NULL, @admin_id, 22000000.00, 1100000.00, 20900000.00, 'CARD', 'PAID', DATEADD(day, -10, GETDATE())),
    ('INV-2024-025', NULL, @manager_id, 7000000.00, 0.00, 7000000.00, 'CASH', 'PAID', DATEADD(day, -9, GETDATE())),
    ('INV-2024-026', NULL, @admin_id, 40000000.00, 2200000.00, 37800000.00, 'TRANSFER', 'PAID', DATEADD(day, -8, GETDATE())),
    ('INV-2024-027', NULL, @manager_id, 13000000.00, 600000.00, 12400000.00, 'CASH', 'PAID', DATEADD(day, -7, GETDATE())),
    ('INV-2024-028', NULL, @admin_id, 16000000.00, 700000.00, 15300000.00, 'CARD', 'PAID', DATEADD(day, -6, GETDATE())),
    ('INV-2024-029', NULL, @manager_id, 8500000.00, 0.00, 8500000.00, 'CASH', 'PAID', DATEADD(day, -5, GETDATE())),
    ('INV-2024-030', NULL, @admin_id, 32000000.00, 1600000.00, 30400000.00, 'TRANSFER', 'PAID', DATEADD(day, -4, GETDATE())),
    ('INV-2024-031', NULL, @manager_id, 12500000.00, 0.00, 12500000.00, 'CASH', 'PAID', DATEADD(day, -3, GETDATE())),
    ('INV-2024-032', NULL, @admin_id, 19000000.00, 900000.00, 18100000.00, 'CARD', 'PAID', DATEADD(day, -2, GETDATE())),
    ('INV-2024-033', NULL, @manager_id, 10500000.00, 0.00, 10500000.00, 'CASH', 'PAID', DATEADD(day, -1, GETDATE()));
    
    PRINT 'Additional 30 sample invoices inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Additional invoices already exist, skipping insertion.';
END
GO

-- =============================================
-- Insert Recent Invoices with Customers for Testing
-- =============================================
IF NOT EXISTS (SELECT * FROM invoices WHERE invoice_number = 'INV-2024-034')
BEGIN
    DECLARE @admin_user BIGINT = (SELECT id FROM users WHERE username = 'admin');
    DECLARE @cust1 BIGINT = (SELECT id FROM customers WHERE phone = '0123456789');
    DECLARE @cust2 BIGINT = (SELECT id FROM customers WHERE phone = '0987654321');
    DECLARE @cust3 BIGINT = (SELECT id FROM customers WHERE phone = '0369852147');
    DECLARE @cust4 BIGINT = (SELECT id FROM customers WHERE phone = '0741258963');
    DECLARE @cust5 BIGINT = (SELECT id FROM customers WHERE phone = '0852963741');
    
    -- Insert recent invoices with customers (last 7 days)
    INSERT INTO invoices (invoice_number, customer_id, user_id, subtotal, discount_amount, total_amount, payment_method, payment_status, created_at) VALUES
    ('INV-2024-034', @cust1, @admin_user, 25000000.00, 1000000.00, 24000000.00, 'CASH', 'PAID', DATEADD(hour, -2, GETDATE())),
    ('INV-2024-035', @cust2, @admin_user, 30000000.00, 0.00, 30000000.00, 'CARD', 'PAID', DATEADD(hour, -5, GETDATE())),
    ('INV-2024-036', NULL, @admin_user, 6000000.00, 0.00, 6000000.00, 'CASH', 'PAID', DATEADD(hour, -8, GETDATE())),
    ('INV-2024-037', @cust3, @admin_user, 22000000.00, 1500000.00, 20500000.00, 'TRANSFER', 'PAID', DATEADD(hour, -12, GETDATE())),
    ('INV-2024-038', @cust4, @admin_user, 10000000.00, 500000.00, 9500000.00, 'CASH', 'PAID', DATEADD(hour, -18, GETDATE())),
    ('INV-2024-039', NULL, @admin_user, 8000000.00, 0.00, 8000000.00, 'CARD', 'PAID', DATEADD(day, -1, GETDATE())),
    ('INV-2024-040', @cust5, @admin_user, 45000000.00, 2000000.00, 43000000.00, 'TRANSFER', 'PAID', DATEADD(day, -2, GETDATE())),
    ('INV-2024-041', @cust1, @admin_user, 12000000.00, 0.00, 12000000.00, 'CASH', 'PAID', DATEADD(day, -3, GETDATE())),
    ('INV-2024-042', @cust2, @admin_user, 18000000.00, 800000.00, 17200000.00, 'CARD', 'PAID', DATEADD(day, -4, GETDATE())),
    ('INV-2024-043', @cust3, @admin_user, 35000000.00, 1800000.00, 33200000.00, 'TRANSFER', 'PAID', DATEADD(day, -5, GETDATE()));
    
    PRINT 'Recent invoices with customers inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Recent invoices already exist, skipping insertion.';
END
GO

-- =============================================
-- Insert System Settings
-- =============================================
IF NOT EXISTS (SELECT * FROM system_settings WHERE setting_key = 'company_name')
BEGIN
    INSERT INTO system_settings (setting_key, setting_value, description, setting_type) VALUES
    ('company_name', 'WebThanhToan Store', 'Tên công ty hiển thị trên hóa đơn', 'STRING'),
    ('company_address', '123 Đường ABC, Quận 1, TP.HCM', 'Địa chỉ công ty', 'STRING'),
    ('company_phone', '028-1234-5678', 'Số điện thoại công ty', 'STRING'),
    ('company_email', 'info@webthanhtoan.com', 'Email công ty', 'STRING'),
    ('tax_rate', '10', 'Thuế VAT (%)', 'NUMBER'),
    ('currency', 'VND', 'Đơn vị tiền tệ', 'STRING'),
    ('invoice_prefix', 'INV', 'Tiền tố số hóa đơn', 'STRING'),
    ('low_stock_threshold', '10', 'Ngưỡng cảnh báo hàng tồn kho thấp', 'NUMBER'),
    ('backup_frequency', 'DAILY', 'Tần suất sao lưu dữ liệu', 'STRING'),
    ('session_timeout', '3600', 'Thời gian hết hạn phiên đăng nhập (giây)', 'NUMBER');
    
    PRINT 'System settings inserted successfully!';
END
ELSE
BEGIN
    PRINT 'System settings already exist, skipping insertion.';
END
GO

PRINT '==============================================';
PRINT 'Sample data insertion completed successfully!';
PRINT '==============================================';
PRINT 'Users: 4 accounts (admin/admin123, manager/admin123, cashier1/admin123, cashier2/admin123)';
PRINT 'Products: 20 technology products with cost prices and profit margins';
PRINT 'Customers: 10 customers with complete information';
PRINT 'Invoices: 33 invoices (3 detailed + 30 historical)';
PRINT 'System Settings: 10 configuration entries';
PRINT '==============================================';
GO 