-- ==========================================
-- COMPREHENSIVE PERMISSIONS FOR POS SYSTEM
-- ==========================================
-- This script creates all module-wise permissions
-- Format: {action}-{module}
-- Actions: view, add, edit, delete, list

-- Clear existing permissions if needed
-- TRUNCATE TABLE permissions;
-- TRUNCATE TABLE role_permissions;

-- ==========================================
-- 1. POS SYSTEM MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View POS', 'view-pos', NOW()),
('Add POS Transaction', 'add-pos', NOW()),
('Edit POS Transaction', 'edit-pos', NOW()),
('Delete POS Transaction', 'delete-pos', NOW()),
('List POS Transactions', 'list-pos', NOW());

-- ==========================================
-- 2. PRODUCTS MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Product', 'view-product', NOW()),
('Add Product', 'add-product', NOW()),
('Edit Product', 'edit-product', NOW()),
('Delete Product', 'delete-product', NOW()),
('List Products', 'list-product', NOW());

-- ==========================================
-- 3. PURCHASES MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Purchase', 'view-purchase', NOW()),
('Add Purchase', 'add-purchase', NOW()),
('Edit Purchase', 'edit-purchase', NOW()),
('Delete Purchase', 'delete-purchase', NOW()),
('List Purchases', 'list-purchase', NOW());

-- ==========================================
-- 4. RECEIVING MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Receiving', 'view-receiving', NOW()),
('Add Receiving', 'add-receiving', NOW()),
('Edit Receiving', 'edit-receiving', NOW()),
('Delete Receiving', 'delete-receiving', NOW()),
('List Receiving', 'list-receiving', NOW());

-- ==========================================
-- 5. SALES MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Sale', 'view-sale', NOW()),
('Add Sale', 'add-sale', NOW()),
('Edit Sale', 'edit-sale', NOW()),
('Delete Sale', 'delete-sale', NOW()),
('List Sales', 'list-sale', NOW());

-- ==========================================
-- 6. RETURN PRODUCT MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Return', 'view-return', NOW()),
('Add Return', 'add-return', NOW()),
('Edit Return', 'edit-return', NOW()),
('Delete Return', 'delete-return', NOW()),
('List Returns', 'list-return', NOW());

-- ==========================================
-- 7. TRANSACTIONS MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Transaction', 'view-transaction', NOW()),
('Add Transaction', 'add-transaction', NOW()),
('Edit Transaction', 'edit-transaction', NOW()),
('Delete Transaction', 'delete-transaction', NOW()),
('List Transactions', 'list-transaction', NOW());

-- ==========================================
-- 8. INVENTORY MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Inventory', 'view-inventory', NOW()),
('Add Inventory', 'add-inventory', NOW()),
('Edit Inventory', 'edit-inventory', NOW()),
('Delete Inventory', 'delete-inventory', NOW()),
('List Inventory', 'list-inventory', NOW());

-- ==========================================
-- 9. REPORTS MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Reports', 'view-reports', NOW()),
('Export Reports', 'export-reports', NOW()),
('List Reports', 'list-reports', NOW());

-- ==========================================
-- 10. CUSTOMERS MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Customer', 'view-customer', NOW()),
('Add Customer', 'add-customer', NOW()),
('Edit Customer', 'edit-customer', NOW()),
('Delete Customer', 'delete-customer', NOW()),
('List Customers', 'list-customer', NOW());

-- ==========================================
-- 11. USERS MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View User', 'view-user', NOW()),
('Add User', 'add-user', NOW()),
('Edit User', 'edit-user', NOW()),
('Delete User', 'delete-user', NOW()),
('List Users', 'list-user', NOW());

-- ==========================================
-- 12. RATION CARDS MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Ration Card', 'view-rationcard', NOW()),
('Add Ration Card', 'add-rationcard', NOW()),
('Edit Ration Card', 'edit-rationcard', NOW()),
('Delete Ration Card', 'delete-rationcard', NOW()),
('List Ration Cards', 'list-rationcard', NOW());

-- ==========================================
-- 13. OFFERS MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Offer', 'view-offer', NOW()),
('Add Offer', 'add-offer', NOW()),
('Edit Offer', 'edit-offer', NOW()),
('Delete Offer', 'delete-offer', NOW()),
('List Offers', 'list-offer', NOW());

-- ==========================================
-- 14. ROLE MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Role', 'view-role', NOW()),
('Add Role', 'add-role', NOW()),
('Edit Role', 'edit-role', NOW()),
('Delete Role', 'delete-role', NOW()),
('List Roles', 'list-role', NOW());

-- ==========================================
-- 15. PERMISSION MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Permission', 'view-permission', NOW()),
('Add Permission', 'add-permission', NOW()),
('Edit Permission', 'edit-permission', NOW()),
('Delete Permission', 'delete-permission', NOW()),
('List Permissions', 'list-permission', NOW());

-- ==========================================
-- 16. ROLE PERMISSION MODULE
-- ==========================================
INSERT INTO permissions (name, slug_url, created_at) VALUES
('View Role Permission', 'view-rolepermission', NOW()),
('Manage Role Permission', 'manage-rolepermission', NOW()),
('List Role Permissions', 'list-rolepermission', NOW());

-- ==========================================
-- VERIFICATION QUERY
-- ==========================================
-- SELECT COUNT(*) as total_permissions FROM permissions;
-- SELECT * FROM permissions ORDER BY permissionId;
