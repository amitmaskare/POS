-- Fix sales table to support all payment methods and split payments
-- Run this SQL migration to fix the payment mode issues

-- 1. Modify payment_method ENUM to include all payment types
ALTER TABLE `sales`
MODIFY COLUMN `payment_method` ENUM('cash', 'card', 'upi', 'credit', 'qr_code', 'pos_card', 'split') DEFAULT NULL;

-- 2. Add columns for split payment tracking
ALTER TABLE `sales`
ADD COLUMN `cash_amount` DECIMAL(10,2) DEFAULT NULL AFTER `total`,
ADD COLUMN `online_amount` DECIMAL(10,2) DEFAULT NULL AFTER `cash_amount`,
ADD COLUMN `online_method` ENUM('qr_code', 'pos_card', 'credit') DEFAULT NULL AFTER `online_amount`;

-- 3. Add store_id column if not exists (for multi-tenant support)
ALTER TABLE `sales`
ADD COLUMN `store_id` VARCHAR(100) DEFAULT NULL AFTER `user_id`;

-- 4. Add index for better performance
ALTER TABLE `sales`
ADD INDEX `idx_payment_method` (`payment_method`),
ADD INDEX `idx_store_id` (`store_id`);

-- Verify the changes
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'sales'
AND TABLE_SCHEMA = DATABASE();
