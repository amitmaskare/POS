-- Fix Settings for All Stores
-- This script will insert default settings for ALL stores in your database

USE aside_posproject;

-- Insert default settings for ALL existing stores
INSERT INTO settings (store_id, setting_key, setting_value)
SELECT
    s.id as store_id,
    'project_name' as setting_key,
    'My POS System' as setting_value
FROM stores s
WHERE NOT EXISTS (
    SELECT 1 FROM settings
    WHERE store_id = s.id AND setting_key = 'project_name'
);

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'contact_number', '' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'contact_number');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'address', '' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'address');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'gst_number', '' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'gst_number');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'logo_url', '' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'logo_url');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'enable_sales_return', 'true' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'enable_sales_return');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'enable_discounts', 'true' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'enable_discounts');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'enable_multiple_payment', 'true' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'enable_multiple_payment');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'enable_stock_alerts', 'true' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'enable_stock_alerts');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'currency', 'INR' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'currency');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'thermal_printer_width', '80' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'thermal_printer_width');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'print_header', 'true' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'print_header');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'print_footer', 'true' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'print_footer');

INSERT INTO settings (store_id, setting_key, setting_value)
SELECT s.id, 'timezone', 'Asia/Kolkata' FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = s.id AND setting_key = 'timezone');

-- Show the results
SELECT 'Settings created for stores:' as message;
SELECT DISTINCT store_id, COUNT(*) as settings_count
FROM settings
GROUP BY store_id
ORDER BY store_id;
