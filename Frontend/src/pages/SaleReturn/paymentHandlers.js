import QRCode from "qrcode";
import { confirmExchange, confirmReturn } from "../../services/ReturnService";
import { verifyPayment, createQRPayment, confirmQRPayment } from "../../services/saleService";
import { processPayment } from "../../services/posService";

// Load Razorpay SDK
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Handle Cash Payment for Exchange
export const handleCashExchange = async ({
  saleId,
  cart,
  printInvoice,
  buildExchangeInvoice,
  callbacks
}) => {
  try {
    if (!saleId) {
      alert("Sale ID missing");
      return;
    }

    const return_items = cart
      .filter(item => item.cart_type === "refund")
      .map(item => ({
        sale_item_id: item.sale_item_id || item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        image: item.image || null,
        qty: Number(item.qty) || 0,
        tax: Number(item.tax) || 0,
      }));

    const exchange_items = cart
      .filter(i => i.cart_type === "exchange")
      .map(i => ({
        product_id: i.id,
        product_name: i.product_name,
        image: i.image,
        qty: i.qty,
        price: i.price,
        tax: i.tax,
      }));

    const payload = {
      sale_id: saleId,
      payment_method: "cash",
      return_items,
      exchange_items,
    };

    const result = await confirmExchange(payload);

    if (result.status === true) {
      const diff = result.data.difference;
      if (diff > 0) {
        alert(`Customer pays ₹${diff}`);
      } else if (diff < 0) {
        alert(`Refund ₹${Math.abs(diff)}`);
      } else {
        alert("Even exchange – no payment");
      }

      const invoice = buildExchangeInvoice(result.data, { payment_method: 'cash' });
      printInvoice(invoice);

      callbacks.onSuccess();
    }
  } catch (error) {
    console.error("Cash Exchange Error:", error);
    alert(error.response?.data?.message || error.message);
  }
};

