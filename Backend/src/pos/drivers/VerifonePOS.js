import { GenericSerialPOS } from './GenericSerialPOS.js';

/**
 * Verifone POS Device Driver
 * Supports Verifone VX and V series terminals
 */
export class VerifonePOS extends GenericSerialPOS {
  constructor(config) {
    super(config);
    this.deviceInfo = {
      type: 'Verifone Terminal',
      port: config.port,
      baudRate: config.baudRate || 115200 // Verifone typically uses higher baud rate
    };
  }

  formatPaymentCommand(amount, invoiceNo) {
    // Verifone protocol
    const command = {
      command: 'SALE',
      amount: (amount / 100).toFixed(2), // Convert paise to rupees
      invoice: invoiceNo,
      timeout: 60
    };

    return `${JSON.stringify(command)}\n`;
  }

  parsePaymentResponse(response) {
    console.log('📄 Parsing Verifone response:', response);

    const result = {
      success: false,
      transactionId: null,
      cardNumber: null,
      cardType: null,
      authCode: null,
      rrn: null, // Retrieval Reference Number
      batchNumber: null,
      timestamp: new Date(),
      rawResponse: response
    };

    try {
      const data = JSON.parse(response);

      // Verifone uses specific response codes
      if (data.result === 'APPROVED' || data.resultCode === '00') {
        result.success = true;
      }

      result.transactionId = data.transactionId;
      result.cardNumber = data.maskedCardNumber;
      result.cardType = data.cardBrand;
      result.authCode = data.authorizationCode;
      result.rrn = data.rrn;
      result.batchNumber = data.batchNumber;
    } catch (e) {
      // Text-based parsing fallback
      if (response.includes('APPROVED')) {
        result.success = true;
      }
    }

    return result;
  }
}
