import pool from './src/config.js';

async function verifySchema() {
  const promisePool = pool.promise();

  try {
    console.log('Checking database schema...\n');

    // Check customers table structure
    console.log('=== CUSTOMERS TABLE ===');
    const [customerColumns] = await promisePool.query('DESCRIBE customers');
    console.table(customerColumns);

    // Check if aadhaar_no exists
    const hasAadhaar = customerColumns.some(col => col.Field === 'aadhaar_no');

    if (!hasAadhaar) {
      console.log('\n⚠ aadhaar_no column NOT found! Adding it now...');
      await promisePool.query(`
        ALTER TABLE customers
        ADD COLUMN aadhaar_no VARCHAR(12) DEFAULT NULL AFTER phone,
        ADD INDEX idx_aadhaar_no (aadhaar_no)
      `);
      console.log('✓ aadhaar_no column added successfully!');
    } else {
      console.log('\n✓ aadhaar_no column exists!');
    }

    // Check sales table structure
    console.log('\n=== SALES TABLE ===');
    const [salesColumns] = await promisePool.query('DESCRIBE sales');
    console.table(salesColumns);

    const hasCustomerId = salesColumns.some(col => col.Field === 'customer_id');

    if (!hasCustomerId) {
      console.log('\n⚠ Customer fields NOT found in sales table! Adding them now...');
      await promisePool.query(`
        ALTER TABLE sales
        ADD COLUMN customer_id INT(11) DEFAULT NULL AFTER user_id,
        ADD COLUMN customer_name VARCHAR(100) DEFAULT NULL AFTER customer_id,
        ADD COLUMN customer_phone BIGINT(20) DEFAULT NULL AFTER customer_name,
        ADD COLUMN customer_aadhaar VARCHAR(12) DEFAULT NULL AFTER customer_phone,
        ADD INDEX idx_customer_id (customer_id),
        ADD INDEX idx_customer_phone (customer_phone),
        ADD INDEX idx_customer_aadhaar (customer_aadhaar)
      `);
      console.log('✓ Customer fields added to sales table!');
    } else {
      console.log('\n✓ Customer fields exist in sales table!');
    }

    // Update payment_method enum
    console.log('\n⚠ Updating payment_method enum...');
    try {
      await promisePool.query(`
        ALTER TABLE sales
        MODIFY COLUMN payment_method ENUM('cash','card','upi','credit','qr_code','pos_card','split','aadhaar_customer') DEFAULT NULL
      `);
      console.log('✓ payment_method enum updated!');
    } catch (error) {
      if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
        console.log('⚠ Some existing values need to be updated first');
      } else {
        console.log('⚠ Error updating enum:', error.message);
      }
    }

    console.log('\n✓ Schema verification complete!');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifySchema();
