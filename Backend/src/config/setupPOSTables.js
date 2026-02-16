import pool from '../config.js';

// Get promise-based connection
const connection = pool.promise();

/**
 * Setup POS-related database tables
 */
export async function setupPOSTables() {
  try {
    // Create pos_config table
    const posConfigTable = `
      CREATE TABLE IF NOT EXISTS pos_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        port VARCHAR(100) NOT NULL,
        baud_rate INT DEFAULT 9600,
        terminal_id VARCHAR(50),
        merchant_id VARCHAR(50),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      )
    `;

    await connection.query(posConfigTable);
    console.log('✅ pos_config table created/verified');

    // Create pos_transactions table
    const posTransactionsTable = `
      CREATE TABLE IF NOT EXISTS pos_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT,
        user_id INT NOT NULL,
        transaction_id VARCHAR(100),
        amount DECIMAL(10, 2) NOT NULL,
        card_number VARCHAR(20),
        card_type VARCHAR(50),
        auth_code VARCHAR(50),
        status VARCHAR(20) NOT NULL,
        response_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_sale_id (sale_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `;

    await connection.query(posTransactionsTable);
    console.log('✅ pos_transactions table created/verified');

    // Add pos_transaction_id column to sales table if not exists
    const checkColumn = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'sales'
      AND COLUMN_NAME = 'pos_transaction_id'
    `;

    const [columns] = await connection.query(checkColumn);

    if (columns.length === 0) {
      const alterSalesTable = `
        ALTER TABLE sales
        ADD COLUMN pos_transaction_id VARCHAR(100) AFTER payment_status
      `;

      await connection.query(alterSalesTable);
      console.log('✅ pos_transaction_id column added to sales table');
    } else {
      console.log('✅ pos_transaction_id column already exists in sales table');
    }

    console.log('✅ All POS tables setup completed');
    return true;
  } catch (error) {
    console.error('❌ Error setting up POS tables:', error);
    throw error;
  }
}
