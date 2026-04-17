-- Migration: Add loose item fields to products table
-- Date: 2026-04-13
-- Description: Adds columns needed for loose/weight-based item selling

ALTER TABLE products
  ADD COLUMN is_loose TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = loose/weight-based item, 0 = regular item' AFTER is_returnable,
  ADD COLUMN price_per_unit DECIMAL(10,2) DEFAULT NULL COMMENT 'Price per unit (per kg, per gram, per liter etc.)' AFTER is_loose,
  ADD COLUMN loose_unit VARCHAR(10) DEFAULT 'kg' COMMENT 'Unit of measurement: kg, g, liter, ml' AFTER price_per_unit,
  ADD COLUMN loose_product_code VARCHAR(5) DEFAULT NULL COMMENT '5-digit code used in weighted barcode (EAN-13 prefix 2)' AFTER loose_unit;

-- Update existing loose items (favourite='loose') to set is_loose = 1 and price_per_unit = selling_price
UPDATE products SET is_loose = 1, price_per_unit = selling_price WHERE favourite = 'loose';

-- Create table to track printed loose item labels
CREATE TABLE IF NOT EXISTS loose_item_labels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  weight DECIMAL(10,3) NOT NULL COMMENT 'Weight in the unit specified on product',
  calculated_price DECIMAL(10,2) NOT NULL COMMENT 'Calculated price = weight * price_per_unit',
  generated_barcode VARCHAR(20) NOT NULL COMMENT 'Generated EAN-13 weighted barcode',
  printed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  store_id VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
