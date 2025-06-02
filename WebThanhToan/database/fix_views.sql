-- =============================================
-- Fix Views with correct column names
-- =============================================

USE WebThanhToan;
GO

-- Drop and recreate top_selling_products_view with correct column names
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
    SUM(ii.total_price) as total_revenue,
    SUM(ii.quantity * ISNULL(p.cost_price, 0)) as total_cost,
    SUM(ii.total_price) - SUM(ii.quantity * ISNULL(p.cost_price, 0)) as total_profit
FROM products p
INNER JOIN invoice_items ii ON p.id = ii.product_id
INNER JOIN invoices i ON ii.invoice_id = i.id
WHERE i.payment_status = 'PAID'
GROUP BY p.id, p.name, p.price, p.cost_price;
GO

PRINT 'Views fixed successfully!';
GO 