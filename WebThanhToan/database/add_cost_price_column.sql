-- =============================================
-- Migration: Add cost_price column to products and invoice_items tables
-- =============================================

USE WebThanhToan;
GO

-- Add cost_price column to products table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'cost_price')
BEGIN
    ALTER TABLE products ADD cost_price DECIMAL(10,2);
    PRINT 'Added cost_price column to products table';
END
ELSE
BEGIN
    PRINT 'cost_price column already exists in products table';
END
GO

-- Add cost_price column to invoice_items table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('invoice_items') AND name = 'cost_price')
BEGIN
    ALTER TABLE invoice_items ADD cost_price DECIMAL(10,2);
    PRINT 'Added cost_price column to invoice_items table';
END
ELSE
BEGIN
    PRINT 'cost_price column already exists in invoice_items table';
END
GO

-- Update existing products with sample cost prices (80% of selling price)
UPDATE products 
SET cost_price = ROUND(price * 0.8, 0)
WHERE cost_price IS NULL;

PRINT 'Updated existing products with cost prices';
GO

-- Update the top_selling_products_view to include cost_price
IF EXISTS (SELECT * FROM sys.views WHERE name = 'top_selling_products_view')
BEGIN
    DROP VIEW top_selling_products_view;
END
GO

CREATE VIEW top_selling_products_view AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.cost_price,
    SUM(ii.quantity) as total_sold,
    SUM(ii.line_total) as total_revenue,
    SUM(ii.quantity * ISNULL(p.cost_price, 0)) as total_cost,
    SUM(ii.line_total) - SUM(ii.quantity * ISNULL(p.cost_price, 0)) as total_profit
FROM products p
INNER JOIN invoice_items ii ON p.id = ii.product_id
INNER JOIN invoices i ON ii.invoice_id = i.id
WHERE i.payment_status = 'PAID'
GROUP BY p.id, p.name, p.price, p.cost_price;
GO

-- Update the low_stock_view to include cost_price
IF EXISTS (SELECT * FROM sys.views WHERE name = 'low_stock_view')
BEGIN
    DROP VIEW low_stock_view;
END
GO

CREATE VIEW low_stock_view AS
SELECT 
    id, name, price, cost_price, stock,
    CASE 
        WHEN stock = 0 THEN 'OUT_OF_STOCK'
        WHEN stock <= 5 THEN 'CRITICAL'
        WHEN stock <= 10 THEN 'LOW'
        ELSE 'NORMAL'
    END as stock_status
FROM products 
WHERE is_active = 1 AND stock <= 10;
GO

PRINT 'Migration completed successfully!';
PRINT 'Added cost_price columns and updated views';
GO 