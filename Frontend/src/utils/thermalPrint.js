/**
 * Thermal Printer Utility
 * Generates and prints receipts for thermal printers (80mm width)
 * Auto-prints without opening new window
 */

export const printThermalReceipt = (receiptData) => {
  const {
    shop_name = "My Store",
    shop_address = "",
    shop_phone = "",
    shop_gst = "",
    invoice_no,
    date,
    items = [],
    subtotal,
    tax,
    total,
    payment_method,
    cash_amount,
    online_amount,
    online_method,
    received_amount,
    change_amount,
    cashier_name = "Cashier"
  } = receiptData;

  // Create hidden iframe for printing
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const printDocument = printFrame.contentWindow.document;
  printDocument.open();

  // Generate thermal receipt HTML
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${invoice_no}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: #fff;
          width: 80mm;
          padding: 5mm;
        }

        .receipt {
          width: 100%;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
        }

        .shop-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .shop-details {
          font-size: 10px;
          margin-bottom: 3px;
        }

        /* Invoice Info */
        .invoice-info {
          margin: 10px 0;
          font-size: 11px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }

        .invoice-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }

        /* Items Table */
        .items-table {
          margin: 10px 0;
          width: 100%;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }

        .items-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          margin-bottom: 5px;
          border-bottom: 1px solid #000;
          padding-bottom: 3px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 11px;
        }

        .item-name {
          flex: 1;
          max-width: 50%;
          word-wrap: break-word;
        }

        .item-qty {
          width: 15%;
          text-align: center;
        }

        .item-price {
          width: 20%;
          text-align: right;
        }

        .item-total {
          width: 25%;
          text-align: right;
          font-weight: bold;
        }

        /* Totals */
        .totals {
          margin: 10px 0;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 11px;
        }

        .total-row.grand-total {
          font-size: 14px;
          font-weight: bold;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #000;
        }

        /* Payment Details */
        .payment-details {
          margin: 10px 0;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }

        .payment-title {
          font-weight: bold;
          margin-bottom: 5px;
          text-align: center;
          font-size: 12px;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 11px;
        }

        .payment-method-badge {
          display: inline-block;
          padding: 3px 8px;
          background: #000;
          color: #fff;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
          margin: 5px 0;
        }

        .split-payment-box {
          border: 1px solid #000;
          padding: 8px;
          margin: 5px 0;
          background: #f5f5f5;
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
        }

        .thank-you {
          font-size: 14px;
          font-weight: bold;
          margin: 10px 0;
        }

        .barcode-container {
          text-align: center;
          margin: 10px 0;
        }

        .barcode {
          height: 40px;
          margin: 5px 0;
        }

        .powered-by {
          font-size: 9px;
          color: #666;
          margin-top: 10px;
        }

        /* Bold */
        .bold {
          font-weight: bold;
        }

        /* Center */
        .center {
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="receipt">

        <!-- Header -->
        <div class="header">
          <div class="shop-name">${shop_name}</div>
          ${shop_address ? `<div class="shop-details">${shop_address}</div>` : ''}
          ${shop_phone ? `<div class="shop-details">Tel: ${shop_phone}</div>` : ''}
          ${shop_gst ? `<div class="shop-details">GST: ${shop_gst}</div>` : ''}
        </div>

        <!-- Invoice Info -->
        <div class="invoice-info">
          <div class="invoice-row">
            <span class="bold">Invoice:</span>
            <span>${invoice_no}</span>
          </div>
          <div class="invoice-row">
            <span class="bold">Date:</span>
            <span>${date || new Date().toLocaleString()}</span>
          </div>
          <div class="invoice-row">
            <span class="bold">Cashier:</span>
            <span>${cashier_name}</span>
          </div>
        </div>

        <!-- Barcode -->
        <div class="barcode-container">
          <svg id="barcode" class="barcode"></svg>
        </div>

        <!-- Items Table -->
        <div class="items-table">
          <div class="items-header">
            <div class="item-name">Item</div>
            <div class="item-qty">Qty</div>
            <div class="item-price">Price</div>
            <div class="item-total">Total</div>
          </div>
          ${items.map(item => `
            <div class="item-row">
              <div class="item-name">${item.name || item.product_name}</div>
              <div class="item-qty">${item.is_loose ? `${Number(item.qty).toFixed(3)}${item.loose_unit || 'kg'}` : item.qty}</div>
              <div class="item-price">${item.is_loose ? `₹${Number(item.price_per_unit || item.price).toFixed(2)}/${item.loose_unit || 'kg'}` : `₹${Number(item.price).toFixed(2)}`}</div>
              <div class="item-total">₹${item.is_loose ? Number(item.total || item.price).toFixed(2) : (Number(item.price) * Number(item.qty)).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${Number(subtotal).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>₹${Number(tax).toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>₹${Number(total).toFixed(2)}</span>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="payment-details">
          <div class="payment-title">PAYMENT DETAILS</div>

          ${payment_method === 'split' ? `
            <!-- Split Payment -->
            <div class="center">
              <div class="payment-method-badge">SPLIT PAYMENT</div>
            </div>
            <div class="split-payment-box">
              <div class="payment-row">
                <span class="bold">💵 Cash Amount:</span>
                <span class="bold">₹${Number(cash_amount).toFixed(2)}</span>
              </div>
              <div class="payment-row">
                <span class="bold">
                  ${online_method === 'qr_code' ? '📱 QR/UPI' :
                    online_method === 'pos_card' ? '💳 POS Card' :
                    online_method === 'credit' ? '💳 Credit Card' : '💰 Online'}:
                </span>
                <span class="bold">₹${Number(online_amount).toFixed(2)}</span>
              </div>
              <div class="payment-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #000;">
                <span class="bold">Total Received:</span>
                <span class="bold">₹${(Number(cash_amount) + Number(online_amount)).toFixed(2)}</span>
              </div>
            </div>
          ` : `
            <!-- Regular Payment -->
            <div class="center">
              <div class="payment-method-badge">
                ${payment_method === 'cash' ? '💵 CASH PAYMENT' :
                  payment_method === 'qr_code' ? '📱 QR/UPI PAYMENT' :
                  payment_method === 'pos_card' ? '💳 POS CARD PAYMENT' :
                  payment_method === 'credit' ? '💳 CREDIT CARD PAYMENT' :
                  payment_method.toUpperCase()}
              </div>
            </div>
            ${payment_method === 'cash' && received_amount ? `
              <div class="payment-row">
                <span>Amount Received:</span>
                <span>₹${Number(received_amount).toFixed(2)}</span>
              </div>
              ${change_amount && Number(change_amount) > 0 ? `
                <div class="payment-row bold">
                  <span>Change:</span>
                  <span>₹${Number(change_amount).toFixed(2)}</span>
                </div>
              ` : ''}
            ` : `
              <div class="payment-row">
                <span>Amount Paid:</span>
                <span>₹${Number(total).toFixed(2)}</span>
              </div>
            `}
          `}

          <div class="payment-row" style="margin-top: 8px;">
            <span class="bold">Payment Status:</span>
            <span class="bold">✓ PAID</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">THANK YOU!</div>
          <div>Visit Again</div>
          <div class="powered-by">Powered by POS System</div>
        </div>

      </div>

      <!-- Include JsBarcode from CDN -->
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <script>
        // Generate barcode
        if (typeof JsBarcode !== 'undefined') {
          JsBarcode("#barcode", "${invoice_no}", {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: true,
            fontSize: 12,
            margin: 5
          });
        }

        // Auto-print after barcode loads
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // Close iframe after printing
            setTimeout(function() {
              window.parent.document.body.removeChild(window.frameElement);
            }, 100);
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printDocument.write(receiptHTML);
  printDocument.close();
};

// Function to format receipt data from sale response
export const formatReceiptData = (saleData, cartItems, paymentDetails = {}) => {
  return {
    shop_name: "My Super Store", // TODO: Get from settings/config
    shop_address: "123 Main Street, City, State - 123456",
    shop_phone: "+91 98765 43210",
    shop_gst: "GSTIN1234567890",
    invoice_no: saleData.invoice_no,
    date: new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    items: cartItems.map(item => ({
      name: item.product_name || item.name,
      qty: item.qty,
      price: item.is_loose ? (item.price_per_unit || item.selling_price) : item.price,
      total: item.is_loose ? Number(item.price) : Number(item.price) * Number(item.qty),
      is_loose: item.is_loose || 0,
      loose_unit: item.loose_unit || null,
      price_per_unit: item.price_per_unit || null,
    })),
    subtotal: saleData.subtotal,
    tax: saleData.tax,
    total: saleData.total,
    payment_method: paymentDetails.payment_method || saleData.payment_method || 'cash',
    cash_amount: paymentDetails.cash_amount || saleData.cash_amount,
    online_amount: paymentDetails.online_amount || saleData.online_amount,
    online_method: paymentDetails.online_method || saleData.online_method,
    received_amount: paymentDetails.received_amount,
    change_amount: paymentDetails.change_amount,
    cashier_name: localStorage.getItem('user_name') || 'Cashier'
  };
};

export default printThermalReceipt;
