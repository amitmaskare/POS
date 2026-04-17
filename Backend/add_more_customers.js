import pool from './src/config.js';

async function addMoreCustomers() {
  const promisePool = pool.promise();

  try {
    console.log('Adding additional test customers...\n');

    const newCustomers = [
      {
        name: 'Anita Desai',
        email: 'anita.desai@example.com',
        phone: 9123456789,
        aadhaar_no: '678901234567',
        address: '45 Lake View Apartments, Pune, Maharashtra'
      },
      {
        name: 'Karthik Menon',
        email: 'karthik.menon@example.com',
        phone: 9234567890,
        aadhaar_no: '789012345678',
        address: '12 Marine Drive, Kochi, Kerala'
      },
      {
        name: 'Deepa Nair',
        email: 'deepa.nair@example.com',
        phone: 9345678901,
        aadhaar_no: '890123456789',
        address: '78 Residency Road, Chennai, Tamil Nadu'
      }
    ];

    for (const customer of newCustomers) {
      // Check if customer already exists
      const [existing] = await promisePool.query(
        'SELECT id FROM customers WHERE phone = ? OR aadhaar_no = ?',
        [customer.phone, customer.aadhaar_no]
      );

      if (existing.length > 0) {
        console.log(`⚠ Customer ${customer.name} already exists (ID: ${existing[0].id}), skipping...`);
        continue;
      }

      // Insert customer
      const [result] = await promisePool.query(
        `INSERT INTO customers (name, email, phone, aadhaar_no, address, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [customer.name, customer.email, customer.phone, customer.aadhaar_no, customer.address]
      );

      console.log(`✓ Added: ${customer.name}`);
      console.log(`  ID: ${result.insertId}`);
      console.log(`  Phone: ${customer.phone}`);
      console.log(`  Aadhaar: ${customer.aadhaar_no}`);
      console.log(`  Email: ${customer.email}\n`);
    }

    // Show all customers
    console.log('\n=== ALL CUSTOMERS IN DATABASE ===');
    const [allCustomers] = await promisePool.query(
      'SELECT id, name, phone, aadhaar_no, email, address FROM customers ORDER BY id'
    );

    console.table(allCustomers);

    console.log('\n✅ Database Ready for Testing!');
    console.log('\n📱 Test Phone Numbers:');
    allCustomers.forEach(c => {
      console.log(`   ${c.phone} → ${c.name}`);
    });

    console.log('\n🆔 Test Aadhaar Numbers:');
    allCustomers.forEach(c => {
      console.log(`   ${c.aadhaar_no} → ${c.name}`);
    });

    console.log('\n🎯 Quick Test Cases:');
    console.log('1. Search by phone: 9876543210 → Should find Rajesh Kumar');
    console.log('2. Search by Aadhaar: 234567890123 → Should find Priya Sharma');
    console.log('3. Search by phone: 9123456789 → Should find Anita Desai');
    console.log('4. Search by Aadhaar: 789012345678 → Should find Karthik Menon');

    process.exit(0);

  } catch (error) {
    console.error('Error adding customers:', error.message);
    process.exit(1);
  }
}

addMoreCustomers();
