import { POSDevice } from '../POSDevice.js';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

/**
 * Generic Serial POS Device Driver
 * Works with most serial-based POS terminals
 */
export class GenericSerialPOS extends POSDevice {
  constructor(config) {
    super(config);
    this.port = null;
    this.parser = null;
    this.responseBuffer = [];
    this.waitingForResponse = false;
  }

  async connect() {
    try {
      // Open serial port
      this.port = new SerialPort({
        path: this.config.port,
        baudRate: this.config.baudRate || 9600,
        dataBits: this.config.dataBits || 8,
        parity: this.config.parity || 'none',
        stopBits: this.config.stopBits || 1,
        autoOpen: false
      });

      // Setup parser
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      // Setup event listeners
      this.parser.on('data', (data) => {
        console.log('📥 POS Data received:', data);
        this.responseBuffer.push(data);
      });

      this.port.on('error', (err) => {
        console.error('❌ Serial port error:', err);
      });

      // Open port
      await new Promise((resolve, reject) => {
        this.port.open((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      this.isConnected = true;
      this.deviceInfo = {
        type: 'Generic Serial POS',
        port: this.config.port,
        baudRate: this.config.baudRate || 9600
      };

      console.log('✅ Serial POS connected');
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.port && this.port.isOpen) {
      await new Promise((resolve) => {
        this.port.close(() => {
          this.isConnected = false;
          resolve();
        });
      });
    }
    return true;
  }

  async processPayment(transaction) {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      // Clear response buffer
      this.responseBuffer = [];

      // Format payment command (adjust based on your POS protocol)
      const amount = Math.round(transaction.amount * 100); // Convert to paise
      const command = this.formatPaymentCommand(amount, transaction.invoiceNo);

      // Send command
      console.log('📤 Sending payment command:', command);
      await this.sendCommand(command);

      // Wait for response
      const response = await this.waitForResponse(30000); // 30 second timeout

      // Parse response
      return this.parsePaymentResponse(response);
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      throw error;
    }
  }

  formatPaymentCommand(amount, invoiceNo) {
    // Default format - override in specific drivers
    // Format: SALE|AMOUNT|INVOICE
    return `SALE|${amount}|${invoiceNo}\r\n`;
  }

  async sendCommand(command) {
    return new Promise((resolve, reject) => {
      this.port.write(command, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async waitForResponse(timeout = 30000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkResponse = setInterval(() => {
        if (this.responseBuffer.length > 0) {
          clearInterval(checkResponse);
          resolve(this.responseBuffer.join('\n'));
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkResponse);
          reject(new Error('Response timeout'));
        }
      }, 100);
    });
  }

  parsePaymentResponse(response) {
    // Default parser - override in specific drivers
    console.log('📄 Parsing response:', response);

    const lines = response.split('\n');
    const result = {
      success: false,
      transactionId: null,
      cardNumber: null,
      cardType: null,
      authCode: null,
      timestamp: new Date(),
      rawResponse: response
    };

    // Simple parsing - check for success indicators
    if (response.includes('APPROVED') || response.includes('SUCCESS')) {
      result.success = true;

      // Extract transaction ID if present
      const txnMatch = response.match(/TXN[:|=](\w+)/i);
      if (txnMatch) {
        result.transactionId = txnMatch[1];
      }

      // Extract card number if present
      const cardMatch = response.match(/CARD[:|=]([\d*]+)/i);
      if (cardMatch) {
        result.cardNumber = cardMatch[1];
      }

      // Extract auth code if present
      const authMatch = response.match(/AUTH[:|=](\w+)/i);
      if (authMatch) {
        result.authCode = authMatch[1];
      }
    }

    return result;
  }

  async cancelTransaction() {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      this.responseBuffer = [];
      await this.sendCommand('CANCEL\r\n');
      const response = await this.waitForResponse(10000);
      return response.includes('CANCELLED') || response.includes('CANCEL');
    } catch (error) {
      console.error('❌ Cancel transaction error:', error);
      return false;
    }
  }

  async getStatus() {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      this.responseBuffer = [];
      await this.sendCommand('STATUS\r\n');
      const response = await this.waitForResponse(5000);

      return {
        online: response.includes('READY') || response.includes('ONLINE'),
        message: response
      };
    } catch (error) {
      return {
        online: false,
        message: error.message
      };
    }
  }

  async printReceipt(receiptData) {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      const printCommand = `PRINT|${JSON.stringify(receiptData)}\r\n`;
      await this.sendCommand(printCommand);
      return true;
    } catch (error) {
      console.error('❌ Print error:', error);
      return false;
    }
  }

  async getLastTransaction() {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      this.responseBuffer = [];
      await this.sendCommand('LAST_TXN\r\n');
      const response = await this.waitForResponse(5000);
      return this.parsePaymentResponse(response);
    } catch (error) {
      console.error('❌ Get last transaction error:', error);
      return null;
    }
  }
}
