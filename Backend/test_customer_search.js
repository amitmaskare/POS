import pool from './src/config.js';

async function testCustomerSearch() {
  const promisePool = pool.promise();

  try {
    console.log('=== TESTING CUSTOMER SEARCH FUNCTIONALITY ===\n');

    // Test 1: Search by Phone Number
    console.log('Test 1: Search by Phone Number (9876543210)');
    const [phoneResults] = await promisePool.query(
      'SELECT * FROM customers WHERE phone = ?',
      [9876543210]
    );

    if (phoneResults.length > 0) {
      console.log('✓ PASS: Customer found by phone');
      console.log('  Customer:', phoneResults[0].name);
      console.log('  Aadhaar:', phoneResults[0].aadhaar_no);
    } else {
      console.log('✗ FAIL: Customer not found by phone');
    }

    console.log('\n');

    // Test 2: Search by Aadhaar Number
    console.log('Test 2: Search by Aadhaar Number (123456789012)');
    const [aadhaarResults] = await promisePool.query(
      'SELECT * FROM customers WHERE aadhaar_no = ?',
      ['123456789012']
    );

    if (aadhaarResults.length > 0) {
      console.log('✓ PASS: Customer found by Aadhaar');
      console.log('  Customer:', aadhaarResults[0].name);
      console.log('  Phone:', aadhaarResults[0].phone);
    } else {
      console.log('✗ FAIL: Customer not found by Aadhaar');
    }

    console.log('\n');

    // Test 3: Verify Uniqueness - Duplicate Phone
    console.log('Test 3: Test Duplicate Phone (should fail)');
    try {
      await promisePool.query(
        `INSERT INTO customers (name, email, phone, aadhaar_no, address, created_at, updated_at)
         VALUES ('Duplicate', 'dup@test.com', 9876543210, '999999999999', 'Test', NOW(), NOW())`
      );
      console.log('✗ FAIL: Duplicate phone was allowed (this should not happen)');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('✓ PASS: Duplicate phone correctly rejected');
      } else {
        console.log('⚠ Unexpected error:', error.message);
      }
    }

    console.log('\n');

    // Test 4: Verify Uniqueness - Duplicate Aadhaar
    console.log('Test 4: Test Duplicate Aadhaar (should fail)');
    try {
      await promisePool.query(
        `INSERT INTO customers (name, email, phone, aadhaar_no, address, created_at, updated_at)
         VALUES ('Duplicate', 'dup2@test.com', 9999999999, '123456789012', 'Test', NOW(), NOW())`
      );
      console.log('✗ FAIL: Duplicate Aadhaar was allowed (this should not happen)');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('✓ PASS: Duplicate Aadhaar correctly rejected');
      } else {
        console.log('⚠ Unexpected error:', error.message);
      }
    }

    console.log('\n');

    // Test 5: List all customers (simulating API call)
    console.log('Test 5: List All Customers (API Simulation)');
    const [allCustomers] = await promisePool.query(
      'SELECT id, name, email, phone, aadhaar_no, address FROM customers ORDER BY id DESC'
    );

    if (allCustomers.length > 0) {
      console.log(`✓ PASS: Found ${allCustomers.length} customers`);
      console.log('\nCustomer List:');
      console.table(allCustomers);
    } else {
      console.log('✗ FAIL: No customers found');
    }

    console.log('\n');

    // Test 6: Verify Sales Table Schema
    console.log('Test 6: Verify Sales Table Has Customer Fields');
    const [salesColumns] = await promisePool.query('DESCRIBE sales');
    const customerFields = ['customer_id', 'customer_name', 'customer_phone', 'customer_aadhaar'];
    const hasAllFields = customerFields.every(field =>
      salesColumns.some(col => col.Field === field)
    );

    if (hasAllFields) {
      console.log('✓ PASS: Sales table has all customer fields');
      const customerCols = salesColumns.filter(col => col.Field.startsWith('customer_'));
      console.table(customerCols);
    } else {
      console.log('✗ FAIL: Sales table missing customer fields');
    }

    console.log('\n=== TEST SUMMARY ===');
    console.log('All database tests completed!');
    console.log('\nReady to test frontend:');
    console.log('1. Start the backend: cd Backend && npm start');
    console.log('2. Start the frontend: cd Frontend && npm start');
    console.log('3. Login to POS system');
    console.log('4. Click "Check Customer" button');
    console.log('5. Search by phone: 9876543210');
    console.log('6. Or search by Aadhaar: 123456789012');
    console.log('7. Add items to cart');
    console.log('8. Complete order (should skip payment)');

    process.exit(0);

  } catch (error) {
    console.error('Test error:', error.message);
    process.exit(1);
  }
}

testCustomerSearch();
