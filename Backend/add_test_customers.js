import pool from './src/config.js';

async function addTestCustomers() {
  const promisePool = pool.promise();

  try {
    console.log('Adding test customers with Aadhaar numbers...\n');

    const testCustomers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: 9876543210,
        aadhaar_no: '123456789012',
        address: '123 MG Road, Bangalore, Karnataka'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: 9876543211,
        aadhaar_no: '234567890123',
        address: '456 Park Street, Mumbai, Maharashtra'
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: 9876543212,
        aadhaar_no: '345678901234',
        address: '789 Gandhi Nagar, Ahmedabad, Gujarat'
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        phone: 9876543213,
        aadhaar_no: '456789012345',
        address: '101 Tech Park, Hyderabad, Telangana'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: 9876543214,
        aadhaar_no: '567890123456',
        address: '202 Civil Lines, Delhi'
      }
    ];

    for (const customer of testCustomers) {
      // Check if customer already exists
      const [existing] = await promisePool.query(
        'SELECT id FROM customers WHERE phone = ? OR aadhaar_no = ?',
        [customer.phone, customer.aadhaar_no]
      );

      if (existing.length > 0) {
        console.log(`⚠ Customer ${customer.name} already exists, skipping...`);
        continue;
      }

      // Insert customer
      const [result] = await promisePool.query(
        `INSERT INTO customers (name, email, phone, aadhaar_no, address, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [customer.name, customer.email, customer.phone, customer.aadhaar_no, customer.address]
      );

      console.log(`✓ Added: ${customer.name}`);
      console.log(`  Phone: ${customer.phone}`);
      console.log(`  Aadhaar: ${customer.aadhaar_no}`);
      console.log(`  Email: ${customer.email}\n`);
    }

    // Show all customers
    console.log('\n=== All Customers ===');
    const [allCustomers] = await promisePool.query(
      'SELECT id, name, phone, aadhaar_no, email FROM customers ORDER BY id DESC LIMIT 10'
    );

    console.table(allCustomers);

    console.log('\n✓ Test customers added successfully!');
    console.log('\nYou can now test the Check Customer feature with:');
    console.log('- Search by phone: 9876543210, 9876543211, etc.');
    console.log('- Search by Aadhaar: 123456789012, 234567890123, etc.\n');

    process.exit(0);

  } catch (error) {
    console.error('Error adding test customers:', error.message);
    process.exit(1);
  }
}

addTestCustomers();
