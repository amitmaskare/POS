import express from 'express';
import { POSController } from '../controllers/POSController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware);

// Scan for available serial ports
router.get('/pos/scan-ports', POSController.scanPorts);

// Connect to POS device
router.post('/pos/connect', POSController.connectDevice);

// Disconnect from POS device
router.post('/pos/disconnect', POSController.disconnectDevice);

// Get device status
router.get('/pos/status', POSController.getDeviceStatus);

// Process payment
router.post('/pos/process-payment', POSController.processPayment);

// Cancel transaction
router.post('/pos/cancel-transaction', POSController.cancelTransaction);

// Get last transaction
router.get('/pos/last-transaction', POSController.getLastTransaction);

// Get POS configuration
router.get('/pos/config', POSController.getConfig);

// Get transaction history
router.get('/pos/transactions', POSController.getTransactionHistory);

export default router;
