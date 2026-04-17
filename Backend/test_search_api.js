// Test script for searchProductList API
const axios = require('axios');

const API_URL = 'http://localhost:5000';

// You need to replace this with a valid token from your login
const TOKEN = 'YOUR_TOKEN_HERE';

async function testSearchAPI() {
  console.log('Testing Search Product List API...\n');

  // Test cases
  const searches = [
    '807545452148',  // Full barcode
    '8075',          // Partial barcode
    'Coca',          // Product name
    'Cola',          // Partial product name
  ];

  for (const search of searches) {
    console.log(`\n--- Testing search: "${search}" ---`);

    try {
      const response = await axios.post(
        `${API_URL}/product/searchProductList`,
        { search: search },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Status:', response.data.status);
      console.log('Message:', response.data.message);
      console.log('Results found:', response.data.data ? response.data.data.length : 0);

      if (response.data.data && response.data.data.length > 0) {
        console.log('\nProducts:');
        response.data.data.forEach((product, index) => {
          console.log(`${index + 1}. ${product.product_name}`);
          console.log(`   Barcode: ${product.barcode || 'N/A'}`);
          console.log(`   SKU: ${product.sku || 'N/A'}`);
          console.log(`   Price: ₹${product.selling_price}`);
          console.log(`   Stock: ${product.stock}`);
        });
      }

    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

// Instructions
console.log('='.repeat(60));
console.log('SEARCH API TEST SCRIPT');
console.log('='.repeat(60));
console.log('\nBefore running this script:');
console.log('1. Make sure the backend server is running');
console.log('2. Login to get a valid token');
console.log('3. Replace TOKEN variable with your actual token');
console.log('4. Run: node test_search_api.js\n');
console.log('='.repeat(60));

// Uncomment the line below after adding your token
// testSearchAPI();
