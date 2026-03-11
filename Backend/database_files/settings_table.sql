-- Create settings table for managing system configuration
-- Run this SQL in your MySQL database

USE aside_posproject;

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_store_setting (store_id, setting_key),
  INDEX idx_store_id (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default settings for general configuration
INSERT INTO settings (store_id, setting_key, setting_value) VALUES
(1, 'project_name', 'My POS System'),
(1, 'contact_number', ''),
(1, 'address', ''),
(1, 'gst_number', ''),
(1, 'logo_url', ''),
(1, 'enable_sales_return', 'true'),
(1, 'enable_discounts', 'true'),
(1, 'enable_multiple_payment', 'true'),
(1, 'enable_stock_alerts', 'true'),
(1, 'currency', 'INR'),
(1, 'thermal_printer_width', '80'),
(1, 'print_header', 'true'),
(1, 'print_footer', 'true'),
(1, 'header_message', ''),
(1, 'footer_message', 'Thank you for your business!'),
(1, 'timezone', 'Asia/Kolkata')
ON DUPLICATE KEY UPDATE setting_value=setting_value;
