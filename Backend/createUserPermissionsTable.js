import pool from './src/config.js';

async function createUserPermissionsTable() {
  try {
    console.log('🔧 Creating user_permissions table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(permissionId) ON DELETE CASCADE,
        UNIQUE KEY unique_user_permission (user_id, permission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.promise().query(createTableSQL);
    console.log('✅ user_permissions table created successfully!');

    // Check if table exists
    const [tables] = await pool.promise().query("SHOW TABLES LIKE 'user_permissions'");
    if (tables.length > 0) {
      console.log('✅ Table verified: user_permissions exists');

      // Show table structure
      const [columns] = await pool.promise().query('DESCRIBE user_permissions');
      console.log('\n📋 Table Structure:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
      });
    }

    pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    pool.end();
    process.exit(1);
  }
}

createUserPermissionsTable();
