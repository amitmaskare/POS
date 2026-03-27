-- ============================================================================
-- AADHAAR CUSTOMER FEATURE - COMPLETE DATABASE MIGRATION
-- ============================================================================
-- Date: 2026-03-27
-- Description: Complete database changes for Aadhaar-based customer identification
--              and order processing without payment gateway
--
-- Features:
-- 1. Add Aadhaar number field to customers table
-- 2. Add customer tracking fields to sales table
-- 3. Update payment methods to support aadhaar_customer type
-- 4. Add indexes for faster customer lookups
-- ============================================================================

-- ============================================================================
-- PART 1: ADD AADHAAR TO CUSTOMERS TABLE
-- ============================================================================

-- Add aadhaar_no column to customers table
ALTER TABLE `customers`
ADD COLUMN `aadhaar_no` VARCHAR(12) DEFAULT NULL COMMENT '12-digit Aadhaar number for customer identification';

-- Add index on aadhaar_no for faster searches
ALTER TABLE `customers`
ADD INDEX `idx_aadhaar_no` (`aadhaar_no`);

-- Add unique constraint to prevent duplicate Aadhaar numbers
ALTER TABLE `customers`
ADD UNIQUE KEY `unique_aadhaar` (`aadhaar_no`);

-- ============================================================================
-- PART 2: ADD CUSTOMER FIELDS TO SALES TABLE
-- ============================================================================

-- Add customer information fields to sales table
ALTER TABLE `sales`
ADD COLUMN `customer_id` INT(11) DEFAULT NULL COMMENT 'Reference to customer ID' AFTER `user_id`,
ADD COLUMN `customer_name` VARCHAR(100) DEFAULT NULL COMMENT 'Customer name snapshot at time of sale' AFTER `customer_id`,
ADD COLUMN `customer_phone` BIGINT(20) DEFAULT NULL COMMENT 'Customer phone snapshot at time of sale' AFTER `customer_name`,
ADD COLUMN `customer_aadhaar` VARCHAR(12) DEFAULT NULL COMMENT 'Customer Aadhaar snapshot at time of sale' AFTER `customer_phone`;

-- Add indexes for customer fields in sales table
ALTER TABLE `sales`
ADD INDEX `idx_customer_id` (`customer_id`),
ADD INDEX `idx_customer_phone` (`customer_phone`),
ADD INDEX `idx_customer_aadhaar` (`customer_aadhaar`);

-- ============================================================================
-- PART 3: UPDATE PAYMENT METHODS
-- ============================================================================

-- Update payment_method enum to include aadhaar_customer
ALTER TABLE `sales`
MODIFY COLUMN `payment_method` ENUM('cash','card','upi','credit','qr_code','pos_card','split','aadhaar_customer') DEFAULT NULL
COMMENT 'Payment method - aadhaar_customer indicates payment skipped for authenticated Aadhaar customer';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the migration was successful:
--
-- 1. Check customers table structure:
--    DESCRIBE customers;
--
-- 2. Check sales table structure:
--    DESCRIBE sales;
--
-- 3. Check indexes on customers:
--    SHOW INDEX FROM customers;
--
-- 4. Check indexes on sales:
--    SHOW INDEX FROM sales;
--
-- 5. Verify payment methods:
--    SHOW COLUMNS FROM sales LIKE 'payment_method';
-- ============================================================================

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
-- If you need to undo these changes, run the following:
--
-- -- Remove customer fields from sales table
-- ALTER TABLE `sales`
-- DROP INDEX `idx_customer_aadhaar`,
-- DROP INDEX `idx_customer_phone`,
-- DROP INDEX `idx_customer_id`,
-- DROP COLUMN `customer_aadhaar`,
-- DROP COLUMN `customer_phone`,
-- DROP COLUMN `customer_name`,
-- DROP COLUMN `customer_id`;
--
-- -- Remove aadhaar from customers table
-- ALTER TABLE `customers`
-- DROP INDEX `unique_aadhaar`,
-- DROP INDEX `idx_aadhaar_no`,
-- DROP COLUMN `aadhaar_no`;
--
-- -- Revert payment method enum
-- ALTER TABLE `sales`
-- MODIFY COLUMN `payment_method` ENUM('cash','card','upi','credit','qr_code','pos_card','split') DEFAULT NULL;
-- ============================================================================

-- ============================================================================
-- USAGE NOTES
-- ============================================================================
--
-- AADHAAR CUSTOMER FLOW:
-- ----------------------
-- 1. Customer visits store and provides Aadhaar number
-- 2. Staff searches customer by Aadhaar or mobile number using "Check Customer" modal
-- 3. System displays customer details (name, phone, email, address, Aadhaar)
-- 4. Staff clicks "Create Order" to begin shopping
-- 5. Products are added to cart
-- 6. When checkout is clicked, payment is automatically skipped
-- 7. Order is saved with:
--    - payment_method = 'aadhaar_customer'
--    - payment_status = 'paid' (auto-marked as paid)
--    - customer_id, customer_name, customer_phone, customer_aadhaar saved
-- 8. Receipt is printed and customer is cleared
--
-- BENEFITS:
-- ---------
-- - No payment gateway needed for trusted Aadhaar customers
-- - Customer purchase history tracked via customer_id
-- - All customer data snapshot saved with each sale
-- - Fast checkout process for regular customers
-- - Searchable by Aadhaar or mobile number
--
-- SECURITY:
-- ---------
-- - Aadhaar numbers are unique (database constraint enforced)
-- - Customer data is validated before saving
-- - All Aadhaar customer orders are automatically marked as paid
-- - Full audit trail maintained in sales table
-- ============================================================================
