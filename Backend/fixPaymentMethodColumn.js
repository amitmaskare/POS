import pool from "./src/config.js";

async function fixPaymentMethodColumn() {
  try {
    // Check current column definition
    const [columns] = await pool.promise().query(`
      SHOW COLUMNS FROM sales LIKE 'payment_method'
    `);

    console.log("Current payment_method column:", columns[0]);

    // Alter the column to accept 'credit', 'cash', 'upi' etc.
    await pool.promise().query(`
      ALTER TABLE sales
      MODIFY COLUMN payment_method VARCHAR(50) NOT NULL
    `);

    console.log("✅ Successfully updated payment_method column to VARCHAR(50)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixPaymentMethodColumn();
