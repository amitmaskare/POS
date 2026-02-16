import { posManager } from '../pos/index.js';
import { sendResponse } from '../utils/sendResponse.js';
import { CommonModel } from '../models/CommonModel.js';

export const POSController = {
  /**
   * Scan for available serial ports
   */
  scanPorts: async (req, res) => {
    try {
      const ports = await posManager.scanPorts();
      return sendResponse(res, true, 200, 'Ports scanned successfully', ports);
    } catch (error) {
      console.error('❌ Scan ports error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  },

  /**
   * Connect to a POS device
   */
  connectDevice: async (req, res) => {
    try {
      const { deviceType, port, baudRate, terminalId, merchantId } = req.body;

      if (!deviceType || !port) {
        return sendResponse(res, false, 400, 'deviceType and port are required');
      }

      const config = {
        deviceType,
        port,
        baudRate: baudRate || 9600,
        terminalId,
        merchantId
      };

      const result = await posManager.connectDevice(config);

      // Save POS configuration to database
      const userId = req.user.userId;
      await CommonModel.deleteData({
        table: 'pos_config',
        conditions: { user_id: userId }
      });

      await CommonModel.insertData({
        table: 'pos_config',
        data: {
          user_id: userId,
          device_type: deviceType,
          port,
          baud_rate: baudRate || 9600,
          terminal_id: terminalId,
          merchant_id: merchantId,
          is_active: 1
        }
      });

      return sendResponse(res, true, 200, 'Device connected successfully', result);
    } catch (error) {
      console.error('❌ Connect device error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  },

  /**
   * Disconnect from current POS device
   */
  disconnectDevice: async (req, res) => {
    try {
      const success = await posManager.disconnectDevice();

      if (success) {
        const userId = req.user.userId;
        await CommonModel.updateData({
          table: 'pos_config',
          data: { is_active: 0 },
          conditions: { user_id: userId }
        });

        return sendResponse(res, true, 200, 'Device disconnected successfully');
      } else {
        return sendResponse(res, false, 400, 'No device was connected');
      }
    } catch (error) {
      console.error('❌ Disconnect device error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  },

  /**
   * Get device status
   */
  getDeviceStatus: async (req, res) => {
    try {
      const status = await posManager.getDeviceStatus();
      return sendResponse(res, true, 200, 'Device status retrieved', status);
    } catch (error) {
      console.error('❌ Get device status error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  },

  /**
   * Process payment through POS device
   */
  processPayment: async (req, res) => {
    try {
      const { amount, invoiceNo, saleId } = req.body;

      if (!amount || !invoiceNo) {
        return sendResponse(res, false, 400, 'amount and invoiceNo are required');
      }

      if (!posManager.isConnected()) {
        return sendResponse(res, false, 400, 'No POS device connected');
      }

      // Process payment through POS device
      const result = await posManager.processPayment({
        amount,
        invoiceNo
      });

      if (result.success) {
        // Save transaction details
        const userId = req.user.userId;
        await CommonModel.insertData({
          table: 'pos_transactions',
          data: {
            sale_id: saleId,
            user_id: userId,
            transaction_id: result.transactionId,
            amount,
            card_number: result.cardNumber,
            card_type: result.cardType,
            auth_code: result.authCode,
            status: 'approved',
            response_data: JSON.stringify(result),
            created_at: new Date()
          }
        });

        // Update sale payment status
        if (saleId) {
          await CommonModel.updateData({
            table: 'sales',
            data: {
              payment_status: 'paid',
              pos_transaction_id: result.transactionId
            },
            conditions: { id: saleId }
          });
        }

        return sendResponse(res, true, 200, 'Payment processed successfully', result);
      } else {
        // Save failed transaction
        const userId = req.user.userId;
        await CommonModel.insertData({
          table: 'pos_transactions',
          data: {
            sale_id: saleId,
            user_id: userId,
            amount,
            status: 'failed',
            response_data: JSON.stringify(result),
            created_at: new Date()
          }
        });

        return sendResponse(res, false, 400, 'Payment failed', result);
      }
    } catch (error) {
      console.error('❌ Process payment error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  },

  /**
   * Cancel ongoing transaction
   */
  cancelTransaction: async (req, res) => {
    try {
      if (!posManager.isConnected()) {
        return sendResponse(res, false, 400, 'No POS device connected');
      }

      const success = await posManager.cancelTransaction();

      if (success) {
        return sendResponse(res, true, 200, 'Transaction cancelled successfully');
      } else {
        return sendResponse(res, false, 400, 'Failed to cancel transaction');
      }
    } catch (error) {
      console.error('❌ Cancel transaction error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  },

  /**
   * Get last transaction
   */
  getLastTransaction: async (req, res) => {
    try {
      if (!posManager.isConnected()) {
        return sendResponse(res, false, 400, 'No POS device connected');
      }

      const transaction = await posManager.getLastTransaction();
      return sendResponse(res, true, 200, 'Last transaction retrieved', transaction);
    } catch (error) {
      console.error('❌ Get last transaction error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  },

  /**
   * Get POS configuration for current user
   */
  getConfig: async (req, res) => {
    try {
      const userId = req.user.userId;
      const config = await CommonModel.getSingle({
        table: 'pos_config',
        conditions: { user_id: userId }
      });

      if (!config) {
        return sendResponse(res, false, 404, 'No POS configuration found');
      }

      return sendResponse(res, true, 200, 'Configuration retrieved', config);
    } catch (error) {
      console.error('❌ Get config error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  },

  /**
   * Get transaction history
   */
  getTransactionHistory: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { limit = 50, offset = 0 } = req.query;

      const transactions = await CommonModel.getAllData({
        table: 'pos_transactions',
        conditions: { user_id: userId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy: 'created_at DESC'
      });

      return sendResponse(res, true, 200, 'Transaction history retrieved', transactions);
    } catch (error) {
      console.error('❌ Get transaction history error:', error);
      return sendResponse(res, false, 500, `Error: ${error.message}`);
    }
  }
};