// Handle QR Code Payment for Exchange
export const handleQRExchange = async ({
  saleId,
  cart,
  subtotal,
  tax,
  total,
  callbacks
}) => {
  try {
    if (!saleId) {
      alert("Sale ID missing");
      return;
    }

    const return_items = cart
      .filter(i => i.cart_type === "refund")
      .map(i => ({
        sale_item_id: i.sale_item_id || i.id,
        product_id: i.product_id,
        product_name: i.product_name,
        image: i.image,
        qty: i.qty,
        tax: i.tax,
      }));

    const exchange_items = cart
      .filter(i => i.cart_type === "exchange")
      .map(i => ({
        product_id: i.id,
        product_name: i.product_name,
        image: i.image,
        qty: i.qty,
        price: i.price,
        tax: i.tax,
      }));

    const payload = {
      payment_method: "qr_code",
      subtotal,
      tax,
      total,
      cart: exchange_items,
    };

    const result = await createQRPayment(payload);

    if (result.status) {
      const qrDataUrl = await QRCode.toDataURL(result.data.qrCodeUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      callbacks.onQRGenerated({
        qrCodeData: result.data,
        qrCodeImage: qrDataUrl
      });
    } else {
      alert("Failed to generate QR code");
    }
  } catch (error) {
    console.error("QR Exchange Error:", error);
    alert("Failed to create QR payment");
  }
};

// Handle POS Machine Payment for Exchange
export const handlePOSExchange = async ({
  saleId,
  cart,
  total,
  printInvoice,
  buildExchangeInvoice,
  posConnected,
  callbacks
}) => {
  if (!posConnected) {
    alert('POS device not connected! Please go to Settings > POS Settings to connect your device first.');
    return;
  }

  if (!saleId) {
    alert("Sale ID missing");
    return;
  }

  callbacks.onProcessing(true);

  try {
    const return_items = cart
      .filter(item => item.cart_type === "refund")
      .map(item => ({
        sale_item_id: item.sale_item_id || item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        image: item.image || null,
        qty: Number(item.qty) || 0,
        tax: Number(item.tax) || 0,
      }));

    const exchange_items = cart
      .filter(i => i.cart_type === "exchange")
      .map(i => ({
        product_id: i.id,
        product_name: i.product_name,
        image: i.image,
        qty: i.qty,
        price: i.price,
        tax: i.tax,
      }));

    const payload = {
      sale_id: saleId,
      payment_method: "pos_card",
      return_items,
      exchange_items,
    };

    const exchangeResult = await confirmExchange(payload);

    if (!exchangeResult.status) {
      alert('Failed to create exchange');
      callbacks.onProcessing(false);
      return;
    }

    alert('Please insert, swipe, or tap the customer\'s card on the POS machine...');

    const paymentResult = await processPayment({
      amount: total,
      invoiceNo: exchangeResult.data.invoice_no,
      saleId: exchangeResult.data.id || null
    });

    if (paymentResult.success && paymentResult.data.success) {
      alert(`Payment Approved!\nTransaction ID: ${paymentResult.data.transactionId}\nCard: ${paymentResult.data.cardNumber || 'XXXX'}\nAuth Code: ${paymentResult.data.authCode || 'N/A'}`);

      const invoice = buildExchangeInvoice(exchangeResult.data, { payment_method: 'pos_card' });
      printInvoice(invoice);

      callbacks.onSuccess();
    } else {
      alert('Payment declined or failed. Please try again or use another payment method.');
    }
  } catch (error) {
    console.error('POS Exchange Error:', error);
    alert('Error processing payment: ' + (error.response?.data?.message || error.message));
  } finally {
    callbacks.onProcessing(false);
  }
};

// Handle Credit Card (Razorpay) Payment for Exchange
export const handleCreditExchange = async ({
  saleId,
  cart,
  printInvoice,
  buildExchangeInvoice,
  callbacks
}) => {
  const res = await loadRazorpay();
  if (!res) {
    alert("Razorpay SDK failed to load");
    return;
  }

  if (!saleId) {
    alert("Sale ID missing");
    return;
  }

  try {
    const return_items = cart
      .filter(i => i.cart_type === "refund")
      .map(i => ({
        sale_item_id: i.sale_item_id || i.id,
        product_id: i.product_id,
        product_name: i.product_name,
        image: i.image,
        qty: i.qty,
        tax: i.tax,
      }));

    const exchange_items = cart
      .filter(i => i.cart_type === "exchange")
      .map(i => ({
        product_id: i.id,
        product_name: i.product_name,
        image: i.image,
        qty: i.qty,
        price: i.price,
        tax: i.tax,
      }));

    if (!return_items.length || !exchange_items.length) {
      alert("Return & Exchange items required");
      return;
    }

    const payload = {
      sale_id: saleId,
      payment_method: "credit",
      return_items,
      exchange_items,
    };

    const result = await confirmExchange(payload);

    const options = {
      key: "rzp_test_RvRduZ5UNffoaN",
      amount: result.data.data.amount * 100,
      currency: "INR",
      order_id: result.data.data.razorpayOrderId,
      name: "My POS",

      handler: async function (response) {
        try {
          const data = {
            ...response,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            saleId: result.data.data.saleId,
            amount: result.data.data.amount,
          };

          await verifyPayment(data);
          const invoice = buildExchangeInvoice(result.data, { payment_method: 'credit' });
          printInvoice(invoice);
          callbacks.onSuccess();
        } catch (err) {
          console.error("Payment verification error:", err);
          alert("Payment verification failed");
        }
      },

      theme: {
        color: "#2e86de",
      },
    };

    new window.Razorpay(options).open();
  } catch (error) {
    console.error("Credit Exchange Error:", error.response?.data?.message || error.message);
    alert(error.response?.data?.message || error.message);
  }
};

// Handle Split Payment - Cash + Online (QR/POS/Credit)
export const handleSplitPayment = async ({
  saleId,
  cart,
  cashAmount,
  onlineAmount,
  onlineMethod,
  subtotal,
  tax,
  total,
  posConnected,
  printInvoice,
  buildExchangeInvoice,
  callbacks
}) => {
  try {
    if (!saleId) {
      alert("Sale ID missing");
      return;
    }

    const return_items = cart
      .filter(item => item.cart_type === "refund")
      .map(item => ({
        sale_item_id: item.sale_item_id || item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        image: item.image || null,
        qty: Number(item.qty) || 0,
        tax: Number(item.tax) || 0,
      }));

    const exchange_items = cart
      .filter(i => i.cart_type === "exchange")
      .map(i => ({
        product_id: i.id,
        product_name: i.product_name,
        image: i.image,
        qty: i.qty,
        price: i.price,
        tax: i.tax,
      }));

    const payload = {
      sale_id: saleId,
      payment_method: "split",
      cash_amount: Number(cashAmount),
      online_amount: Number(onlineAmount),
      online_method: onlineMethod,
      return_items,
      exchange_items,
    };

    // Handle based on online method
    if (onlineMethod === 'qr_code') {
      // Generate QR for online amount
      const qrPayload = {
        payment_method: "qr_code",
        subtotal,
        tax,
        total: Number(onlineAmount),
        cart: exchange_items,
      };

      const result = await createQRPayment(qrPayload);

      if (result.status) {
        const qrDataUrl = await QRCode.toDataURL(result.data.qrCodeUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });

        callbacks.onQRGenerated({
          qrCodeData: { ...result.data, cash_amount: Number(cashAmount), online_amount: Number(onlineAmount) },
          qrCodeImage: qrDataUrl
        });
      } else {
        alert("Failed to generate QR code");
      }
    } else if (onlineMethod === 'pos_card') {
      // POS Payment for online amount
      if (!posConnected) {
        alert('POS device not connected!');
        return;
      }

      callbacks.onProcessing(true);

      const exchangeResult = await confirmExchange(payload);

      if (!exchangeResult.status) {
        alert('Failed to create exchange');
        callbacks.onProcessing(false);
        return;
      }

      alert(`Cash received: ₹${cashAmount}\nPlease process card payment for: ₹${onlineAmount}\n\nInsert, swipe, or tap the customer's card...`);

      const paymentResult = await processPayment({
        amount: Number(onlineAmount),
        invoiceNo: exchangeResult.data.invoice_no,
        saleId: exchangeResult.data.id || null
      });

      if (paymentResult.success && paymentResult.data.success) {
        alert(`Split Payment Approved!\nCash: ₹${cashAmount}\nCard: ₹${onlineAmount}\nTransaction ID: ${paymentResult.data.transactionId}`);

        const invoice = buildExchangeInvoice(exchangeResult.data, {
          payment_method: 'split',
          cash_amount: cashAmount,
          online_amount: onlineAmount,
          online_method: 'pos_card'
        });
        printInvoice(invoice);

        callbacks.onSuccess();
      } else {
        alert('Card payment declined.');
      }

      callbacks.onProcessing(false);
    } else if (onlineMethod === 'credit') {
      // Razorpay for online amount
      const res = await loadRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const result = await confirmExchange(payload);

      const options = {
        key: "rzp_test_RvRduZ5UNffoaN",
        amount: Number(onlineAmount) * 100,
        currency: "INR",
        order_id: result.data.data.razorpayOrderId,
        name: "My POS",
        description: `Split Payment - Cash: ₹${cashAmount}, Online: ₹${onlineAmount}`,

        handler: async function (response) {
          try {
            const data = {
              ...response,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              saleId: result.data.data.saleId,
              amount: Number(onlineAmount),
            };

            await verifyPayment(data);
            const invoice = buildExchangeInvoice(result.data, {
              payment_method: 'split',
              cash_amount: cashAmount,
              online_amount: onlineAmount,
              online_method: 'credit'
            });
            printInvoice(invoice);
            callbacks.onSuccess();
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed");
          }
        },

        theme: {
          color: "#2e86de",
        },
      };

      new window.Razorpay(options).open();
    }
  } catch (error) {
    console.error("Split Payment Error:", error);
    alert(error.response?.data?.message || error.message);
  }
};
