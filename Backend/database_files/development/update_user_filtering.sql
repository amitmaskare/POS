-- Update schema to support proper user filtering by role
-- This migration adds created_by field to track admin hierarchy

-- Add created_by field to users table if not exists
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `created_by` INT(11) DEFAULT NULL COMMENT 'User ID of creator (for tracking sub-admins)';

-- Add index for faster filtering
ALTER TABLE `users`
ADD INDEX IF NOT EXISTS `idx_store_role` (`store_id`, `role`),
ADD INDEX IF NOT EXISTS `idx_created_by` (`created_by`);

-- Update existing store admins to set created_by to super admin if exists
UPDATE users u1
SET created_by = (
  SELECT userId
  FROM (SELECT userId FROM users WHERE role = 0 LIMIT 1) AS super
)
WHERE u1.role = 1 AND u1.created_by IS NULL;

-- Example data structure after migration:
-- Super Admin (role=0, created_by=NULL, store_id=NULL)
-- ├── Store Admin 1 (role=1, created_by=super_admin_id, store_id='STORE1001')
-- │   ├── Sub Admin 1 (role=1, created_by=admin1_id, store_id='STORE1001')
-- │   ├── Cashier 1 (role=2, created_by=admin1_id, store_id='STORE1001')
-- │   └── Cashier 2 (role=2, created_by=sub_admin1_id, store_id='STORE1001')
-- └── Store Admin 2 (role=1, created_by=super_admin_id, store_id='STORE1002')
