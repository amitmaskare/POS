import pool from "../config.js";

export const setupSplitPaymentColumns = async () => {
  try {
    const connection = await pool.promise().getConnection();

    // Check if columns exist, if not add them
    const checkColumns = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'sales'
      AND COLUMN_NAME IN ('cash_amount', 'online_amount', 'online_method')
    `);

    const existingColumns = checkColumns[0].map(row => row.COLUMN_NAME);

    if (!existingColumns.includes('cash_amount')) {
      await connection.query(`
        ALTER TABLE sales
        ADD COLUMN cash_amount DECIMAL(10,2) NULL AFTER payment_status
      `);
      console.log('✅ Added cash_amount column to sales table');
    }

    if (!existingColumns.includes('online_amount')) {
      await connection.query(`
        ALTER TABLE sales
        ADD COLUMN online_amount DECIMAL(10,2) NULL AFTER cash_amount
      `);
      console.log('✅ Added online_amount column to sales table');
    }

    if (!existingColumns.includes('online_method')) {
      await connection.query(`
        ALTER TABLE sales
        ADD COLUMN online_method VARCHAR(50) NULL AFTER online_amount
      `);
      console.log('✅ Added online_method column to sales table');
    }

    connection.release();
    console.log('✅ Split payment columns setup completed');

  } catch (error) {
    console.error('❌ Error setting up split payment columns:', error.message);
    throw error;
  }
};
