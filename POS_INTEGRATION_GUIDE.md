# POS Machine Integration Guide

## Overview
Your POS system now supports **universal POS machine integration** via USB/Serial connection. This allows you to accept card payments through any physical POS terminal.

## Supported POS Devices

1. **Pine Labs Plutus** - India's leading EDC terminal
2. **Ingenico** - Move, Desk, and other series
3. **Verifone** - VX and V series terminals
4. **PAX Technology** - A, D, and S series terminals
5. **Generic Serial POS** - Works with most other POS devices

## Backend Setup ✅

### Installed Dependencies
- `serialport` - Serial port communication
- `@serialport/parser-readline` - Data parsing
- `node-hid` - HID device support
- `usb` - USB device support

### Database Tables Created
- `pos_config` - Stores device configuration per user
- `pos_transactions` - Stores all POS payment transactions
- `sales.pos_transaction_id` - Links sales to POS transactions

### API Endpoints

All endpoints require authentication (Bearer token).

#### 1. Scan for Available Ports
```
GET /api/pos/scan-ports
```
Returns list of available serial ports where POS devices might be connected.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "path": "/dev/ttyUSB0",
      "manufacturer": "Prolific",
      "serialNumber": "ABC123",
      "vendorId": "067b",
      "productId": "2303"
    }
  ]
}
```

#### 2. Connect to POS Device
```
POST /api/pos/connect
```
**Body:**
```json
{
  "deviceType": "pinelabs",  // or "ingenico", "verifone", "pax", "generic"
  "port": "/dev/ttyUSB0",
  "baudRate": 9600,          // optional, defaults to 9600
  "terminalId": "TERM001",   // optional
  "merchantId": "MERCH001"   // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device connected successfully",
  "data": {
    "deviceInfo": {
      "type": "Pine Labs Plutus",
      "port": "/dev/ttyUSB0",
      "baudRate": 9600
    }
  }
}
```

#### 3. Disconnect from Device
```
POST /api/pos/disconnect
```

#### 4. Get Device Status
```
GET /api/pos/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "deviceInfo": { ... },
    "status": {
      "online": true,
      "message": "Device ready"
    }
  }
}
```

#### 5. Process Payment
```
POST /api/pos/process-payment
```
**Body:**
```json
{
  "amount": 1500.50,
  "invoiceNo": "INV-001",
  "saleId": 123  // optional, to link with sale
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "success": true,
    "transactionId": "TXN123456",
    "cardNumber": "************1234",
    "cardType": "VISA",
    "authCode": "AUTH001",
    "timestamp": "2026-02-15T10:00:00.000Z"
  }
}
```

#### 6. Cancel Transaction
```
POST /api/pos/cancel-transaction
```

#### 7. Get Last Transaction
```
GET /api/pos/last-transaction
```

#### 8. Get POS Configuration
```
GET /api/pos/config
```

#### 9. Get Transaction History
```
GET /api/pos/transactions?limit=50&offset=0
```

## Frontend Integration ✅

### POS Service Created
Location: `frontend/src/services/posService.js`

Available functions:
- `scanPorts()` - Scan for devices
- `connectDevice(config)` - Connect to device
- `disconnectDevice()` - Disconnect
- `getDeviceStatus()` - Check status
- `processPayment(data)` - Process payment
- `cancelTransaction()` - Cancel
- `getLastTransaction()` - Get last transaction
- `getConfig()` - Get configuration
- `getTransactionHistory(limit, offset)` - Get history

## How to Use

### Step 1: Connect Your POS Machine
1. Connect your POS terminal to your computer via USB/Serial
2. Power on the device
3. Use the scan ports API to find the device

### Step 2: Configure in Your Application
```javascript
import { scanPorts, connectDevice } from './services/posService';

// Scan for devices
const ports = await scanPorts();

// Connect to device
const result = await connectDevice({
  deviceType: 'pinelabs',  // Change based on your device
  port: ports.data[0].path,
  baudRate: 9600
});
```

### Step 3: Process Payments
```javascript
import { processPayment } from './services/posService';

const result = await processPayment({
  amount: 1500.50,
  invoiceNo: 'INV-001',
  saleId: 123
});

if (result.success && result.data.success) {
  console.log('Payment approved!');
  console.log('Transaction ID:', result.data.transactionId);
}
```

## Device-Specific Notes

### Pine Labs
- Default baud rate: 9600
- Protocol: STX/ETX based
- Supports card swipe, chip, and contactless

### Ingenico
- Default baud rate: 19200
- Protocol: ISO 8583 based
- JSON response format

### Verifone
- Default baud rate: 115200
- Protocol: Verifone proprietary
- JSON request/response

### PAX
- Default baud rate: 115200
- Protocol: PAXSTORE format
- Pipe-delimited responses

### Generic
- Default baud rate: 9600
- Basic text-based protocol
- Works with most simple terminals

## Troubleshooting

### Device Not Detected
1. Check USB/Serial connection
2. Verify device is powered on
3. Check cable is data cable (not just charging)
4. Try different USB port
5. Check device drivers are installed

### Connection Fails
1. Verify correct baud rate
2. Try different device type (use 'generic' first)
3. Check port permissions (Linux/Mac)
4. Restart device and try again

### Payment Times Out
1. Ensure card is inserted properly
2. Check device display for prompts
3. Increase timeout if needed
4. Verify device is ready status

### Transaction Fails
1. Check card is valid
2. Verify network connectivity (for online terminals)
3. Check device paper/printer (if applicable)
4. Review transaction logs

## Testing

### Manual Testing
```bash
# Test port scanning
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/pos/scan-ports

# Test device connection
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceType":"generic","port":"/dev/ttyUSB0","baudRate":9600}' \
  http://localhost:4000/api/pos/connect

# Test device status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/pos/status
```

## Security Notes

1. **Connection Security**: Serial/USB connections are local only
2. **Data Encryption**: Card data is masked by POS device
3. **Transaction Logs**: All transactions stored with full audit trail
4. **Authentication**: All API endpoints require valid JWT token
5. **PCI Compliance**: Device handles sensitive card data, not your app

## Next Steps

1. **Create POS Settings Page** - UI to configure and connect devices
2. **Add to Cart/Checkout** - Integrate POS payment option
3. **Receipt Printing** - Support for POS terminal receipt printing
4. **Transaction Reports** - Dashboard for POS transactions
5. **Multi-Device Support** - Allow multiple POS terminals

## Support

For device-specific issues, contact your POS terminal provider.
For integration issues, check logs at:
- Backend: Console output shows POS system initialization
- Frontend: Browser console for service errors

---

**Status**: ✅ Backend Complete | ✅ Frontend Service Ready | ⏳ UI Integration Pending

Last Updated: 2026-02-15
