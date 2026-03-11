-- =====================================================
-- SUPER ADMIN AND DEVICE BINDING MIGRATION
-- =====================================================
-- This migration adds:
-- 1. Super Admin role (role = 0)
-- 2. Device binding fields for counter users
-- 3. Counter limit field for stores
-- 4. Session tracking for device logout
-- =====================================================

-- Step 1: Add device binding columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS device_id VARCHAR(255) DEFAULT NULL COMMENT 'Cross-platform device identifier: Windows GUID, MAC Address, Linux Machine ID, or Browser Fingerprint',
ADD COLUMN IF NOT EXISTS device_locked TINYINT(1) DEFAULT 0 COMMENT '1 = device locked, 0 = not locked',
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP NULL DEFAULT NULL COMMENT 'First login timestamp when device was bound',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Last login timestamp';

-- Step 2: Add counter_limit to stores table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS counter_limit INT DEFAULT 5 COMMENT 'Maximum number of counter users admin can create';

-- Step 3: Update existing stores to have default counter limit
UPDATE stores SET counter_limit = 5 WHERE counter_limit IS NULL;

-- Step 4: Create Super Admin role in roles table
-- First, clean up any existing super_admin roles
DELETE FROM roles WHERE name = 'super_admin';

-- Temporarily allow explicit roleId = 0
SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- Insert super_admin with roleId = 0
INSERT INTO roles (roleId, name, created_at, updated_at)
VALUES (0, 'super_admin', NOW(), NOW());

-- Reset sql_mode
SET SESSION sql_mode = DEFAULT;

-- Step 5: Update role comments for clarity
-- Note: Users table role field:
-- 0 = Super Admin (global admin)
-- 1 = Store Admin (can manage one store and create counter users)
-- 2 = Counter User/Cashier (device-locked)
-- 3 = Manager (optional, not device-locked)

-- Step 6: Create active_sessions table for tracking logged-in users (for immediate logout)
CREATE TABLE IF NOT EXISTS active_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  device_id VARCHAR(255) DEFAULT NULL,
  login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active TINYINT(1) DEFAULT 1 COMMENT '1 = active, 0 = logged out/invalidated',
  FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_token (token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 7: Create Super Admin user with default credentials
-- Password: SuperAdmin@123 (hashed with bcrypt)
INSERT INTO users (userId, user_id, name, email, password, role, store_id, device_locked, created_at, updated_at)
VALUES (
  999,
  9999,
  'Super Admin',
  'superadmin@pos.com',
  '$2b$10$Hf3A15EJrQk0my63TDJYueuYXXqTG4nUZPXhjsjdJmy4OPZ21nKBK',
  0,
  NULL,
  0,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  name = 'Super Admin',
  email = 'superadmin@pos.com',
  role = 0;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_device_locked ON users(device_locked);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Update the Super Admin password hash after running migration
-- 2. Test login with Super Admin credentials
-- 3. Update AuthService.js to handle device binding logic
-- =====================================================
