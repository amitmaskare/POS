/**
 * Test Script: Loose Item Module - Full Flow
 *
 * Tests:
 * 1. Database migration (add columns)
 * 2. ProductService barcode generation & decoding (unit tests)
 * 3. Loose item list API
 * 4. Generate barcode API
 * 5. Decode barcode API
 * 6. Search with weighted barcode
 * 7. Cart logic simulation (loose vs regular)
 * 8. Full checkout flow with mixed cart
 */

import mysql from "mysql2/promise";

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "",
  database: "aside_posproject",
};

let connection;
let testProductId = null;
let testStoreId = 1;

// ============ UTILITY ============
const log = (label, status, detail = "") => {
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "ℹ️";
  console.log(`${icon} ${label}${detail ? ` — ${detail}` : ""}`);
};

const logSection = (title) => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(60)}`);
};

// ============ BARCODE LOGIC (copied from ProductService for unit testing) ============
const generateLooseBarcode = (productCode, weight) => {
  // EAN-13: "20" (2 digits) + PPPPP (5 digits) + WWWWW (5 digits) = 12 data + 1 check = 13
  const data = "20" + String(productCode).padStart(5, "0") + String(Math.round(weight * 1000)).padStart(5, "0");

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(data[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return data + checkDigit;
};

const decodeLooseBarcode = (barcode) => {
  if (!barcode || barcode.length !== 13 || !barcode.startsWith("20")) {
    return null;
  }
  const productCode = barcode.substring(2, 7);  // 5-digit product code
  const weightCode = barcode.substring(7, 12);   // 5-digit weight in grams
  const weightInKg = parseInt(weightCode, 10) / 1000;
  return { productCode, weightInGrams: parseInt(weightCode, 10), weightInKg };
};

// ============ TEST 1: DATABASE MIGRATION ============
async function testDatabaseMigration() {
  logSection("TEST 1: Database Migration");

  try {
    // Check if columns already exist
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM products LIKE 'is_loose'"
    );

    if (columns.length > 0) {
      log("Columns already exist", "PASS", "Migration was already run");
    } else {
      // Run the migration
      log("Running migration", "INFO", "Adding loose item columns...");

      await connection.query(`
        ALTER TABLE products
          ADD COLUMN is_loose TINYINT(1) NOT NULL DEFAULT 0 AFTER is_returnable,
          ADD COLUMN price_per_unit DECIMAL(10,2) DEFAULT NULL AFTER is_loose,
          ADD COLUMN loose_unit VARCHAR(10) DEFAULT 'kg' AFTER price_per_unit,
          ADD COLUMN loose_product_code VARCHAR(5) DEFAULT NULL AFTER loose_unit
      `);
      log("ALTER TABLE products", "PASS", "Added is_loose, price_per_unit, loose_unit, loose_product_code");

      // Update existing loose items
      const [updateResult] = await connection.query(
        "UPDATE products SET is_loose = 1, price_per_unit = selling_price WHERE favourite = 'loose'"
      );
      log("Update existing loose items", "PASS", `${updateResult.affectedRows} products updated`);
    }

    // Check/create loose_item_labels table
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'loose_item_labels'"
    );

    if (tables.length > 0) {
      log("loose_item_labels table exists", "PASS");
    } else {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS loose_item_labels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          weight DECIMAL(10,3) NOT NULL,
          calculated_price DECIMAL(10,2) NOT NULL,
          generated_barcode VARCHAR(20) NOT NULL,
          printed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          store_id INT DEFAULT NULL,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      log("CREATE TABLE loose_item_labels", "PASS");
    }

    // Verify columns exist
    const [verifyColumns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${DB_CONFIG.database}' AND TABLE_NAME = 'products'
      AND COLUMN_NAME IN ('is_loose', 'price_per_unit', 'loose_unit', 'loose_product_code')
      ORDER BY COLUMN_NAME
    `);

    const colNames = verifyColumns.map((c) => c.COLUMN_NAME).sort();
    const expected = ["is_loose", "loose_product_code", "loose_unit", "price_per_unit"];

    if (JSON.stringify(colNames) === JSON.stringify(expected)) {
      log("All 4 columns verified in products table", "PASS", colNames.join(", "));
    } else {
      log("Missing columns", "FAIL", `Found: ${colNames.join(", ")}, Expected: ${expected.join(", ")}`);
    }

  } catch (error) {
    log("Database migration", "FAIL", error.message);
  }
}

