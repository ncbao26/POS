-- =============================================
-- WebThanhToan Database Creation Script
-- =============================================

-- Tạo database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WebThanhToan')
BEGIN
    CREATE DATABASE WebThanhToan;
END
GO

USE WebThanhToan;
GO

-- =============================================
-- Bảng Users - Quản lý người dùng
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        email NVARCHAR(100) NOT NULL UNIQUE,
        full_name NVARCHAR(100) NOT NULL,
        password NVARCHAR(120) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'USER',
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Tạo index
    CREATE INDEX IX_users_username ON users(username);
    CREATE INDEX IX_users_email ON users(email);
    CREATE INDEX IX_users_role ON users(role);
    
    PRINT 'Table users created successfully';
END
GO

-- =============================================
-- Bảng Products - Quản lý sản phẩm
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='products' AND xtype='U')
BEGIN
    CREATE TABLE products (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(1000),
        cost_price DECIMAL(10,2),
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Tạo index
    CREATE INDEX IX_products_name ON products(name);
    CREATE INDEX IX_products_price ON products(price);
    CREATE INDEX IX_products_stock ON products(stock);
    CREATE INDEX IX_products_is_active ON products(is_active);
    
    PRINT 'Table products created successfully';
END
GO

-- =============================================
-- Bảng Customers - Quản lý khách hàng
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='customers' AND xtype='U')
BEGIN
    CREATE TABLE customers (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        phone NVARCHAR(20),
        email NVARCHAR(100),
        address NVARCHAR(500),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Tạo index
    CREATE INDEX IX_customers_phone ON customers(phone);
    CREATE INDEX IX_customers_email ON customers(email);
    CREATE INDEX IX_customers_name ON customers(name);
    
    PRINT 'Table customers created successfully';
END
GO

-- =============================================
-- Bảng Invoices - Quản lý hóa đơn
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='invoices' AND xtype='U')
BEGIN
    CREATE TABLE invoices (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        invoice_number NVARCHAR(50) NOT NULL UNIQUE,
        customer_id BIGINT,
        user_id BIGINT NOT NULL,
        subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
        discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        payment_method NVARCHAR(50) NOT NULL DEFAULT 'CASH',
        payment_status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
        notes NVARCHAR(1000),
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    -- Tạo index
    CREATE INDEX IX_invoices_invoice_number ON invoices(invoice_number);
    CREATE INDEX IX_invoices_customer_id ON invoices(customer_id);
    CREATE INDEX IX_invoices_user_id ON invoices(user_id);
    CREATE INDEX IX_invoices_payment_status ON invoices(payment_status);
    CREATE INDEX IX_invoices_created_at ON invoices(created_at);
    
    PRINT 'Table invoices created successfully';
END
GO

-- =============================================
-- Bảng Invoice_Items - Chi tiết hóa đơn
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='invoice_items' AND xtype='U')
BEGIN
    CREATE TABLE invoice_items (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        invoice_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        total_price DECIMAL(15,2) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    
    -- Tạo index
    CREATE INDEX IX_invoice_items_invoice_id ON invoice_items(invoice_id);
    CREATE INDEX IX_invoice_items_product_id ON invoice_items(product_id);
    
    PRINT 'Table invoice_items created successfully';
END
GO

-- =============================================
-- Bảng Inventory_Transactions - Lịch sử xuất nhập kho
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='inventory_transactions' AND xtype='U')
BEGIN
    CREATE TABLE inventory_transactions (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        product_id BIGINT NOT NULL,
        transaction_type NVARCHAR(20) NOT NULL, -- IN, OUT, ADJUSTMENT
        quantity INT NOT NULL,
        previous_stock INT NOT NULL,
        new_stock INT NOT NULL,
        reference_type NVARCHAR(50), -- INVOICE, PURCHASE, ADJUSTMENT
        reference_id BIGINT,
        notes NVARCHAR(500),
        user_id BIGINT NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    -- Tạo index
    CREATE INDEX IX_inventory_transactions_product_id ON inventory_transactions(product_id);
    CREATE INDEX IX_inventory_transactions_type ON inventory_transactions(transaction_type);
    CREATE INDEX IX_inventory_transactions_created_at ON inventory_transactions(created_at);
    
    PRINT 'Table inventory_transactions created successfully';
END
GO

-- =============================================
-- Bảng Payment_Transactions - Lịch sử thanh toán
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payment_transactions' AND xtype='U')
BEGIN
    CREATE TABLE payment_transactions (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        invoice_id BIGINT NOT NULL,
        transaction_type NVARCHAR(20) NOT NULL, -- PAYMENT, REFUND
        payment_method NVARCHAR(50) NOT NULL, -- CASH, BANK_TRANSFER, CARD
        amount DECIMAL(15,2) NOT NULL,
        reference_number NVARCHAR(100),
        notes NVARCHAR(500),
        user_id BIGINT NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    -- Tạo index
    CREATE INDEX IX_payment_transactions_invoice_id ON payment_transactions(invoice_id);
    CREATE INDEX IX_payment_transactions_type ON payment_transactions(transaction_type);
    CREATE INDEX IX_payment_transactions_method ON payment_transactions(payment_method);
    CREATE INDEX IX_payment_transactions_created_at ON payment_transactions(created_at);
    
    PRINT 'Table payment_transactions created successfully';
END
GO

-- =============================================
-- Bảng System_Settings - Cài đặt hệ thống
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_settings' AND xtype='U')
BEGIN
    CREATE TABLE system_settings (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        setting_key NVARCHAR(100) NOT NULL UNIQUE,
        setting_value NVARCHAR(1000),
        setting_type NVARCHAR(50) NOT NULL DEFAULT 'STRING', -- STRING, NUMBER, BOOLEAN, JSON
        description NVARCHAR(500),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Tạo index
    CREATE INDEX IX_system_settings_key ON system_settings(setting_key);
    CREATE INDEX IX_system_settings_type ON system_settings(setting_type);
    
    PRINT 'Table system_settings created successfully';
END
GO

-- =============================================
-- Bảng Audit_Logs - Nhật ký hoạt động
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='audit_logs' AND xtype='U')
BEGIN
    CREATE TABLE audit_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id BIGINT,
        action NVARCHAR(100) NOT NULL,
        entity_type NVARCHAR(50) NOT NULL,
        entity_id BIGINT,
        old_values NVARCHAR(MAX),
        new_values NVARCHAR(MAX),
        ip_address NVARCHAR(45),
        user_agent NVARCHAR(500),
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    -- Tạo index
    CREATE INDEX IX_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IX_audit_logs_action ON audit_logs(action);
    CREATE INDEX IX_audit_logs_entity_type ON audit_logs(entity_type);
    CREATE INDEX IX_audit_logs_created_at ON audit_logs(created_at);
    
    PRINT 'Table audit_logs created successfully';
END
GO

-- =============================================
-- Triggers để tự động cập nhật updated_at
-- =============================================

-- Trigger cho bảng users
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_users_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER tr_users_updated_at
    ON users
    AFTER UPDATE
    AS
    BEGIN
        UPDATE users 
        SET updated_at = GETDATE()
        FROM users u
        INNER JOIN inserted i ON u.id = i.id
    END
    ');
    PRINT 'Trigger tr_users_updated_at created successfully';
END
GO

-- Trigger cho bảng products
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_products_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER tr_products_updated_at
    ON products
    AFTER UPDATE
    AS
    BEGIN
        UPDATE products 
        SET updated_at = GETDATE()
        FROM products p
        INNER JOIN inserted i ON p.id = i.id
    END
    ');
    PRINT 'Trigger tr_products_updated_at created successfully';
END
GO

-- Trigger cho bảng customers
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_customers_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER tr_customers_updated_at
    ON customers
    AFTER UPDATE
    AS
    BEGIN
        UPDATE customers 
        SET updated_at = GETDATE()
        FROM customers c
        INNER JOIN inserted i ON c.id = i.id
    END
    ');
    PRINT 'Trigger tr_customers_updated_at created successfully';
END
GO

-- Trigger cho bảng invoices
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_invoices_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER tr_invoices_updated_at
    ON invoices
    AFTER UPDATE
    AS
    BEGIN
        UPDATE invoices 
        SET updated_at = GETDATE()
        FROM invoices inv
        INNER JOIN inserted i ON inv.id = i.id
    END
    ');
    PRINT 'Trigger tr_invoices_updated_at created successfully';
END
GO

-- =============================================
-- Views để báo cáo
-- =============================================

-- View báo cáo doanh thu theo ngày
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vw_daily_revenue')
BEGIN
    EXEC('
    CREATE VIEW vw_daily_revenue AS
    SELECT 
        CAST(created_at AS DATE) as report_date,
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_invoice_value,
        SUM(discount_amount) as total_discount
    FROM invoices 
    WHERE payment_status = ''PAID''
    GROUP BY CAST(created_at AS DATE)
    ');
    PRINT 'View vw_daily_revenue created successfully';
END
GO

-- View báo cáo sản phẩm bán chạy
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vw_top_selling_products')
BEGIN
    EXEC('
    CREATE VIEW vw_top_selling_products AS
    SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        SUM(ii.quantity) as total_sold,
        SUM(ii.total_price) as total_revenue,
        COUNT(DISTINCT ii.invoice_id) as total_orders
    FROM products p
    INNER JOIN invoice_items ii ON p.id = ii.product_id
    INNER JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.payment_status = ''PAID''
    GROUP BY p.id, p.name, p.price, p.stock
    ');
    PRINT 'View vw_top_selling_products created successfully';
END
GO

-- View báo cáo tồn kho thấp
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vw_low_stock_products')
BEGIN
    EXEC('
    CREATE VIEW vw_low_stock_products AS
    SELECT 
        id,
        name,
        price,
        stock,
        CASE 
            WHEN stock = 0 THEN ''OUT_OF_STOCK''
            WHEN stock <= 5 THEN ''CRITICAL''
            WHEN stock <= 10 THEN ''LOW''
            ELSE ''NORMAL''
        END as stock_status
    FROM products 
    WHERE is_active = 1 AND stock <= 10
    ');
    PRINT 'View vw_low_stock_products created successfully';
END
GO

PRINT '=============================================';
PRINT 'Database WebThanhToan created successfully!';
PRINT 'All tables, indexes, triggers, and views have been created.';
PRINT '============================================='; 