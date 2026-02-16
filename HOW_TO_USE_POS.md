# How to Use POS Machine Integration

## 🚀 Quick Start Guide

Your POS system now supports physical card payment terminals! Here's how to use it:

---

## Step 1: Access POS Settings

1. Navigate to **Settings > POS Device Settings** in your application
2. Or access directly at: `http://localhost:3000/pos-settings`

The POS Settings page (`POSSettings.jsx`) has been created for you at:
```
frontend/src/pages/Settings/POSSettings.jsx
```

---

## Step 2: Connect Your POS Terminal

### Physical Setup:
1. **Connect** your POS machine to your computer via USB cable
2. **Power on** the POS terminal
3. Wait for it to initialize (usually shows "READY" or similar)

### In the Application:

1. Click **"Scan for POS Devices"** button
   - This will search for all available serial ports
   - You'll see a list of detected ports

2. **Select Device Type:**
   - **Generic Serial POS** - If unsure, start with this
   - **Pine Labs Plutus** - For Pine Labs terminals
   - **Ingenico** - For Ingenico terminals
   - **Verifone** - For Verifone terminals
   - **PAX** - For PAX terminals

3. **Select the Port:**
   - Choose the port where your device is connected
   - Usually shows as `/dev/ttyUSB0` (Linux/Mac) or `COM3` (Windows)

4. **Configure Settings** (Optional):
   - **Baud Rate**: Auto-set based on device type (usually correct)
   - **Terminal ID**: Your terminal identifier
   - **Merchant ID**: Your merchant identifier

5. Click **"Connect to POS Device"**

### Success!
You'll see:
- ✅ Green "Connected" status
- Device information displayed
- "Disconnect" button becomes available

---

## Step 3: Process Payments

### Option A: Using the Frontend Service

In your Cart or Checkout component, import the POS service:

```javascript
import { processPayment, getDeviceStatus } from '../../services/posService';

// Check if device is connected
const handleCheckout = async () => {
  try {
    // Check device status first
    const status = await getDeviceStatus();

    if (!status.data.connected) {
      alert('Please connect POS device first');
      return;
    }

    // Process payment
    const result = await processPayment({
      amount: totalAmount,        // e.g., 1500.50
      invoiceNo: invoiceNumber,   // e.g., "INV-001"
      saleId: saleId              // Optional: your sale ID
    });

    if (result.success && result.data.success) {
      console.log('Payment approved!');
      console.log('Transaction ID:', result.data.transactionId);
      console.log('Card:', result.data.cardNumber);
      console.log('Auth Code:', result.data.authCode);

      // Payment successful - update your UI
      showSuccessMessage();
    } else {
      // Payment failed
      showErrorMessage('Payment failed');
    }
  } catch (error) {
    console.error('Payment error:', error);
    showErrorMessage(error.message);
  }
};
```

### Option B: Direct API Call

```javascript
const processCardPayment = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:4000/api/pos/process-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: 1500.50,
      invoiceNo: 'INV-001',
      saleId: 123
    })
  });

  const result = await response.json();
  console.log(result);
};
```

---

## Step 4: Add POS Payment to Your Cart

Here's how to add a "Pay with Card Machine" button to your existing Cart:

```javascript
import { useState } from 'react';
import { processPayment, getDeviceStatus } from '../../services/posService';
import { Button, CircularProgress, Alert } from '@mui/material';
import { CreditCard } from '@mui/icons-material';

function Cart() {
  const [processing, setProcessing] = useState(false);
  const [posConnected, setPosConnected] = useState(false);

  // Check POS status on mount
  useEffect(() => {
    checkPOSConnection();
  }, []);

  const checkPOSConnection = async () => {
    try {
      const status = await getDeviceStatus();
      setPosConnected(status.data.connected);
    } catch (error) {
      setPosConnected(false);
    }
  };

  const handlePOSPayment = async () => {
    if (!posConnected) {
      alert('Please connect your POS device in Settings first');
      return;
    }

    setProcessing(true);
    try {
      const result = await processPayment({
        amount: cartTotal,
        invoiceNo: generateInvoiceNumber(),
        saleId: currentSaleId
      });

      if (result.success && result.data.success) {
        // Payment successful!
        alert(`Payment Approved!\nTransaction ID: ${result.data.transactionId}`);
        // Clear cart, print receipt, etc.
        clearCart();
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      alert('Error processing payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {/* Your existing cart UI */}

      {/* Add this POS payment button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={processing ? <CircularProgress size={20} /> : <CreditCard />}
        onClick={handlePOSPayment}
        disabled={processing || !posConnected}
        fullWidth
        size="large"
      >
        {posConnected ? 'Pay with Card Machine' : 'POS Not Connected'}
      </Button>

      {!posConnected && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Connect your POS device in Settings to accept card payments
        </Alert>
      )}
    </div>
  );
}
```

---

## 📋 Complete Payment Flow Example