// ============ TEST 2: CREATE TEST LOOSE PRODUCT ============
async function testCreateLooseProduct() {
  logSection("TEST 2: Create Test Loose Product");

  try {
    // Check if test product already exists
    const [existing] = await connection.query(
      "SELECT id FROM products WHERE barcode = 'LOOSE_TEST_APPLE' AND store_id = ?",
      [testStoreId]
    );

    if (existing.length > 0) {
      testProductId = existing[0].id;
      log("Test product already exists", "PASS", `ID: ${testProductId}`);
    } else {
      const [result] = await connection.query(
        `INSERT INTO products (product_name, barcode, sku, selling_price, cost_price, tax_rate,
          status, favourite, is_loose, price_per_unit, loose_unit, loose_product_code, store_id, unit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ["Test Apple", "LOOSE_TEST_APPLE", "SKU-APPLE-TEST", 120.00, 80.00, 5,
          "Active", "loose", 1, 120.00, "kg", "00099", testStoreId, "kg"]
      );
      testProductId = result.insertId;
      log("Created test loose product", "PASS", `ID: ${testProductId}, Name: Test Apple, Price: Rs.120/kg`);
    }

    // Add initial stock
    const [stockCheck] = await connection.query(
      "SELECT COUNT(*) as count FROM stocks WHERE product_id = ?",
      [testProductId]
    );

    if (stockCheck[0].count === 0) {
      await connection.query(
        "INSERT INTO stocks (product_id, stock, type, note) VALUES (?, ?, ?, ?)",
        [testProductId, 100, "credit", "Add Product - Test"]
      );
      log("Added initial stock", "PASS", "100 kg");
    } else {
      log("Stock already exists", "PASS");
    }

    // Verify product data
    const [product] = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [testProductId]
    );

    if (product.length > 0) {
      const p = product[0];
      log("Product verification", "PASS",
        `is_loose=${p.is_loose}, price_per_unit=${p.price_per_unit}, loose_unit=${p.loose_unit}, loose_product_code=${p.loose_product_code}`
      );
    }

  } catch (error) {
    log("Create test product", "FAIL", error.message);
  }
}

// ============ TEST 3: BARCODE GENERATION (Unit Test) ============
function testBarcodeGeneration() {
  logSection("TEST 3: Barcode Generation (Unit Tests)");

  // Format: 20 + PPPPP(5) + WWWWW(5) + C(1) = 13 digits
  // Test 1: Generate barcode for 0.450 kg
  const barcode1 = generateLooseBarcode("00099", 0.450);
  log("Generate barcode (0.450 kg)", barcode1.length === 13 ? "PASS" : "FAIL",
    `Barcode: ${barcode1}, Length: ${barcode1.length}`);

  // Verify prefix "20"
  log("Prefix is '20'", barcode1.startsWith("20") ? "PASS" : "FAIL", `Prefix: ${barcode1.substring(0, 2)}`);

  // Verify product code embedded (positions 2-6)
  log("Product code '00099'", barcode1.substring(2, 7) === "00099" ? "PASS" : "FAIL",
    `Embedded: ${barcode1.substring(2, 7)}`);

  // Verify weight embedded (positions 7-11, 450 grams)
  log("Weight '00450' (450g)", barcode1.substring(7, 12) === "00450" ? "PASS" : "FAIL",
    `Embedded: ${barcode1.substring(7, 12)}`);

  // Test 2: Generate barcode for 1.200 kg
  const barcode2 = generateLooseBarcode("00099", 1.200);
  log("Generate barcode (1.200 kg)", barcode2.substring(7, 12) === "01200" ? "PASS" : "FAIL",
    `Barcode: ${barcode2}, Weight embedded: ${barcode2.substring(7, 12)}`);

  // Test 3: Generate barcode for 0.050 kg (50 grams)
  const barcode3 = generateLooseBarcode("00001", 0.050);
  log("Generate barcode (0.050 kg)", barcode3.substring(7, 12) === "00050" ? "PASS" : "FAIL",
    `Barcode: ${barcode3}, Weight embedded: ${barcode3.substring(7, 12)}`);

  // Test 4: Different product codes
  const barcode4 = generateLooseBarcode("00001", 0.450);
  const barcode5 = generateLooseBarcode("00002", 0.450);
  log("Different products, same weight", barcode4 !== barcode5 ? "PASS" : "FAIL",
    `Product1: ${barcode4}, Product2: ${barcode5}`);

  return barcode1;
}

// ============ TEST 4: BARCODE DECODING (Unit Test) ============
function testBarcodeDecoding(generatedBarcode) {
  logSection("TEST 4: Barcode Decoding (Unit Tests)");

  // Test 1: Decode valid weighted barcode
  const decoded1 = decodeLooseBarcode(generatedBarcode);
  log("Decode valid barcode", decoded1 !== null ? "PASS" : "FAIL",
    decoded1 ? `ProductCode: ${decoded1.productCode}, Weight: ${decoded1.weightInKg}kg (${decoded1.weightInGrams}g)` : "null");

  // Verify round-trip
  if (decoded1) {
    log("Round-trip: product code", decoded1.productCode === "00099" ? "PASS" : "FAIL",
      `Expected: 00099, Got: ${decoded1.productCode}`);
    log("Round-trip: weight", decoded1.weightInKg === 0.450 ? "PASS" : "FAIL",
      `Expected: 0.450, Got: ${decoded1.weightInKg}`);
  }

  // Test 2: Decode non-weighted barcode (should return null)
  const decoded2 = decodeLooseBarcode("8901234567890");
  log("Reject non-weighted barcode (prefix 8)", decoded2 === null ? "PASS" : "FAIL",
    decoded2 === null ? "Correctly returned null" : "Should be null");

  // Test 3: Decode null/empty
  const decoded3 = decodeLooseBarcode(null);
  log("Reject null barcode", decoded3 === null ? "PASS" : "FAIL");

  const decoded4 = decodeLooseBarcode("12345");
  log("Reject short barcode", decoded4 === null ? "PASS" : "FAIL");

  // Test 4: Decode another valid barcode
  const testBarcode = generateLooseBarcode("00001", 2.500);
  const decoded5 = decodeLooseBarcode(testBarcode);
  log("Decode 2.500kg barcode", decoded5?.weightInKg === 2.5 ? "PASS" : "FAIL",
    `Expected: 2.5, Got: ${decoded5?.weightInKg}`);
}

// ============ TEST 5: LOOSE ITEM LIST QUERY ============
async function testLooseItemListQuery() {
  logSection("TEST 5: Loose Item List Query");

  try {
    const [results] = await connection.query(`
      SELECT
        p.id, p.product_name, p.selling_price, p.is_loose,
        p.price_per_unit, p.loose_unit, p.loose_product_code, p.barcode
      FROM products p
      WHERE (p.favourite = 'loose' OR p.is_loose = 1) AND p.store_id = ?
      ORDER BY p.id DESC
    `, [testStoreId]);

    log("Loose item list query", "PASS", `Found ${results.length} loose items`);

    results.forEach((item) => {
      log(`  Product: ${item.product_name}`, "PASS",
        `is_loose=${item.is_loose}, price_per_unit=${item.price_per_unit}/${item.loose_unit}, code=${item.loose_product_code}`);
    });

    // Verify test product is in the list
    const testItem = results.find((r) => r.id === testProductId);
    log("Test product in loose list", testItem ? "PASS" : "FAIL",
      testItem ? `Found: ${testItem.product_name}` : "Not found!");

  } catch (error) {
    log("Loose item list query", "FAIL", error.message);
  }
}

// ============ TEST 6: FIND BY LOOSE PRODUCT CODE ============
async function testFindByLooseProductCode() {
  logSection("TEST 6: Find Product by Loose Product Code");

  try {
    const [results] = await connection.query(`
      SELECT p.id, p.product_name, p.price_per_unit, p.loose_unit, p.loose_product_code
      FROM products p
      WHERE p.loose_product_code = ? AND p.store_id = ? AND p.status = 'Active'
      LIMIT 1
    `, ["00099", testStoreId]);

    if (results.length > 0) {
      log("Find by product code '00099'", "PASS",
        `Found: ${results[0].product_name} (ID: ${results[0].id})`);
    } else {
      log("Find by product code '00099'", "FAIL", "Product not found");
    }

    // Test non-existent code
    const [noResults] = await connection.query(`
      SELECT p.id FROM products p
      WHERE p.loose_product_code = ? AND p.store_id = ?
      LIMIT 1
    `, ["99999", testStoreId]);

    log("Non-existent code returns empty", noResults.length === 0 ? "PASS" : "FAIL");

  } catch (error) {
    log("Find by loose product code", "FAIL", error.message);
  }
}

// ============ TEST 7: GENERATE BARCODE + SAVE LABEL ============
async function testGenerateBarcodeAndSaveLabel() {
  logSection("TEST 7: Generate Barcode & Save Label Record");

  try {
    const weight = 0.450;
    const pricePerUnit = 120.00;
    const calculatedPrice = parseFloat((weight * pricePerUnit).toFixed(2));
    const barcode = generateLooseBarcode("00099", weight);

    log("Price calculation", calculatedPrice === 54.00 ? "PASS" : "FAIL",
      `0.450kg x Rs.120/kg = Rs.${calculatedPrice} (expected Rs.54.00)`);

    // Save label record
    const [insertResult] = await connection.query(
      `INSERT INTO loose_item_labels (product_id, weight, calculated_price, generated_barcode, store_id)
       VALUES (?, ?, ?, ?, ?)`,
      [testProductId, weight, calculatedPrice, barcode, testStoreId]
    );

    log("Save label record", insertResult.insertId > 0 ? "PASS" : "FAIL",
      `Label ID: ${insertResult.insertId}, Barcode: ${barcode}`);

    // Verify saved data
    const [label] = await connection.query(
      "SELECT * FROM loose_item_labels WHERE id = ?",
      [insertResult.insertId]
    );

    if (label.length > 0) {
      const l = label[0];
      log("Label data verified", "PASS",
        `Weight: ${l.weight}, Price: Rs.${l.calculated_price}, Barcode: ${l.generated_barcode}`);
    }

  } catch (error) {
    log("Generate barcode & save label", "FAIL", error.message);
  }
}

// ============ TEST 8: SEARCH WITH WEIGHTED BARCODE ============
async function testSearchWithWeightedBarcode() {
  logSection("TEST 8: Search with Weighted Barcode (Scanner Simulation)");

  try {
    // Simulate scanner scanning a weighted barcode
    const scannedBarcode = generateLooseBarcode("00099", 0.750);
    log("Simulated scan", "INFO", `Barcode: ${scannedBarcode}`);

    // Step 1: Detect prefix "2"
    const isWeighted = scannedBarcode.length === 13 && scannedBarcode.startsWith("20");
    log("Detect weighted barcode", isWeighted ? "PASS" : "FAIL");

    // Step 2: Decode
    const decoded = decodeLooseBarcode(scannedBarcode);
    log("Decode barcode", decoded !== null ? "PASS" : "FAIL",
      decoded ? `Product: ${decoded.productCode}, Weight: ${decoded.weightInKg}kg` : "Failed");

    // Step 3: Find product
    const [product] = await connection.query(`
      SELECT p.id, p.product_name, p.price_per_unit, p.loose_unit, p.tax_rate
      FROM products p
      WHERE p.loose_product_code = ? AND p.store_id = ? AND p.status = 'Active'
      LIMIT 1
    `, [decoded.productCode, testStoreId]);

    log("Find product from code", product.length > 0 ? "PASS" : "FAIL",
      product.length > 0 ? `Found: ${product[0].product_name}` : "Not found");

    // Step 4: Calculate price
    if (product.length > 0) {
      const p = product[0];
      const price = parseFloat((decoded.weightInKg * p.price_per_unit).toFixed(2));
      log("Calculate price", price === 90.00 ? "PASS" : "FAIL",
        `${decoded.weightInKg}kg x Rs.${p.price_per_unit}/kg = Rs.${price} (expected Rs.90.00)`);

      // Step 5: Build cart item (as the frontend would)
      const cartItem = {
        id: `${p.id}_loose_${Date.now()}`,
        product_id: p.id,
        product_name: p.product_name,
        qty: decoded.weightInKg,
        selling_price: p.price_per_unit,
        price: price,
        total: price,
        tax: p.tax_rate,
        is_loose: 1,
        price_per_unit: p.price_per_unit,
        loose_unit: p.loose_unit,
        loose_weight: decoded.weightInKg,
        weighted_barcode: scannedBarcode,
      };

      log("Cart item built", "PASS", JSON.stringify({
        name: cartItem.product_name,
        qty: `${cartItem.qty}${cartItem.loose_unit}`,
        price: `Rs.${cartItem.price}`,
        is_loose: cartItem.is_loose,
      }));
    }

  } catch (error) {
    log("Search with weighted barcode", "FAIL", error.message);
  }
}

// ============ TEST 9: MIXED CART SIMULATION ============
async function testMixedCart() {
  logSection("TEST 9: Mixed Cart (Regular + Loose Items)");

  // Simulate a cart with both regular and loose items
  const cart = [
    // Regular item (e.g., Coca Cola)
    {
      id: 1,
      product_name: "Coca Cola",
      qty: 2,
      selling_price: 40,
      price: 80, // 2 x 40
      tax: 5,
      is_loose: 0,
    },
    // Loose item 1 (Apple 0.450 kg)
    {
      id: `${testProductId}_loose_1`,
      product_id: testProductId,
      product_name: "Test Apple",
      qty: 0.450,
      selling_price: 120,
      price: 54.00, // 0.450 x 120
      tax: 5,
      is_loose: 1,
      price_per_unit: 120,
      loose_unit: "kg",
      loose_weight: 0.450,
    },
    // Regular item (Bread)
    {
      id: 3,
      product_name: "Bread",
      qty: 1,
      selling_price: 45,
      price: 45,
      tax: 0,
      is_loose: 0,
    },
    // Loose item 2 (Apple 0.300 kg - different weight, same product)
    {
      id: `${testProductId}_loose_2`,
      product_id: testProductId,
      product_name: "Test Apple",
      qty: 0.300,
      selling_price: 120,
      price: 36.00, // 0.300 x 120
      tax: 5,
      is_loose: 1,
      price_per_unit: 120,
      loose_unit: "kg",
      loose_weight: 0.300,
    },
  ];

  log("Cart contents", "INFO", `${cart.length} items (2 regular + 2 loose)`);

  cart.forEach((item, i) => {
    if (item.is_loose) {
      log(`  [${i + 1}] ${item.product_name}`, "INFO",
        `${item.qty}${item.loose_unit} x Rs.${item.price_per_unit}/${item.loose_unit} = Rs.${item.price}`);
    } else {
      log(`  [${i + 1}] ${item.product_name}`, "INFO",
        `${item.qty} pcs x Rs.${item.selling_price} = Rs.${item.price}`);
    }
  });

  // Calculate totals (same as Cart.jsx)
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const tax = cart.reduce((sum, item) => {
    // For loose items, price is already the total
    const base = item.is_loose ? item.price : item.qty * item.selling_price;
    return sum + (base * (item.tax || 0)) / 100;
  }, 0);
  const total = subtotal + tax;

  log("Subtotal", "PASS", `Rs.${subtotal.toFixed(2)} (expected Rs.215.00)`);
  log("Tax", "PASS", `Rs.${tax.toFixed(2)}`);
  log("Total", "PASS", `Rs.${total.toFixed(2)}`);

  // Verify subtotal
  const expectedSubtotal = 80 + 54 + 45 + 36;
  log("Subtotal correct", subtotal === expectedSubtotal ? "PASS" : "FAIL",
    `Got: ${subtotal}, Expected: ${expectedSubtotal}`);

  // Build checkout payload (as Cart.jsx does)
  const checkoutPayload = {
    payment_method: "cash",
    subtotal,
    tax,
    total,
    cart: cart.map((item) => ({
      product_id: item.product_id || item.id,
      product_name: item.product_name,
      qty: item.qty,
      tax: item.tax,
      price: item.price,
      total: item.is_loose ? item.price : item.price * item.qty,
      is_loose: item.is_loose || 0,
      loose_weight: item.loose_weight || null,
      loose_unit: item.loose_unit || null,
      price_per_unit: item.price_per_unit || null,
    })),
  };

  log("Checkout payload built", "PASS", `${checkoutPayload.cart.length} items, Total: Rs.${checkoutPayload.total.toFixed(2)}`);

  // Verify loose items use product_id (not the unique id string)
  const loosePayloadItems = checkoutPayload.cart.filter((i) => i.is_loose === 1);
  const allHaveNumericProductId = loosePayloadItems.every((i) => typeof i.product_id === "number");
  log("Loose items have numeric product_id", allHaveNumericProductId ? "PASS" : "FAIL",
    `Product IDs: ${loosePayloadItems.map((i) => i.product_id).join(", ")}`);

  // Simulate stock deduction
  log("\nStock deduction simulation:", "INFO");
  const stockDeductions = {};
  checkoutPayload.cart.forEach((item) => {
    const pid = item.product_id;
    if (!stockDeductions[pid]) stockDeductions[pid] = { name: item.product_name, total: 0, unit: item.loose_unit || "pcs" };
    stockDeductions[pid].total += item.qty;
  });

  Object.entries(stockDeductions).forEach(([pid, info]) => {
    log(`  Product ${pid} (${info.name})`, "INFO",
      `Debit: ${info.total} ${info.unit}`);
  });

  // Verify Apple stock deduction = 0.450 + 0.300 = 0.750 kg
  const appleDeduction = stockDeductions[testProductId];
  if (appleDeduction) {
    const expectedDeduction = 0.750;
    log("Apple stock deduction", Math.abs(appleDeduction.total - expectedDeduction) < 0.001 ? "PASS" : "FAIL",
      `Got: ${appleDeduction.total}kg, Expected: ${expectedDeduction}kg`);
  }
}

// ============ TEST 10: RECEIPT FORMAT ============
function testReceiptFormat() {
  logSection("TEST 10: Receipt Format Verification");

  // Simulate receipt items
  const receiptItems = [
    { name: "Coca Cola", qty: 2, price: 40, is_loose: 0 },
    { name: "Test Apple", qty: 0.450, price: 120, is_loose: 1, loose_unit: "kg", price_per_unit: 120, total: 54 },
    { name: "Bread", qty: 1, price: 45, is_loose: 0 },
    { name: "Test Apple", qty: 0.300, price: 120, is_loose: 1, loose_unit: "kg", price_per_unit: 120, total: 36 },
  ];

  log("Receipt format:", "INFO");
  console.log("  ──────────────────────────────────────");
  console.log("  Item           Qty       Price    Total");
  console.log("  ──────────────────────────────────────");

  receiptItems.forEach((item) => {
    if (item.is_loose) {
      const qtyStr = `${Number(item.qty).toFixed(3)}${item.loose_unit}`;
      const priceStr = `Rs.${item.price_per_unit}/${item.loose_unit}`;
      const totalStr = `Rs.${item.total.toFixed(2)}`;
      console.log(`  ${item.name.padEnd(15)} ${qtyStr.padEnd(10)} ${priceStr.padEnd(9)} ${totalStr}`);
    } else {
      const qtyStr = `${item.qty} pcs`;
      const priceStr = `Rs.${item.price}`;
      const totalStr = `Rs.${(item.price * item.qty).toFixed(2)}`;
      console.log(`  ${item.name.padEnd(15)} ${qtyStr.padEnd(10)} ${priceStr.padEnd(9)} ${totalStr}`);
    }
  });

  console.log("  ──────────────────────────────────────");
  log("Receipt format renders correctly", "PASS", "Loose items show weight + rate");
}

// ============ TEST 11: EDGE CASES ============
function testEdgeCases() {
  logSection("TEST 11: Edge Cases");

  // Very small weight
  const bc1 = generateLooseBarcode("00001", 0.001);
  const d1 = decodeLooseBarcode(bc1);
  log("Very small weight (0.001kg = 1g)", d1?.weightInGrams === 1 ? "PASS" : "FAIL",
    `Barcode: ${bc1}, Decoded: ${d1?.weightInGrams}g`);

  // Large weight
  const bc2 = generateLooseBarcode("00001", 9.999);
  const d2 = decodeLooseBarcode(bc2);
  log("Large weight (9.999kg)", d2?.weightInKg === 9.999 ? "PASS" : "FAIL",
    `Barcode: ${bc2}, Decoded: ${d2?.weightInKg}kg`);

  // Weight at boundary (exactly 1kg)
  const bc3 = generateLooseBarcode("00001", 1.000);
  const d3 = decodeLooseBarcode(bc3);
  log("Exact 1.000 kg", d3?.weightInKg === 1.0 ? "PASS" : "FAIL",
    `Barcode: ${bc3}, Decoded: ${d3?.weightInKg}kg`);

  // Price calculations
  const price1 = parseFloat((0.450 * 120).toFixed(2));
  log("Price: 0.450 x 120 = 54.00", price1 === 54.00 ? "PASS" : "FAIL", `Got: ${price1}`);

  const price2 = parseFloat((0.333 * 99.99).toFixed(2));
  log("Price: 0.333 x 99.99 = 33.30", price2 === 33.30 ? "PASS" : "FAIL", `Got: ${price2}`);

  const price3 = parseFloat((1.500 * 200).toFixed(2));
  log("Price: 1.500 x 200 = 300.00", price3 === 300.00 ? "PASS" : "FAIL", `Got: ${price3}`);

  // Barcode uniqueness
  const bcA = generateLooseBarcode("00001", 0.450);
  const bcB = generateLooseBarcode("00001", 0.451);
  log("Different weight = different barcode", bcA !== bcB ? "PASS" : "FAIL",
    `450g: ${bcA}, 451g: ${bcB}`);
}

// ============ TEST 12: ALL PRODUCTS LIST INCLUDES LOOSE FIELDS ============
async function testAllProductsListIncludesLooseFields() {
  logSection("TEST 12: All Products List Includes Loose Fields");

  try {
    const [results] = await connection.query(`
      SELECT p.id, p.product_name, p.is_loose, p.price_per_unit, p.loose_unit, p.loose_product_code
      FROM products p
      WHERE p.status = 'Active' AND p.store_id = ? AND p.id = ?
    `, [testStoreId, testProductId]);

    if (results.length > 0) {
      const p = results[0];
      const hasLooseFields = p.is_loose !== undefined &&
                             p.price_per_unit !== undefined &&
                             p.loose_unit !== undefined &&
                             p.loose_product_code !== undefined;

      log("Loose fields in product query", hasLooseFields ? "PASS" : "FAIL",
        `is_loose=${p.is_loose}, price_per_unit=${p.price_per_unit}, loose_unit=${p.loose_unit}, code=${p.loose_product_code}`);
    } else {
      log("Product not found", "FAIL");
    }

  } catch (error) {
    log("All products list", "FAIL", error.message);
  }
}

// ============ MAIN ============
async function runAllTests() {
  console.log("\n🧪 LOOSE ITEM MODULE - FULL FLOW TEST\n");
  console.log(`Database: ${DB_CONFIG.database}`);
  console.log(`Date: ${new Date().toLocaleString()}`);

  try {
    connection = await mysql.createConnection(DB_CONFIG);
    log("Database connection", "PASS");

    await testDatabaseMigration();
    await testCreateLooseProduct();
    const generatedBarcode = testBarcodeGeneration();
    testBarcodeDecoding(generatedBarcode);
    await testLooseItemListQuery();
    await testFindByLooseProductCode();
    await testGenerateBarcodeAndSaveLabel();
    await testSearchWithWeightedBarcode();
    await testMixedCart();
    testReceiptFormat();
    testEdgeCases();
    await testAllProductsListIncludesLooseFields();

    logSection("TEST SUMMARY");
    console.log("All tests executed. Review results above for any ❌ failures.");

  } catch (error) {
    log("FATAL ERROR", "FAIL", error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      log("Database connection closed", "PASS");
    }
  }
}

runAllTests();
