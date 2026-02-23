import pool from "../config.js";

export const setupReturnSplitPaymentColumns = async () => {
  try {
    const connection = await pool.promise().getConnection();

    // Check if columns exist, if not add them
    const checkColumns = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'returns'
      AND COLUMN_NAME IN ('payment_method', 'cash_amount', 'online_amount', 'online_method')
    `);

    const existingColumns = checkColumns[0].map(row => row.COLUMN_NAME);

    // Add payment_method column if it doesn't exist
    if (!existingColumns.includes('payment_method')) {
      await connection.query(`
        ALTER TABLE returns
        ADD COLUMN payment_method VARCHAR(50) NULL DEFAULT 'cash' AFTER return_type
      `);
      console.log('✅ Added payment_method column to returns table');
    }

    if (!existingColumns.includes('cash_amount')) {
      await connection.query(`
        ALTER TABLE returns
        ADD COLUMN cash_amount DECIMAL(10,2) NULL AFTER payment_method
      `);
      console.log('✅ Added cash_amount column to returns table');
    }

    if (!existingColumns.includes('online_amount')) {
      await connection.query(`
        ALTER TABLE returns
        ADD COLUMN online_amount DECIMAL(10,2) NULL AFTER cash_amount
      `);
      console.log('✅ Added online_amount column to returns table');
    }

    if (!existingColumns.includes('online_method')) {
      await connection.query(`
        ALTER TABLE returns
        ADD COLUMN online_method VARCHAR(50) NULL AFTER online_amount
      `);
      console.log('✅ Added online_method column to returns table');
    }

    connection.release();
    console.log('✅ Return split payment columns setup completed');

  } catch (error) {
    console.error('❌ Error setting up return split payment columns:', error.message);
  }
};
