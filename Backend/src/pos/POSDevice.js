/**
 * Base POS Device Interface
 * This abstract class defines the common interface for all POS devices
 */
export class POSDevice {
  constructor(config) {
    this.config = config;
    this.isConnected = false;
    this.deviceInfo = null;
  }

  /**
   * Connect to the POS device
   * @returns {Promise<boolean>} Connection status
   */
  async connect() {
    throw new Error('connect() must be implemented by device driver');
  }

  /**
   * Disconnect from the POS device
   * @returns {Promise<boolean>} Disconnection status
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by device driver');
  }

  /**
   * Process a payment transaction
   * @param {Object} transaction - Transaction details
   * @param {number} transaction.amount - Amount in INR
   * @param {string} transaction.invoiceNo - Invoice number
   * @returns {Promise<Object>} Transaction result
   */
  async processPayment(transaction) {
    throw new Error('processPayment() must be implemented by device driver');
  }

  /**
   * Cancel an ongoing transaction
   * @returns {Promise<boolean>} Cancellation status
   */
  async cancelTransaction() {
    throw new Error('cancelTransaction() must be implemented by device driver');
  }

  /**
   * Get device status
   * @returns {Promise<Object>} Device status information
   */
  async getStatus() {
    throw new Error('getStatus() must be implemented by device driver');
  }

  /**
   * Print receipt
   * @param {Object} receiptData - Receipt information
   * @returns {Promise<boolean>} Print status
   */
  async printReceipt(receiptData) {
    throw new Error('printReceipt() must be implemented by device driver');
  }

  /**
   * Get last transaction details
   * @returns {Promise<Object>} Last transaction data
   */
  async getLastTransaction() {
    throw new Error('getLastTransaction() must be implemented by device driver');
  }

  /**
   * Check if device is connected
   * @returns {boolean} Connection status
   */
  isDeviceConnected() {
    return this.isConnected;
  }

  /**
   * Get device information
   * @returns {Object} Device info
   */
  getDeviceInfo() {
    return this.deviceInfo;
  }
}
