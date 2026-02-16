import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

/**
 * POS Manager - Handles POS device connections and operations
 */
export class POSManager {
  constructor() {
    this.activeDevice = null;
    this.deviceDrivers = new Map();
    this.serialPorts = new Map();
  }

  /**
   * Register a device driver
   * @param {string} deviceType - Device type identifier
   * @param {Class} driverClass - Driver class
   */
  registerDriver(deviceType, driverClass) {
    this.deviceDrivers.set(deviceType, driverClass);
    console.log(`✅ Registered POS driver: ${deviceType}`);
  }

  /**
   * Scan for available serial ports
   * @returns {Promise<Array>} List of available ports
   */
  async scanPorts() {
    try {
      const ports = await SerialPort.list();
      console.log('📡 Available serial ports:', ports);
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        vendorId: port.vendorId,
        productId: port.productId,
      }));
    } catch (error) {
      console.error('❌ Error scanning ports:', error);
      throw error;
    }
  }

  /**
   * Connect to a POS device
   * @param {Object} config - Device configuration
   * @param {string} config.deviceType - Type of device (pinelabs, ingenico, verifone, etc.)
   * @param {string} config.port - Serial port path
   * @param {number} config.baudRate - Baud rate (default: 9600)
   * @returns {Promise<Object>} Connection result
   */
  async connectDevice(config) {
    try {
      const { deviceType, port, baudRate = 9600 } = config;

      if (!this.deviceDrivers.has(deviceType)) {
        throw new Error(`Unknown device type: ${deviceType}`);
      }

      // Create device instance
      const DriverClass = this.deviceDrivers.get(deviceType);
      const device = new DriverClass({
        port,
        baudRate,
        ...config
      });

      // Connect to device
      const connected = await device.connect();

      if (connected) {
        this.activeDevice = device;
        console.log(`✅ Connected to ${deviceType} on ${port}`);
        return {
          success: true,
          deviceInfo: device.getDeviceInfo(),
          message: 'Device connected successfully'
        };
      } else {
        throw new Error('Failed to connect to device');
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from current device
   * @returns {Promise<boolean>} Disconnection status
   */
  async disconnectDevice() {
    if (!this.activeDevice) {
      return false;
    }

    try {
      await this.activeDevice.disconnect();
      this.activeDevice = null;
      console.log('✅ Device disconnected');
      return true;
    } catch (error) {
      console.error('❌ Disconnection error:', error);
      throw error;
    }
  }

  /**
   * Process payment through connected device
   * @param {Object} transaction - Transaction details
   * @returns {Promise<Object>} Transaction result
   */
  async processPayment(transaction) {
    if (!this.activeDevice) {
      throw new Error('No device connected');
    }

    if (!this.activeDevice.isDeviceConnected()) {
      throw new Error('Device is not connected');
    }

    try {
      console.log('💳 Processing payment:', transaction);
      const result = await this.activeDevice.processPayment(transaction);
      console.log('✅ Payment processed:', result);
      return result;
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Cancel ongoing transaction
   * @returns {Promise<boolean>} Cancellation status
   */
  async cancelTransaction() {
    if (!this.activeDevice) {
      throw new Error('No device connected');
    }

    return await this.activeDevice.cancelTransaction();
  }

  /**
   * Get device status
   * @returns {Promise<Object>} Device status
   */
  async getDeviceStatus() {
    if (!this.activeDevice) {
      return {
        connected: false,
        message: 'No device connected'
      };
    }

    try {
      const status = await this.activeDevice.getStatus();
      return {
        connected: true,
        deviceInfo: this.activeDevice.getDeviceInfo(),
        status
      };
    } catch (error) {
      console.error('❌ Status check error:', error);
      throw error;
    }
  }

  /**
   * Print receipt
   * @param {Object} receiptData - Receipt information
   * @returns {Promise<boolean>} Print status
   */
  async printReceipt(receiptData) {
    if (!this.activeDevice) {
      throw new Error('No device connected');
    }

    return await this.activeDevice.printReceipt(receiptData);
  }

  /**
   * Get last transaction
   * @returns {Promise<Object>} Last transaction data
   */
  async getLastTransaction() {
    if (!this.activeDevice) {
      throw new Error('No device connected');
    }

    return await this.activeDevice.getLastTransaction();
  }

  /**
   * Check if a device is currently connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.activeDevice !== null && this.activeDevice.isDeviceConnected();
  }
}

// Singleton instance
export const posManager = new POSManager();
