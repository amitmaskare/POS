import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'aside_posproject',
  multipleStatements: true
};

async function runMigration() {
  let connection;

  try {
    console.log('=========================================');
    console.log('Running Role System Migration');
    console.log('=========================================\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'update_user_filtering.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database\n');

    console.log('Executing migration...');
    await connection.query(migrationSQL);
    console.log('✓ Migration executed successfully\n');

    // Verify migration
    console.log('Verifying migration...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'aside_posproject'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'created_by'
    `);

    if (columns.length > 0) {
      console.log('✓ created_by column verified:', columns[0]);
    } else {
      console.log('⚠ Warning: created_by column not found');
    }

    // Check indexes
    const [indexes] = await connection.query(`
      SHOW INDEX FROM users WHERE Key_name IN ('idx_store_role', 'idx_created_by')
    `);

    if (indexes.length > 0) {
      console.log('✓ Indexes created:', indexes.map(i => i.Key_name).join(', '));
    }

    console.log('\n=========================================');
    console.log('Migration completed successfully!');
    console.log('=========================================\n');
    console.log('Please restart your backend server to apply changes.\n');

  } catch (error) {
    console.error('\n=========================================');
    console.error('Migration failed!');
    console.error('=========================================');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
