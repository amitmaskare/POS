-- Migration: Add customer fields to sales table
-- Date: 2026-03-27
-- Description: Adds customer information fields to sales table for Aadhaar-based customer orders

ALTER TABLE `sales`
ADD COLUMN `customer_id` INT(11) DEFAULT NULL AFTER `user_id`,
ADD COLUMN `customer_name` VARCHAR(100) DEFAULT NULL AFTER `customer_id`,
ADD COLUMN `customer_phone` BIGINT(20) DEFAULT NULL AFTER `customer_name`,
ADD COLUMN `customer_aadhaar` VARCHAR(12) DEFAULT NULL AFTER `customer_phone`,
ADD INDEX `idx_customer_id` (`customer_id`),
ADD INDEX `idx_customer_phone` (`customer_phone`),
ADD INDEX `idx_customer_aadhaar` (`customer_aadhaar`);

-- Also update payment_method enum to include new payment types
ALTER TABLE `sales`
MODIFY COLUMN `payment_method` ENUM('cash','card','upi','credit','qr_code','pos_card','split','aadhaar_customer') DEFAULT NULL;

-- Note: This allows tracking which customer (verified via Aadhaar) made the purchase
-- aadhaar_customer payment method indicates payment was skipped for authenticated customer
