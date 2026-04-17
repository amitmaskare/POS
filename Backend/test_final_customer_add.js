import { CustomerController } from './src/controllers/CustomerController.js';
import pool from './src/config.js';

async function testFinalCustomerAdd() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  FINAL TEST: Customer Add (Simulating Frontend)      ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    // Get user
    const [users] = await pool.promise().query('SELECT userId FROM users LIMIT 1');
    const userId = users[0].userId;

    // Test 1: Add customer WITHOUT id field (like frontend will send)
    console.log('TEST 1: Add Customer WITHOUT id field');
    console.log('─'.repeat(55));

    const customerData = {
      name: 'Final Test Customer',
      email: `final_test_${Date.now()}@example.com`,
      phone: `91${Date.now().toString().slice(-8)}`,
      aadhaar_no: `${Date.now().toString().slice(-12)}`,
      address: 'Final Test Address, Mumbai'
    };

    console.log('Data being sent (NO id field):');
    console.log(JSON.stringify(customerData, null, 2));

    const req = {
      body: customerData,
      user: { userId: userId }
    };

    let responseData = null;
    let statusCode = null;
    const resp = {
      status: (code) => {
        statusCode = code;
        return {
          send: (data) => {
            responseData = data;
            return data;
          }
        };
      }
    };

    await CustomerController.add(req, resp);

    console.log('\nResponse Status:', statusCode);
    console.log('Response:', JSON.stringify(responseData, null, 2));

    if (statusCode === 201 && responseData.status === true) {
      console.log('\n✅ SUCCESS: Customer added without errors!');
      console.log(`   Customer ID: ${responseData.data}\n`);

      // Verify in database
      const [saved] = await pool.promise().query(
        'SELECT * FROM customers WHERE email = ?',
        [customerData.email]
      );

      if (saved.length > 0) {
        console.log('✅ VERIFIED: Customer exists in database');
        console.table([{
          ID: saved[0].id,
          Name: saved[0].name,
          Email: saved[0].email,
          Phone: saved[0].phone,
          Aadhaar: saved[0].aadhaar_no
        }]);
      }
    } else {
      console.log('\n❌ FAILED:', responseData.message);
    }

    // Test 2: Add customer WITH empty id field (old way - should also work now)
    console.log('\n\nTEST 2: Add Customer WITH empty id field (should be ignored)');
    console.log('─'.repeat(55));

    const customerWithEmptyId = {
      id: "", // Empty string - should be ignored by backend
      name: 'Test Customer With Empty ID',
      email: `empty_id_${Date.now()}@example.com`,
      phone: `92${Date.now().toString().slice(-8)}`,
      aadhaar_no: `${Date.now().toString().slice(-12)}`,
      address: 'Test Address'
    };

    console.log('Data being sent (WITH empty id):');
    console.log(JSON.stringify(customerWithEmptyId, null, 2));

    const req2 = {
      body: customerWithEmptyId,
      user: { userId: userId }
    };

    let response2 = null;
    let status2 = null;
    const resp2 = {
      status: (code) => {
        status2 = code;
        return {
          send: (data) => {
            response2 = data;
            return data;
          }
        };
      }
    };

    await CustomerController.add(req2, resp2);

    console.log('\nResponse Status:', status2);
    console.log('Response:', JSON.stringify(response2, null, 2));

    if (status2 === 201 && response2.status === true) {
      console.log('\n✅ SUCCESS: Empty id was handled correctly!');
      console.log(`   Customer ID: ${response2.data}\n`);
    } else {
      console.log('\n❌ FAILED:', response2.message);
      console.log('   This means empty id is still causing issues\n');
    }

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                   TEST COMPLETE                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    if (statusCode === 201 && status2 === 201) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Customer add works WITHOUT id field');
      console.log('✅ Customer add works WITH empty id field');
      console.log('\n📝 Frontend fix applied:');
      console.log('   - Removed id from data when adding new customer');
      console.log('   - Using: const { id, ...customerData } = form;');
      console.log('\n🚀 NOW RESTART YOUR BACKEND AND TEST IN BROWSER!\n');
    } else {
      console.log('❌ Some tests failed - check errors above\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testFinalCustomerAdd();
