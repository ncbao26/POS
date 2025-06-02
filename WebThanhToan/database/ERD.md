# WebThanhToan Database - Entity Relationship Diagram

## Sơ đồ quan hệ các bảng

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │    CUSTOMERS    │       │    PRODUCTS     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ username        │       │ name            │       │ name            │
│ email           │       │ phone           │       │ description     │
│ full_name       │       │ email           │       │ price           │
│ password        │       │ address         │       │ stock           │
│ role            │       │ is_active       │       │ is_active       │
│ is_active       │       │ created_at      │       │ created_at      │
│ created_at      │       │ updated_at      │       │ updated_at      │
│ updated_at      │       └─────────────────┘       └─────────────────┘
└─────────────────┘                │                         │
         │                         │                         │
         │                         │                         │
         │                         ▼                         │
         │               ┌─────────────────┐                 │
         │               │    INVOICES     │                 │
         │               ├─────────────────┤                 │
         │               │ id (PK)         │                 │
         │               │ invoice_number  │                 │
         │               │ customer_id (FK)│◄────────────────┘
         │               │ user_id (FK)    │◄────────────────┐
         │               │ subtotal        │                 │
         │               │ discount_amount │                 │
         │               │ discount_pct    │                 │
         │               │ total_amount    │                 │
         │               │ payment_method  │                 │
         │               │ payment_status  │                 │
         │               │ notes           │                 │
         │               │ created_at      │                 │
         │               │ updated_at      │                 │
         │               └─────────────────┘                 │
         │                         │                         │
         │                         │                         │
         │                         ▼                         │
         │               ┌─────────────────┐                 │
         │               │ INVOICE_ITEMS   │                 │
         │               ├─────────────────┤                 │
         │               │ id (PK)         │                 │
         │               │ invoice_id (FK) │                 │
         │               │ product_id (FK) │◄────────────────┘
         │               │ quantity        │
         │               │ unit_price      │
         │               │ discount_amount │
         │               │ discount_pct    │
         │               │ total_price     │
         │               │ created_at      │
         │               └─────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│PAYMENT_TRANS    │       │INVENTORY_TRANS  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ invoice_id (FK) │       │ product_id (FK) │
│ transaction_type│       │ transaction_type│
│ payment_method  │       │ quantity        │
│ amount          │       │ previous_stock  │
│ reference_number│       │ new_stock       │
│ notes           │       │ reference_type  │
│ user_id (FK)    │       │ reference_id    │
│ created_at      │       │ notes           │
└─────────────────┘       │ user_id (FK)    │
                          │ created_at      │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│ SYSTEM_SETTINGS │       │   AUDIT_LOGS    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ setting_key     │       │ user_id (FK)    │
│ setting_value   │       │ action          │
│ setting_type    │       │ entity_type     │
│ description     │       │ entity_id       │
│ is_active       │       │ old_values      │
│ created_at      │       │ new_values      │
│ updated_at      │       │ ip_address      │
└─────────────────┘       │ user_agent      │
                          │ created_at      │
                          └─────────────────┘
```

## Quan hệ giữa các bảng

### 1. USERS (1) → (N) INVOICES
- Một user có thể tạo nhiều hóa đơn
- Mỗi hóa đơn phải có một user tạo

### 2. CUSTOMERS (1) → (N) INVOICES  
- Một khách hàng có thể có nhiều hóa đơn
- Hóa đơn có thể không có khách hàng (khách lẻ)

### 3. INVOICES (1) → (N) INVOICE_ITEMS
- Một hóa đơn có nhiều sản phẩm
- Mỗi item thuộc về một hóa đơn

### 4. PRODUCTS (1) → (N) INVOICE_ITEMS
- Một sản phẩm có thể xuất hiện trong nhiều hóa đơn
- Mỗi item tham chiếu đến một sản phẩm

### 5. INVOICES (1) → (N) PAYMENT_TRANSACTIONS
- Một hóa đơn có thể có nhiều giao dịch thanh toán
- Mỗi giao dịch thuộc về một hóa đơn

### 6. PRODUCTS (1) → (N) INVENTORY_TRANSACTIONS
- Một sản phẩm có nhiều giao dịch kho
- Mỗi giao dịch kho thuộc về một sản phẩm

### 7. USERS (1) → (N) AUDIT_LOGS
- Một user có nhiều log hoạt động
- Mỗi log thuộc về một user

## Indexes và Performance

### Primary Keys
- Tất cả bảng đều có `id` làm primary key
- Auto-increment BIGINT

### Foreign Keys
- `invoices.customer_id` → `customers.id`
- `invoices.user_id` → `users.id`
- `invoice_items.invoice_id` → `invoices.id`
- `invoice_items.product_id` → `products.id`
- `payment_transactions.invoice_id` → `invoices.id`
- `payment_transactions.user_id` → `users.id`
- `inventory_transactions.product_id` → `products.id`
- `inventory_transactions.user_id` → `users.id`
- `audit_logs.user_id` → `users.id`

### Search Indexes
- `users.username` (UNIQUE)
- `users.email` (UNIQUE)
- `products.name`
- `customers.phone`
- `customers.email`
- `invoices.invoice_number` (UNIQUE)
- `invoices.created_at`
- `system_settings.setting_key` (UNIQUE)

## Views cho Báo cáo

### vw_daily_revenue
```sql
SELECT 
    CAST(created_at AS DATE) as report_date,
    COUNT(*) as total_invoices,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_invoice_value,
    SUM(discount_amount) as total_discount
FROM invoices 
WHERE payment_status = 'PAID'
GROUP BY CAST(created_at AS DATE)
```

### vw_top_selling_products
```sql
SELECT 
    p.id, p.name, p.price, p.stock,
    SUM(ii.quantity) as total_sold,
    SUM(ii.total_price) as total_revenue,
    COUNT(DISTINCT ii.invoice_id) as total_orders
FROM products p
INNER JOIN invoice_items ii ON p.id = ii.product_id
INNER JOIN invoices i ON ii.invoice_id = i.id
WHERE i.payment_status = 'PAID'
GROUP BY p.id, p.name, p.price, p.stock
```

### vw_low_stock_products
```sql
SELECT 
    id, name, price, stock,
    CASE 
        WHEN stock = 0 THEN 'OUT_OF_STOCK'
        WHEN stock <= 5 THEN 'CRITICAL'
        WHEN stock <= 10 THEN 'LOW'
        ELSE 'NORMAL'
    END as stock_status
FROM products 
WHERE is_active = 1 AND stock <= 10
```

## Triggers

### Tự động cập nhật updated_at
- `tr_users_updated_at`
- `tr_products_updated_at`
- `tr_customers_updated_at`
- `tr_invoices_updated_at`

## Data Types

### Tiền tệ
- `DECIMAL(15,2)` cho tổng tiền
- `DECIMAL(10,2)` cho giá sản phẩm
- `DECIMAL(5,2)` cho phần trăm

### Text
- `NVARCHAR` cho Unicode support
- `NVARCHAR(MAX)` cho JSON data

### Dates
- `DATETIME2` cho timestamp chính xác
- `DATE` cho ngày tháng đơn giản

### Boolean
- `BIT` cho true/false values 