import { GenericSerialPOS } from './GenericSerialPOS.js';

/**
 * PAX Technology POS Device Driver
 * Supports PAX A, D, and S series terminals
 */
export class PAXPOS extends GenericSerialPOS {
  constructor(config) {
    super(config);
    this.deviceInfo = {
      type: 'PAX Terminal',
      port: config.port,
      baudRate: config.baudRate || 115200
    };
  }

  formatPaymentCommand(amount, invoiceNo) {
    // PAX PAXSTORE protocol
    // Format: T00|command_id|amount|invoice|extras
    const amountStr = amount.toString().padStart(12, '0');
    const command = `T00|01|${amountStr}|${invoiceNo}|||\r\n`;
    return command;
  }

  parsePaymentResponse(response) {
    console.log('📄 Parsing PAX response:', response);

    const result = {
      success: false,
      transactionId: null,
      cardNumber: null,
      cardType: null,
      authCode: null,
      hostResponse: null,
      timestamp: new Date(),
      rawResponse: response
    };

    // PAX response format: R00|response_code|host_response|...
    const parts = response.split('|');

    if (parts.length > 1) {
      const responseCode = parts[1];

      // PAX uses '000000' for success
      if (responseCode === '000000' || responseCode === '00') {
        result.success = true;
      }

      result.hostResponse = parts[2];

      // Extract other fields from response
      if (parts.length > 3) result.transactionId = parts[3];
      if (parts.length > 4) result.authCode = parts[4];
      if (parts.length > 5) result.cardNumber = parts[5];
      if (parts.length > 6) result.cardType = parts[6];
    }

    return result;
  }
}
