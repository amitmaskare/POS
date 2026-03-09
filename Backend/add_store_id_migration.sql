-- Add store_id column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER role;

-- Update existing users with a default store_id (you should update this with actual store_ids)
-- Example: UPDATE users SET store_id = 'STORE1000' WHERE userId = 1;

-- Add store_id to all relevant tables if not already present
-- Categories
ALTER TABLE categories ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Subcategories  
ALTER TABLE subcategories ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Products
ALTER TABLE products ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Customers
ALTER TABLE customers ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Suppliers
ALTER TABLE suppliers ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Packages
ALTER TABLE packages ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Offers
ALTER TABLE offers ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Purchases
ALTER TABLE purchases ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Sales
ALTER TABLE sales ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Returns
ALTER TABLE returns ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Hold Sales
ALTER TABLE hold_sales ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Ration Cards
ALTER TABLE ration_cards ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Payments
ALTER TABLE payments ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;

-- Cards
ALTER TABLE cards ADD COLUMN store_id VARCHAR(100) DEFAULT NULL AFTER id;
