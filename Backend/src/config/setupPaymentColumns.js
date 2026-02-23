import pool from "../config.js";

export const setupPaymentColumns = async () => {
  try {
    const connection = await pool.promise().getConnection();

    // Check if payment_method column exists
    const checkColumns = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'payments'
      AND COLUMN_NAME = 'payment_method'
    `);

    const existingColumns = checkColumns[0].map(row => row.COLUMN_NAME);

    // Add payment_method column if it doesn't exist
    if (!existingColumns.includes('payment_method')) {
      await connection.query(`
        ALTER TABLE payments
        ADD COLUMN payment_method VARCHAR(50) NULL AFTER status
      `);
      console.log('✅ Added payment_method column to payments table');
    }

    connection.release();
    console.log('✅ Payment columns setup completed');

  } catch (error) {
    console.error('❌ Error setting up payment columns:', error.message);
  }
};
