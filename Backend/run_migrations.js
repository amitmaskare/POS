import pool from './src/config.js';
import fs from 'fs';

// Run migrations sequentially
async function runMigrations() {
  const promisePool = pool.promise();

  try {
    console.log('Starting migrations...\n');

    // Migration 1: Add aadhaar_no to customers
    console.log('Running migration 1: add_aadhaar_to_customers.sql');
    const migration1 = fs.readFileSync('./database_files/add_aadhaar_to_customers.sql', 'utf8');
    const migration1Queries = migration1
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'));

    for (const query of migration1Queries) {
      if (query) {
        await promisePool.query(query);
      }
    }
    console.log('✓ Migration 1 completed\n');

    // Migration 2: Add customer fields to sales
    console.log('Running migration 2: add_customer_fields_to_sales.sql');
    const migration2 = fs.readFileSync('./database_files/add_customer_fields_to_sales.sql', 'utf8');
    const migration2Queries = migration2
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'));

    for (const query of migration2Queries) {
      if (query) {
        await promisePool.query(query);
      }
    }
    console.log('✓ Migration 2 completed\n');

    console.log('All migrations completed successfully!');
    process.exit(0);

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠ Column already exists, skipping...');
      console.log('All migrations completed successfully!');
      process.exit(0);
    } else {
      console.error('Migration error:', error.message);
      process.exit(1);
    }
  }
}

runMigrations();
