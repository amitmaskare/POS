import { GenericSerialPOS } from './GenericSerialPOS.js';

/**
 * Pine Labs Plutus POS Device Driver
 * Implements Pine Labs specific protocol
 */
export class PineLabsPOS extends GenericSerialPOS {
  constructor(config) {
    super(config);
    this.deviceInfo = {
      type: 'Pine Labs Plutus',
      port: config.port,
      baudRate: config.baudRate || 9600
    };
  }

  formatPaymentCommand(amount, invoiceNo) {
    // Pine Labs protocol format
    // STX|SALE|Amount|InvoiceNo|ETX
    const STX = '\x02'; // Start of text
    const ETX = '\x03'; // End of text
    const command = `${STX}SALE|${amount}|${invoiceNo}${ETX}\r\n`;
    return command;
  }

  parsePaymentResponse(response) {
    console.log('📄 Parsing Pine Labs response:', response);

    const result = {
      success: false,
      transactionId: null,
      cardNumber: null,
      cardType: null,
      authCode: null,
      acquirerName: null,
      merchantId: null,
      terminalId: null,
      timestamp: new Date(),
      rawResponse: response
    };

    // Pine Labs response format varies, but typically includes:
    // Response codes, transaction ID, card details, etc.

    // Check for approval
    if (response.includes('APPROVED') || response.includes('00')) {
      result.success = true;
    }

    // Extract fields using regex patterns
    const patterns = {
      transactionId: /TID[:|=](\w+)/i,
      cardNumber: /CARD[:|=]([\d*]+)/i,
      cardType: /CARDTYPE[:|=](\w+)/i,
      authCode: /AUTH[:|=](\w+)/i,
      acquirer: /ACQUIRER[:|=]([\w\s]+)/i,
      merchantId: /MID[:|=](\w+)/i,
      terminalId: /TERMID[:|=](\w+)/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = response.match(pattern);
      if (match) {
        const mappedKey = key === 'acquirer' ? 'acquirerName' : key;
        result[mappedKey] = match[1].trim();
      }
    }

    return result;
  }

  async getStatus() {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      this.responseBuffer = [];
      const STX = '\x02';
      const ETX = '\x03';
      await this.sendCommand(`${STX}STATUS${ETX}\r\n`);
      const response = await this.waitForResponse(5000);

      return {
        online: response.includes('READY') || response.includes('00'),
        message: response
      };
    } catch (error) {
      return {
        online: false,
        message: error.message
      };
    }
  }

  async cancelTransaction() {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      this.responseBuffer = [];
      const STX = '\x02';
      const ETX = '\x03';
      await this.sendCommand(`${STX}CANCEL${ETX}\r\n`);
      const response = await this.waitForResponse(10000);
      return response.includes('CANCELLED') || response.includes('00');
    } catch (error) {
      console.error('❌ Cancel transaction error:', error);
      return false;
    }
  }
}