```javascript
import { processPayment, cancelTransaction } from '../../services/posService';

const CompleteCheckout = async (cart, customer) => {
  try {
    // 1. Create sale in your system
    const sale = await createSale({
      cart: cart,
      customer: customer,
      payment_method: 'pos_card',
      payment_status: 'pending'
    });

    // 2. Process payment through POS
    console.log('Waiting for customer to swipe/insert card...');

    const paymentResult = await processPayment({
      amount: sale.total,
      invoiceNo: sale.invoice_no,
      saleId: sale.id
    });

    // 3. Check result
    if (paymentResult.success && paymentResult.data.success) {
      // Payment approved!
      console.log('✅ Payment Approved');
      console.log('Transaction ID:', paymentResult.data.transactionId);
      console.log('Card:', paymentResult.data.cardNumber);
      console.log('Card Type:', paymentResult.data.cardType);
      console.log('Auth Code:', paymentResult.data.authCode);

      // 4. Update sale status
      await updateSale(sale.id, {
        payment_status: 'paid',
        pos_transaction_id: paymentResult.data.transactionId
      });

      // 5. Print receipt, clear cart, etc.
      printReceipt(sale, paymentResult.data);
      clearCart();

      return { success: true, sale, transaction: paymentResult.data };
    } else {
      // Payment declined/failed
      console.log('❌ Payment Failed');

      // Update sale status
      await updateSale(sale.id, {
        payment_status: 'failed'
      });

      return { success: false, message: 'Payment declined' };
    }
  } catch (error) {
    console.error('Checkout error:', error);

    // Try to cancel the transaction if it's in progress
    try {
      await cancelTransaction();
    } catch (cancelError) {
      console.error('Cancel failed:', cancelError);
    }

    return { success: false, message: error.message };
  }
};
```

---

## 🎯 Common Use Cases

### 1. Check if POS is Connected Before Showing Option

```javascript
import { getDeviceStatus } from '../../services/posService';

const PaymentMethodSelector = () => {
  const [posAvailable, setPosAvailable] = useState(false);

  useEffect(() => {
    checkPOS();
  }, []);

  const checkPOS = async () => {
    try {
      const status = await getDeviceStatus();
      setPosAvailable(status.data.connected);
    } catch {
      setPosAvailable(false);
    }
  };

  return (
    <div>
      <Button onClick={() => payWithCash()}>Cash</Button>
      <Button onClick={() => payWithRazorpay()}>Online Payment</Button>
      {posAvailable && (
        <Button onClick={() => payWithPOS()}>Card Machine</Button>
      )}
    </div>
  );
};
```

### 2. Show Real-time POS Status

```javascript
import { getDeviceStatus } from '../../services/posService';

const POSStatusBadge = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await getDeviceStatus();
        setStatus(result.data);
      } catch (error) {
        setStatus(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!status || !status.connected) {
    return <Chip label="POS Offline" color="error" size="small" />;
  }

  return (
    <Chip
      label={`POS Connected - ${status.deviceInfo.type}`}
      color="success"
      size="small"
    />
  );
};
```

### 3. View Transaction History

```javascript
import { getTransactionHistory } from '../../services/posService';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const result = await getTransactionHistory(50, 0);
      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  return (
    <div>
      <h2>POS Transactions</h2>
      {transactions.map(txn => (
        <div key={txn.id}>
          <p>Transaction ID: {txn.transaction_id}</p>
          <p>Amount: ₹{txn.amount}</p>
          <p>Card: {txn.card_number}</p>
          <p>Status: {txn.status}</p>
          <p>Date: {new Date(txn.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 🔧 Troubleshooting

### POS Device Not Detected
1. Check USB cable is properly connected
2. Try a different USB port
3. Restart the POS terminal
4. Click "Scan for POS Devices" again

### Connection Fails
1. Try "Generic Serial POS" device type first
2. Check the baud rate (try 9600 first)
3. Ensure no other application is using the port
4. Check device permissions (Linux: `sudo chmod 666 /dev/ttyUSB0`)

### Payment Times Out
1. Check if card is properly inserted/swiped
2. Look at the POS terminal screen for prompts
3. Ensure the terminal has good network connection (for online verification)

### Transaction History Empty
- Transactions are saved automatically when payments are processed
- Check that you're logged in with the correct user account
- Verify database connection is working

---

## 📝 Next Steps

1. **Add to Navigation**: Add a link to POS Settings in your app menu
2. **Customize UI**: Style the POS Settings page to match your app theme
3. **Add Notifications**: Show toast notifications for payment status
4. **Receipt Printing**: Integrate with POS terminal's printer
5. **Reports**: Create POS transaction reports and analytics

---

## 🎓 Training Your Staff

1. Show them how to connect the POS device (one-time setup)
2. Demonstrate the "Pay with Card Machine" button in checkout
3. Explain what to do if payment fails (retry or use another method)
4. Train on troubleshooting (disconnect/reconnect if issues)

---

## ✅ You're All Set!

The POS integration is complete and ready to use. Simply:
1. Connect your POS device in Settings
2. Add the payment button to your checkout
3. Start accepting card payments!

For technical details, see `POS_INTEGRATION_GUIDE.md`
