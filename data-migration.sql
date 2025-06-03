-- Data Migration Script for PostgreSQL
-- This script contains the data structure and sample data for the POS system

-- Create tables (PostgreSQL compatible)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost_price DECIMAL(10,2),
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    user_id BIGINT NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT REFERENCES customers(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users (passwords are BCrypt encoded for "admin123")
INSERT INTO users (username, email, full_name, password, role) VALUES
('admin', 'admin@webthanhtoan.com', 'Administrator', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'ADMIN'),
('manager', 'manager@webthanhtoan.com', 'Quản lý cửa hàng', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'USER'),
('cashier1', 'cashier1@webthanhtoan.com', 'Thu ngân 1', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'USER'),
('cashier2', 'cashier2@webthanhtoan.com', 'Thu ngân 2', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'USER'),
('mixxstore', 'mixxstore.clothing@gmail.com', 'MixxStore', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'ADMIN'),
('user1', 'user1@example.com', 'User One', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'USER'),
('user2', 'user2@example.com', 'User Two', '$2a$10$.iouYLKFIxr1KRtBEj7zDOdojA/I7InnSDJlJ2wzY8HAc42JDejxu', 'USER')
ON CONFLICT (username) DO NOTHING;

-- Insert sample products for admin user
INSERT INTO products (name, description, cost_price, price, stock, user_id) VALUES
('Laptop Dell XPS 13', 'Laptop cao cấp với màn hình 13 inch', 20000000, 25000000, 10, 1),
('iPhone 15 Pro', 'Điện thoại thông minh mới nhất của Apple', 25000000, 30000000, 5, 1),
('Samsung Galaxy S24', 'Flagship Android với camera AI', 18000000, 22000000, 8, 1),
('MacBook Air M2', 'Laptop Apple với chip M2 mạnh mẽ', 23000000, 28000000, 3, 1),
('iPad Pro 12.9', 'Máy tính bảng chuyên nghiệp', 16000000, 20000000, 7, 1),
('AirPods Pro', 'Tai nghe không dây chống ồn', 4500000, 6000000, 15, 1),
('Apple Watch Series 9', 'Đồng hồ thông minh mới nhất', 8000000, 10000000, 12, 1),
('Sony WH-1000XM5', 'Tai nghe chống ồn cao cấp', 6000000, 8000000, 6, 1),
('Nintendo Switch OLED', 'Máy chơi game cầm tay', 6500000, 8500000, 4, 1),
('Samsung 4K Monitor', 'Màn hình 27 inch 4K', 5500000, 7000000, 9, 1);

-- Insert sample customers
INSERT INTO customers (name, phone, email, address, user_id) VALUES
('Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', '123 Đường ABC, Quận 1, TP.HCM', 1),
('Trần Thị B', '0912345678', 'tranthib@email.com', '456 Đường XYZ, Quận 2, TP.HCM', 1),
('Lê Văn C', '0923456789', 'levanc@email.com', '789 Đường DEF, Quận 3, TP.HCM', 1);

-- Note: This script provides the basic structure and sample data
-- For production migration, you would need to export actual data from SQL Server
-- and convert it to PostgreSQL format 