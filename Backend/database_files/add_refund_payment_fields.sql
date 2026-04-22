-- Migration: Add payment tracking fields for refund support
-- Stores customer payment details so refunds can be sent back to original payment source

-- 1. Add customer UPI ID to sales table (captured during QR/UPI payment)
ALTER TABLE `sales`
ADD COLUMN `customer_upi_id` VARCHAR(100) DEFAULT NULL AFTER `online_method`;

-- 2. Add refund tracking fields to returns table
ALTER TABLE `returns`
ADD COLUMN `refund_status` ENUM('pending','processing','completed','failed') DEFAULT 'pending' AFTER `refund_amount`,
ADD COLUMN `refund_razorpay_id` VARCHAR(100) DEFAULT NULL AFTER `refund_status`,
ADD COLUMN `refund_method` VARCHAR(50) DEFAULT NULL AFTER `refund_razorpay_id`;

-- 3. Add payment_method column to payments table if not exists
ALTER TABLE `payments`
ADD COLUMN `payment_method` VARCHAR(50) DEFAULT NULL AFTER `status`;

-- 4. Add index for refund lookups
ALTER TABLE `returns`
ADD INDEX `idx_refund_status` (`refund_status`);
