import { GenericSerialPOS } from './GenericSerialPOS.js';

/**
 * Ingenico POS Device Driver
 * Supports Ingenico Move, Desk, and other series
 */
export class IngenicoPOS extends GenericSerialPOS {
  constructor(config) {
    super(config);
    this.deviceInfo = {
      type: 'Ingenico Terminal',
      port: config.port,
      baudRate: config.baudRate || 19200 // Ingenico typically uses 19200
    };
  }

  formatPaymentCommand(amount, invoiceNo) {
    // Ingenico uses ISO 8583 based protocol
    // Simplified version for demonstration
    const command = {
      messageType: '0200',
      amount: amount.toString().padStart(12, '0'),
      invoiceNumber: invoiceNo,
      transactionType: '00' // Purchase
    };

    return `${JSON.stringify(command)}\r\n`;
  }

  parsePaymentResponse(response) {
    console.log('📄 Parsing Ingenico response:', response);

    const result = {
      success: false,
      transactionId: null,
      cardNumber: null,
      cardType: null,
      authCode: null,
      responseCode: null,
      timestamp: new Date(),
      rawResponse: response
    };

    try {
      // Try parsing as JSON first
      const data = JSON.parse(response);

      if (data.responseCode === '00' || data.responseCode === '000') {
        result.success = true;
      }

      result.responseCode = data.responseCode;
      result.transactionId = data.transactionId || data.stan;
      result.cardNumber = data.cardNumber;
      result.cardType = data.cardType;
      result.authCode = data.authCode || data.approvalCode;
    } catch (e) {
      // Fallback to text parsing
      if (response.includes('APPROVED') || response.includes(':00:')) {
        result.success = true;
      }

      // Extract common fields
      const tidMatch = response.match(/TID[:|=](\w+)/i);
      if (tidMatch) result.transactionId = tidMatch[1];

      const authMatch = response.match(/AUTH[:|=](\w+)/i);
      if (authMatch) result.authCode = authMatch[1];
    }

    return result;
  }
}
