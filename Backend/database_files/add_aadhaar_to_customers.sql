-- Migration: Add aadhaar_no field to customers table
-- Date: 2026-03-27
-- Description: Adds aadhaar_no column to customers table for Aadhaar-based customer identification

ALTER TABLE `customers`
ADD COLUMN `aadhaar_no` VARCHAR(12) DEFAULT NULL AFTER `phone`,
ADD INDEX `idx_aadhaar_no` (`aadhaar_no`);

-- Note: aadhaar_no is VARCHAR(12) to store 12-digit Aadhaar numbers
-- Index added for faster lookups when searching by Aadhaar number
