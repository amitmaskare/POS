import pool from './src/config.js';

// Define all permissions grouped by module
const permissionData = [
  // 1. POS SYSTEM MODULE
  { name: 'View POS', slug_url: 'view-pos' },
  { name: 'Add POS Transaction', slug_url: 'add-pos' },
  { name: 'Edit POS Transaction', slug_url: 'edit-pos' },
  { name: 'Delete POS Transaction', slug_url: 'delete-pos' },
  { name: 'List POS Transactions', slug_url: 'list-pos' },

  // 2. PRODUCTS MODULE
  { name: 'View Product', slug_url: 'view-product' },
  { name: 'Add Product', slug_url: 'add-product' },
  { name: 'Edit Product', slug_url: 'edit-product' },
  { name: 'Delete Product', slug_url: 'delete-product' },
  { name: 'List Products', slug_url: 'list-product' },

  // 3. PURCHASES MODULE
  { name: 'View Purchase', slug_url: 'view-purchase' },
  { name: 'Add Purchase', slug_url: 'add-purchase' },
  { name: 'Edit Purchase', slug_url: 'edit-purchase' },
  { name: 'Delete Purchase', slug_url: 'delete-purchase' },
  { name: 'List Purchases', slug_url: 'list-purchase' },

  // 4. RECEIVING MODULE
  { name: 'View Receiving', slug_url: 'view-receiving' },
  { name: 'Add Receiving', slug_url: 'add-receiving' },
  { name: 'Edit Receiving', slug_url: 'edit-receiving' },
  { name: 'Delete Receiving', slug_url: 'delete-receiving' },
  { name: 'List Receiving', slug_url: 'list-receiving' },

  // 5. SALES MODULE
  { name: 'View Sale', slug_url: 'view-sale' },
  { name: 'Add Sale', slug_url: 'add-sale' },
  { name: 'Edit Sale', slug_url: 'edit-sale' },
  { name: 'Delete Sale', slug_url: 'delete-sale' },
  { name: 'List Sales', slug_url: 'list-sale' },

  // 6. RETURN PRODUCT MODULE
  { name: 'View Return', slug_url: 'view-return' },
  { name: 'Add Return', slug_url: 'add-return' },
  { name: 'Edit Return', slug_url: 'edit-return' },
  { name: 'Delete Return', slug_url: 'delete-return' },
  { name: 'List Returns', slug_url: 'list-return' },

  // 7. TRANSACTIONS MODULE
  { name: 'View Transaction', slug_url: 'view-transaction' },
  { name: 'Add Transaction', slug_url: 'add-transaction' },
  { name: 'Edit Transaction', slug_url: 'edit-transaction' },
  { name: 'Delete Transaction', slug_url: 'delete-transaction' },
  { name: 'List Transactions', slug_url: 'list-transaction' },

  // 8. INVENTORY MODULE
  { name: 'View Inventory', slug_url: 'view-inventory' },
  { name: 'Add Inventory', slug_url: 'add-inventory' },
  { name: 'Edit Inventory', slug_url: 'edit-inventory' },
  { name: 'Delete Inventory', slug_url: 'delete-inventory' },
  { name: 'List Inventory', slug_url: 'list-inventory' },

  // 9. REPORTS MODULE
  { name: 'View Reports', slug_url: 'view-reports' },
  { name: 'Export Reports', slug_url: 'export-reports' },
  { name: 'List Reports', slug_url: 'list-reports' },

  // 10. CUSTOMERS MODULE
  { name: 'View Customer', slug_url: 'view-customer' },
  { name: 'Add Customer', slug_url: 'add-customer' },
  { name: 'Edit Customer', slug_url: 'edit-customer' },
  { name: 'Delete Customer', slug_url: 'delete-customer' },
  { name: 'List Customers', slug_url: 'list-customer' },

  // 11. USERS MODULE
  { name: 'View User', slug_url: 'view-user' },
  { name: 'Add User', slug_url: 'add-user' },
  { name: 'Edit User', slug_url: 'edit-user' },
  { name: 'Delete User', slug_url: 'delete-user' },
  { name: 'List Users', slug_url: 'list-user' },

  // 12. RATION CARDS MODULE
  { name: 'View Ration Card', slug_url: 'view-rationcard' },
  { name: 'Add Ration Card', slug_url: 'add-rationcard' },
  { name: 'Edit Ration Card', slug_url: 'edit-rationcard' },
  { name: 'Delete Ration Card', slug_url: 'delete-rationcard' },
  { name: 'List Ration Cards', slug_url: 'list-rationcard' },

  // 13. OFFERS MODULE
  { name: 'View Offer', slug_url: 'view-offer' },
  { name: 'Add Offer', slug_url: 'add-offer' },
  { name: 'Edit Offer', slug_url: 'edit-offer' },
  { name: 'Delete Offer', slug_url: 'delete-offer' },
  { name: 'List Offers', slug_url: 'list-offer' },

  // 14. ROLE MODULE
  { name: 'View Role', slug_url: 'view-role' },
  { name: 'Add Role', slug_url: 'add-role' },
  { name: 'Edit Role', slug_url: 'edit-role' },
  { name: 'Delete Role', slug_url: 'delete-role' },
  { name: 'List Roles', slug_url: 'list-role' },

  // 15. PERMISSION MODULE
  { name: 'View Permission', slug_url: 'view-permission' },
  { name: 'Add Permission', slug_url: 'add-permission' },
  { name: 'Edit Permission', slug_url: 'edit-permission' },
  { name: 'Delete Permission', slug_url: 'delete-permission' },
  { name: 'List Permissions', slug_url: 'list-permission' },

  // 16. ROLE PERMISSION MODULE
  { name: 'View Role Permission', slug_url: 'view-rolepermission' },
  { name: 'Manage Role Permission', slug_url: 'manage-rolepermission' },
  { name: 'List Role Permissions', slug_url: 'list-rolepermission' },
];

async function seedPermissions() {
  try {
    console.log('🌱 Starting permission seeding...');
    console.log(`📊 Total permissions to insert: ${permissionData.length}\n`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const perm of permissionData) {
      try {
        await pool.promise().query(
          'INSERT INTO permissions (name, slug_url, created_at) VALUES (?, ?, NOW())',
          [perm.name, perm.slug_url]
        );
        console.log(`✅ Inserted: ${perm.name} (${perm.slug_url})`);
        insertedCount++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Skipped (exists): ${perm.name}`);
          skippedCount++;
        } else {
          console.error(`❌ Error inserting ${perm.name}:`, error.message);
        }
      }
    }

    // Count total permissions
    const [result] = await pool.promise().query('SELECT COUNT(*) as total FROM permissions');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Permission seeding completed!');
    console.log(`📊 Total permissions in database: ${result[0].total}`);
    console.log(`✨ Newly inserted: ${insertedCount}`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount}`);
    console.log('='.repeat(50));

    pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    pool.end();
    process.exit(1);
  }
}

seedPermissions();
