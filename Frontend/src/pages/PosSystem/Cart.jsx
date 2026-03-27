import { useEffect, useState, useRef } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import { Box,
  Typography,
  Paper,
  Modal,
  Tabs,
  Tab,
  Grid,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogActions} from "@mui/material";
import { holdSale,retrieveHoldSale,HoldList,retrieveHoldItem } from "../../services/HoldSaleService";
import { checkout_sale,verifyPayment,createQRPayment,checkQRPaymentStatus,confirmQRPayment } from "../../services/saleService";
import { processPayment, getDeviceStatus } from "../../services/posService";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CircularProgress from "@mui/material/CircularProgress";
import QRCode from "qrcode";
import { printThermalReceipt, formatReceiptData } from "../../utils/thermalPrint";
import socket from "../../socket";
import { useCustomer } from "../../context/CustomerContext";

export default function Cart({ cart, setCart }) {
  const { selectedCustomer, clearCustomer } = useCustomer();
  const roomId = "pos_terminal_1"; // Same room as Dashboard
  const [active, setActive] = useState(""); 
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [mobile, setMobile] = useState("");
const [openHoldModal, setOpenHoldModal] = useState(false);
const [openRetrieveModal, setOpenRetrieveModal] = useState(false);
const [cashOpen, setCashOpen] = useState(false);
const [receivedAmount, setReceivedAmount] = useState("");
const [returnAmount, setReturnAmount] = useState(0);
const [holdItem, setHoldItem] = useState([]);
const [qrModalOpen, setQrModalOpen] = useState(false);
const [qrCodeData, setQrCodeData] = useState(null);
const [paymentStatus, setPaymentStatus] = useState("pending");
const [pollingInterval, setPollingInterval] = useState(null);
const [qrCodeImage, setQrCodeImage] = useState(null);
const qrCanvasRef = useRef(null);
const [posConnected, setPosConnected] = useState(false);
const [posProcessing, setPosProcessing] = useState(false);
const [onlinePaymentOpen, setOnlinePaymentOpen] = useState(false);
const [splitPaymentOpen, setSplitPaymentOpen] = useState(false);
const [cashAmount, setCashAmount] = useState("");
const [onlineAmount, setOnlineAmount] = useState("");
const [splitPaymentMethod, setSplitPaymentMethod] = useState("");
  // Handle Quantity
 const updateQty = (id, action) => {
  setCart((prev) =>
    prev.map((item) => {
      if (item.id !== id) return item;

      const newQty =
        action === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1);
      let totalPrice = newQty * item.selling_price; // default
      if (item.offer_price) {
        if (item.offer_qty_price === "offer_price") {
          totalPrice = newQty * item.offer_price;
        }
        if (
          item.offer_qty_price === "regular" &&
          item.min_qty &&
          newQty >= item.min_qty
        ) {
          const offerTotal = item.min_qty * item.offer_price;
          const remainingQty = newQty - item.min_qty;

          totalPrice =
            offerTotal + remainingQty * item.selling_price;
        }
      }

      return {
        ...item,
        qty: newQty,
        price: totalPrice, // TOTAL price
      };
    })
  );
};

  // Delete Item
  const deleteItem = (id) => {
  const deleteData=window.confirm('Are you sure you want to delete this item?')
    if(deleteData)
  {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }
  };

  // Clear Cart
  const clearCart = () => setCart([]);

  // Retrieve Example (Mock)
  const retrieveCart = async() => {
     try{

  if (mobile.length !== 10) {
    alert("Enter valid mobile number");
    return;
  }

const payload={customer_mobile: mobile}

  const result= await retrieveHoldSale(payload);
  if(result.status===true)
  {
    const { items } = result.data;
      setCart(
    items.map(item => ({
      id: item.product_id || item.id,
      product_id: item.product_id || item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      image: item.image,
      tax:item.tax,
    }))
     );
  setOpenRetrieveModal(false);
  setMobile("");
  }
  }catch(error)
    {
      console.log(error.message)
    } 
  };

  // Payment Button Style
  const getButtonStyle = (type) => ({
    backgroundColor: active === type ? "#5A8DEE" : "transparent",
    color: active === type ? "#fff" : "#000",
  });

  const updatePrice = (id, newPrice) => {
  setCart((prev) =>
    prev.map((item) =>
      item.id === id
        ? { ...item, price: parseFloat(newPrice) || 0 }
        : item
    )
  );
};
  // Totals
  const getItemTaxAmount = (item) => {
  const base = item.qty * item.price;
  const taxPercent = item.tax || 0;
  return (base * taxPercent) / 100;
};
 const subtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
 const tax =  cart.reduce((sum, item) => sum + getItemTaxAmount(item),0);
 const totalTax = cart.reduce((sum, item) => sum + Number(item.tax), 0);
const total = subtotal + tax;


  const submitHoldSale = async () => {
    try{

  if (mobile.length !== 10) {
    alert("Enter valid mobile number");
    return;
  }

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const payload = {
    customer_mobile: mobile,
    subtotal,
    tax,
    total,
    cart: cart.map(item => ({
      product_id: item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      image: item.image,
      tax: item.tax,
    }))
  };

  const result= await holdSale(payload);
  if(result.status===true)
  {
     setCart([]);        // clear cart
  setMobile("");      // reset
  setOpenHoldModal(false);
  }
  }catch(error)
    {
      console.log(error.message)
    }
 
};

// Thermal Print Receipt - Auto prints directly to thermal printer
const printReceipt = (saleData, paymentDetails = {}) => {
  const receiptData = formatReceiptData(
    saleData,
    cart,
    {
      ...paymentDetails,
      received_amount: receivedAmount,
      change_amount: returnAmount
    }
  );

  // Print to thermal printer
  printThermalReceipt(receiptData);
};

const checkoutSale = async () => {
  try{
  // If customer is selected via Aadhaar, auto-complete the order
  const payload = {
    payment_method: selectedCustomer ? 'aadhaar_customer' : 'cash',
    subtotal,
    tax,
    total,
    customer_id: selectedCustomer ? selectedCustomer.id : null,
    customer_name: selectedCustomer ? selectedCustomer.name : null,
    customer_phone: selectedCustomer ? selectedCustomer.phone : null,
    customer_aadhaar: selectedCustomer ? selectedCustomer.aadhaar_no : null,
    cart: cart.map(item => ({
      product_id: item.id,
      product_name: item.product_name,
      qty: item.qty,
      tax: item.tax,
      price: item.price,
      total:item.price*item.qty,
      image: item.image
    }))
  };

  const result= await checkout_sale(payload)
  if(result.status===true)
  {
    // Print thermal receipt
    printReceipt(result.data, {
      payment_method: selectedCustomer ? 'Aadhaar Customer' : 'cash',
      customer_name: selectedCustomer ? selectedCustomer.name : null,
      customer_phone: selectedCustomer ? selectedCustomer.phone : null,
      received_amount: receivedAmount,
      change_amount: returnAmount
    });

    // Send thank you to customer display
    socket.emit("show-thankyou", { roomId });

    setCashOpen(false);
    setCart([]);
    setReceivedAmount("");
    setReturnAmount(0);

    // Clear selected customer after checkout
    if (selectedCustomer) {
      clearCustomer();
    }
  }
}catch(error)
{
  console.log(error.message)
}
};

useEffect(()=>{
  holdlist()
  checkPOSConnection()
},[])

// Check POS device connection status
const checkPOSConnection = async () => {
  try {
    const status = await getDeviceStatus();
    setPosConnected(status.data.connected);
  } catch (error) {
    setPosConnected(false);
  }
};

// Handle POS Card Payment
const handlePOSPayment = async () => {
  if (!posConnected) {
    alert('POS device not connected! Please go to Settings > POS Settings to connect your device first.');
    return;
  }

  if (cart.length === 0) {
    alert('Cart is empty!');
    return;
  }

  setPosProcessing(true);
  setActive("pos");

  try {
    // Step 1: Create sale first with pending status
    const payload = {
      payment_method: 'pos_card',
      subtotal,
      tax,
      total,
      cart: cart.map(item => ({
        product_id: item.id,
        product_name: item.product_name,
        qty: item.qty,
        tax: item.tax,
        price: item.price,
        total: item.price * item.qty,
        image: item.image
      }))
    };

    const saleResult = await checkout_sale(payload);

    if (!saleResult.status) {
      alert('Failed to create sale');
      setPosProcessing(false);
      return;
    }

    // Step 2: Process payment through POS device
    alert('Please insert, swipe, or tap the customer\'s card on the POS machine...');

    const paymentResult = await processPayment({
      amount: total,
      invoiceNo: saleResult.data.invoice_no,
      saleId: saleResult.data.id || null
    });

    if (paymentResult.success && paymentResult.data.success) {
      // Payment approved!
      alert(`Payment Approved!
Transaction ID: ${paymentResult.data.transactionId}
Card: ${paymentResult.data.cardNumber || 'XXXX'}
Auth Code: ${paymentResult.data.authCode || 'N/A'}`);

      // Print thermal receipt
      printReceipt(saleResult.data, { payment_method: 'pos_card' });

      // Send thank you to customer display
      socket.emit("show-thankyou", { roomId });

      // Clear cart
      setCart([]);
      setActive("");
    } else {
      alert('Payment declined or failed. Please try again or use another payment method.');
    }
  } catch (error) {
    console.error('POS payment error:', error);
    alert('Error processing payment: ' + (error.response?.data?.message || error.message));
  } finally {
    setPosProcessing(false);
  }
};

const holdlist=async()=>{
  try{
    const result=await HoldList()
    if(result.status===true)
    {
      setHoldItem(result.data)
    }
    else{
       setHoldItem([])
    }
  }catch(error)
  {
    console.log(error.message)
  }
}

const retrieveItem=async(id)=>{
   try{
  const result= await retrieveHoldItem(id);
  if(result.status===true)
  {
    const { items } = result.data;
      setCart(
     items.map(item => ({
      id: item.product_id || item.id,
      product_id: item.product_id || item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      image: item.image,
      tax: item.tax,
    }))
     );
  setOpenRetrieveModal(false);
  setMobile("");
  }
  else{
    alert("Hold Item Not Found")
  setOpenRetrieveModal(false);
  }
  }catch(error)
    {
      console.log(error.message)
    }
}

 const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handleRazorpay = async () => {
  const res = await loadRazorpay();
  if (!res) {
    alert("Razorpay SDK failed to load");
    return;
  }

  // Step 1: Create Sale + Razorpay Order (Backend)
  const payload = {
    payment_method: "credit",
    subtotal,
    tax,
    total,
    cart: cart.map(item => ({
      product_id: item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      tax: item.tax,
      total: item.price * item.qty,
      image: item.image,
    })),
  };

  const result = await checkout_sale(payload);
  if (!result.status) return;

  // Step 2: Razorpay Options
  const options = {
    key: "rzp_test_RvRduZ5UNffoaN",
    amount: result.data.data.amount * 100,
    currency: "INR",
    order_id: result.data.data.razorpayOrderId,
    name: "My POS",

    handler: async function (response) {
      const invoiceWindow = window.open("", "_blank");
      try {
        // Step 3: Verify Payment
        const verifyPayload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          saleId: result.data.data.saleId,
          amount: result.data.data.amount,
        };

        const verifyRes = await verifyPayment(verifyPayload);
        // ✅ Step 4: Print ONLY if verified
        if (verifyRes.status === true) {
          // Print thermal receipt
          printReceipt(result.data.saleData, { payment_method: 'credit' });

          // Send thank you to customer display
          socket.emit("show-thankyou", { roomId });

          // Reset POS
          setCashOpen(false);
          setCart([]);
        } else {
          alert("Payment verification failed");
        }
      } catch (err) {
        console.error("Verification Error", err);
        alert("Payment verification error");
      }
    },

    theme: {
      color: "#2e86de",
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

const handleQRPayment = async () => {
  try {
    setActive("qr_code");
    setPaymentStatus("pending");

    const payload = {
      subtotal,
      tax,
      total,
      cart: cart.map(item => ({
        product_id: item.id,
        product_name: item.product_name,
        qty: item.qty,
        price: item.price,
        tax: item.tax,
        total: item.price * item.qty,
        image: item.image,
      })),
    };

    const result = await createQRPayment(payload);

    if (result.status) {
      setQrCodeData(result.data);

      // Generate QR code from the payment URL
      const qrDataUrl = await QRCode.toDataURL(result.data.qrCodeUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      setQrCodeImage(qrDataUrl);
      setQrModalOpen(true);
    } else {
      alert("Failed to generate QR code");
    }
  } catch (error) {
    console.error("QR Payment Error:", error);
    alert("Failed to create QR payment: " + (error.response?.data?.message || error.message));
  }
};

const handleConfirmPayment = async () => {
  try {
    if (!qrCodeData) return;

    setPaymentStatus("confirming");

    const confirmResult = await confirmQRPayment({
      saleId: qrCodeData.saleId
    });

    if (confirmResult.status) {
      setPaymentStatus("paid");

      // Print thermal receipt
      setTimeout(() => {
        // Check if it's split payment
        const paymentDetails = qrCodeData.cash_amount && qrCodeData.online_amount
          ? {
              payment_method: 'split',
              cash_amount: qrCodeData.cash_amount,
              online_amount: qrCodeData.online_amount,
              online_method: 'qr_code'
            }
          : { payment_method: 'qr_code' };

        printReceipt(qrCodeData.saleData, paymentDetails);

        // Send thank you to customer display
        socket.emit("show-thankyou", { roomId });

        // Reset and close
        setQrModalOpen(false);
        setCart([]);
        setQrCodeData(null);
        setQrCodeImage(null);
        setPaymentStatus("pending");
      }, 1000);
    } else {
      alert("Failed to confirm payment. Please try again.");
      setPaymentStatus("pending");
    }
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    alert("Error confirming payment");
    setPaymentStatus("pending");
  }
};

const closeQRModal = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    setPollingInterval(null);
  }
  setQrModalOpen(false);
  setQrCodeData(null);
  setQrCodeImage(null);
  setPaymentStatus("pending");
  setActive("");
};

// Handle Split Payment - QR Code
const handleSplitQRPayment = async () => {
  try {
    setPaymentStatus("pending");

    const payload = {
      payment_method: 'split',
      cash_amount: Number(cashAmount),
      online_amount: Number(onlineAmount),
      online_method: 'qr_code',
      subtotal,
      tax,
      total, // Keep the full total amount (cash + online)
      cart: cart.map(item => ({
        product_id: item.id,
        product_name: item.product_name,
        qty: item.qty,
        price: item.price,
        tax: item.tax,
        total: item.price * item.qty,
        image: item.image,
      })),
    };

    // Send the complete payload without overriding the total
    const result = await createQRPayment(payload);

    if (result.status) {
      setQrCodeData({ ...result.data, cash_amount: Number(cashAmount), online_amount: Number(onlineAmount) });

      const qrDataUrl = await QRCode.toDataURL(result.data.qrCodeUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      setQrCodeImage(qrDataUrl);
      setSplitPaymentOpen(false);
      setQrModalOpen(true);
    } else {
      alert("Failed to generate QR code");
    }
  } catch (error) {
    console.error("Split QR Payment Error:", error);
    alert("Failed to create split QR payment");
  }
};

// Handle Split Payment - POS Machine
const handleSplitPOSPayment = async () => {
  if (!posConnected) {
    alert('POS device not connected! Please go to Settings > POS Settings to connect your device first.');
    return;
  }

  setPosProcessing(true);

  try {
    const payload = {
      payment_method: 'split',
      cash_amount: Number(cashAmount),
      online_amount: Number(onlineAmount),
      online_method: 'pos_card',
      subtotal,
      tax,
      total,
      cart: cart.map(item => ({
        product_id: item.id,
        product_name: item.product_name,
        qty: item.qty,
        tax: item.tax,
        price: item.price,
        total: item.price * item.qty,
        image: item.image
      }))
    };

    const saleResult = await checkout_sale(payload);

    if (!saleResult.status) {
      alert('Failed to create sale');
      setPosProcessing(false);
      return;
    }

    alert(`Cash received: ₹${cashAmount}\nPlease process card payment for: ₹${onlineAmount}\n\nInsert, swipe, or tap the customer's card on the POS machine...`);

    const paymentResult = await processPayment({
      amount: Number(onlineAmount),
      invoiceNo: saleResult.data.invoice_no,
      saleId: saleResult.data.id || null
    });

    if (paymentResult.success && paymentResult.data.success) {
      alert(`Split Payment Approved!\nCash: ₹${cashAmount}\nCard: ₹${onlineAmount}\nTransaction ID: ${paymentResult.data.transactionId}`);

      // Print thermal receipt
      printReceipt(saleResult.data, {
        payment_method: 'split',
        cash_amount: cashAmount,
        online_amount: onlineAmount,
        online_method: 'pos_card'
      });

      // Send thank you to customer display
      socket.emit("show-thankyou", { roomId });

      setCart([]);
      setSplitPaymentOpen(false);
      setCashAmount("");
      setOnlineAmount("");
      setActive("");
    } else {
      alert('Card payment declined. Please try again or use another payment method.');
    }
  } catch (error) {
    console.error('Split POS payment error:', error);
    alert('Error processing split payment: ' + (error.response?.data?.message || error.message));
  } finally {
    setPosProcessing(false);
  }
};

// Handle Split Payment - Credit Card (Razorpay)
const handleSplitCreditPayment = async () => {
  const res = await loadRazorpay();
  if (!res) {
    alert("Razorpay SDK failed to load");
    return;
  }

  const payload = {
    payment_method: "split",
    cash_amount: Number(cashAmount),
    online_amount: Number(onlineAmount),
    online_method: 'credit',
    subtotal,
    tax,
    total,
    cart: cart.map(item => ({
      product_id: item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      tax: item.tax,
      total: item.price * item.qty,
      image: item.image,
    })),
  };

  const result = await checkout_sale(payload);
  if (!result.status) return;

  const options = {
    key: "rzp_test_RvRduZ5UNffoaN",
    amount: Number(onlineAmount) * 100,
    currency: "INR",
    order_id: result.data.data.razorpayOrderId,
    name: "My POS",
    description: `Split Payment - Cash: ₹${cashAmount}, Online: ₹${onlineAmount}`,

    handler: async function (response) {
      try {
        const verifyPayload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          saleId: result.data.data.saleId,
          amount: Number(onlineAmount),
        };

        const verifyRes = await verifyPayment(verifyPayload);

        if (verifyRes.status === true) {
          // Print thermal receipt
          printReceipt(result.data.saleData, {
            payment_method: 'split',
            cash_amount: cashAmount,
            online_amount: onlineAmount,
            online_method: 'credit'
          });

          // Send thank you to customer display
          socket.emit("show-thankyou", { roomId });

          setSplitPaymentOpen(false);
          setCart([]);
          setCashAmount("");
          setOnlineAmount("");
          setActive("");
        } else {
          alert("Payment verification failed");
        }
      } catch (err) {
        console.error("Verification Error", err);
        alert("Payment verification error");
      }
    },

    theme: {
      color: "#2e86de",
    },
  };

  setSplitPaymentOpen(false);
  const rzp = new window.Razorpay(options);
  rzp.open();
};

  return (
    <>
    <aside className="cart p-3">
      <h3 className="fw-bold mb-4" style={{color:"#5A8DEE"}}>Cart</h3>

      {/* Product List */}
      <div className="mt-1">
        {cart.map((item) => (
          <div
            key={item.id}
            className="d-flex p-3 rounded-3 mb-3"
            style={{
              background: "#ffffff",
              border: "1px solid #e6e6e6",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              alignItems: "center",
            }}
          >
           <img
             src={item.image}
              alt="product"
              className="rounded-3"
              style={{ width: 55, height: 55, objectFit: "cover" }}
            /> 

            <div className="ms-3 flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-semibold mb-1" style={{ fontSize: "15px" }}>
                    {item.product_name}
                  </h6>
                  {/* <span className="text-muted" style={{ fontSize: "12px" }}>
                    {item.category} • SKU: {item.sku}
                  </span> */}
                </div>

                <button className="btn p-1 text-danger" onClick={() => deleteItem(item.id)}>
                  <DeleteIcon fontSize="small" />
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                {/* Quantity */}
                <div
                  className="d-flex align-items-center rounded-pill px-2 py-1"
                  style={{
                    border: "1px solid #dcdcdc",
                    width: "90px",
                    justifyContent: "space-between",
                    height: "32px",
                  }}
                >
                  <button className="btn btn-sm p-0 px-2" onClick={() => updateQty(item.id, "dec")}>
                    −
                  </button>
                  <span className="fw-bold" style={{ fontSize: "14px" }}>
                    {item.qty}
                  </span>
                  <button className="btn btn-sm p-0 px-2" onClick={() => updateQty(item.id, "inc")}>
                    +
                  </button>
                </div>

                {/* Price */}
               {/* Price */}
<div className="d-flex align-items-center gap-2">
  {editingPriceId === item.id ? (
    <input
      type="number"
      className="form-control form-control-sm"
      style={{ width: "80px" }}
      value={item.price}
      autoFocus
      onChange={(e) => updatePrice(item.id, e.target.value)}
      onBlur={() => setEditingPriceId(null)}
      onKeyDown={(e) => e.key === "Enter" && setEditingPriceId(null)}
    />
  ) : (
    <h6 className="fw-bold mb-0" style={{ fontSize: "15px" }}>
      ₹{item.price}
    </h6>
  )}

  <button
    className="btn btn-sm p-0 text-primary"
    onClick={() => setEditingPriceId(item.id)}
  >
    <EditIcon fontSize="small" />
  </button>
</div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-top pt-3 mt-4">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <span>₹{Number(subtotal).toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Tax ({`${totalTax} %`})</span>
          <span>₹{Number(tax).toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold border-top pt-3 mt-4">
          <span style={{color:"#5A8DEE"}}>Total</span>
          <span style={{color:"#5A8DEE"}}>₹{total.toFixed(2)}</span>
        </div>

        {/* Discount */}
        <button className="btn btn-outline-secondary btn-sm w-100 mt-3 d-flex align-items-center text-dark justify-content-center">
          % Apply Discount
        </button>

        {/* Payment Buttons */}
        <div className="d-flex gap-2 mt-3">
          <button
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
            style={{...getButtonStyle("cash"), flex: 1}}
            onClick={() => {
              setActive("cash");
              setCashOpen(true);
            }}
          >
            <AttachMoneyIcon style={{ fontSize: 18, marginRight: 5 }} />
            Cash
          </button>

          <button
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
            style={{...getButtonStyle("online"), flex: 1}}
            onClick={() => setOnlinePaymentOpen(true)}
          >
            <CreditCardIcon style={{ fontSize: 18, marginRight: 5 }} />
            Online
          </button>
        </div>

        {/* Cash + Online Split Payment Button */}
        <div className="d-grid gap-2 mt-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center justify-content-center"
            style={{...getButtonStyle("split")}}
            onClick={() => {
              setActive("split");
              setSplitPaymentOpen(true);
              setCashAmount("");
              setOnlineAmount("");
              setSplitPaymentMethod("");
            }}
          >
            <AttachMoneyIcon style={{ fontSize: 18, marginRight: 5 }} />
            <CreditCardIcon style={{ fontSize: 18, marginRight: 5 }} />
            Cash + Online
          </button>
        </div>

        {/* Cart Options */}
        <div className="d-flex flex-row mt-3 gap-3 justify-content-center">
          <button className="btn btn-outline-secondary text-dark" onClick={() => setOpenHoldModal(true)}>Hold Sale</button>
          <button className="btn btn-outline-secondary text-dark" onClick={clearCart}>
            Clear Cart
          </button>
          <button className="btn btn-outline-secondary text-dark" onClick={() => setOpenRetrieveModal(true)}>
            Retrieve
          </button>
        </div>

        {/* Print / Checkout Button */}
        <div className="d-grid gap-2 mt-3">
          {selectedCustomer ? (
            // For Aadhaar customers - direct checkout without payment selection
            <button
              className="btn btn-success"
              onClick={checkoutSale}
              disabled={cart.length === 0}
            >
              <PrintIcon style={{ fontSize: 18, marginRight: 5 }} />
              Complete Order for {selectedCustomer.name}
            </button>
          ) : (
            // For regular customers - show print receipt
            <button className="btn btn-success" onClick={checkoutSale }>
              <PrintIcon style={{ fontSize: 18, marginRight: 5 }} />
              Print Receipt
            </button>
          )}
        </div>
      </div>
    </aside>



    <Dialog open={openHoldModal} onClose={() => setOpenHoldModal(false)}>
  <DialogTitle>Hold Sale</DialogTitle>
         <DialogContent>
    <input
      type="text"
      className="form-control mt-2"
      placeholder="Enter Mobile Number"
      value={mobile}
      maxLength={10}
      onChange={(e) => setMobile(e.target.value)}
    />
      </DialogContent>
   <DialogActions>
    <Button onClick={() => setOpenHoldModal(false)}>Cancel</Button>

    <Button variant="contained" color="primary" onClick={()=>submitHoldSale()}>
      Confirm Hold
    </Button>
  </DialogActions>
   
</Dialog>

 <Dialog open={openRetrieveModal} onClose={() => setOpenRetrieveModal(false)}>
  <DialogTitle>Retrieve</DialogTitle>
         <DialogContent>
    <input
      type="text"
      className="form-control mt-2"
      placeholder="Enter Mobile Number"
      value={mobile}
      maxLength={10}
      onChange={(e) => setMobile(e.target.value)}
    />
      </DialogContent>
       {holdItem.length > 0 && (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
          <TableCell><b>Mobile</b></TableCell>
          <TableCell><b>Item Count</b></TableCell>
          <TableCell align="center"><b>Total</b></TableCell>
          <TableCell align="center"><b>DateTime</b></TableCell>
          <TableCell align="center"><b>Cashier Name</b></TableCell>
          <TableCell align="center"><b>Status</b></TableCell>
        </TableRow>
      </TableHead>

     <TableBody>
         {holdItem.map(item => (
    <TableRow>
      <TableCell>{item.customer_mobile}</TableCell>
      <TableCell>{item.total_items}</TableCell>
      <TableCell align="center">{item.total}</TableCell>
      <TableCell align="center">{item.datetime}  
      </TableCell>
      <TableCell align="center">{item.name} 
      </TableCell>
       <TableCell align="center">
        <Button size="small" variant="outlined" color="success" onClick={() =>retrieveItem(item.id)}>
            Retrieve
          </Button>
      </TableCell>
    </TableRow>
   ))}
</TableBody>

    </Table>
  </TableContainer>
  )}
   <DialogActions>
    <Button onClick={() => setOpenRetrieveModal(false)}>Cancel</Button>

    <Button variant="contained" color="primary" onClick={()=>retrieveCart()}>
     Retrieve
    </Button>
  </DialogActions>
   
</Dialog>

<Dialog open={cashOpen} onClose={() => setCashOpen(false)}>
  <DialogTitle>Cash Payment</DialogTitle>

  <DialogContent>
    <Typography>Total Amount: ₹{Number(total).toFixed(2)}</Typography>

    <TextField
      label="Received Amount"
      type="number"
      fullWidth
      sx={{ mt: 2 }}
      value={receivedAmount}
      onChange={(e) => {
        const val = Number(e.target.value);
        setReceivedAmount(val);
        setReturnAmount(val - total);
      }}
    />

    <Typography sx={{ mt: 2 }} fontWeight="bold">
      Return Amount: ₹{returnAmount > 0 ? returnAmount.toFixed(2) : "0.00"}
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setCashOpen(false)}>Cancel</Button>

    <Button
      variant="contained"
      color="success"
      disabled={receivedAmount < total}
      onClick={checkoutSale}
    >
      OK & Print
    </Button>
  </DialogActions>
</Dialog>

{/* Online Payment Options Modal */}
<Dialog open={onlinePaymentOpen} onClose={() => setOnlinePaymentOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Select Online Payment Method</DialogTitle>
  <DialogContent>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>

      {/* Credit Card / Razorpay */}
      <Button
        variant="outlined"
        size="large"
        fullWidth
        startIcon={<CreditCardIcon />}
        onClick={() => {
          setOnlinePaymentOpen(false);
          setActive("credit");
          handleRazorpay();
        }}
        sx={{
          justifyContent: 'flex-start',
          py: 2,
          px: 3,
          textTransform: 'none',
          borderColor: '#5A8DEE',
          color: '#5A8DEE',
          '&:hover': {
            borderColor: '#5A8DEE',
            backgroundColor: '#f0f4ff',
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
          <Typography variant="body1" fontWeight="600">Credit Card</Typography>
          <Typography variant="caption" color="text.secondary">Pay via Razorpay Gateway</Typography>
        </Box>
      </Button>

      {/* QR Code Payment */}
      <Button
        variant="outlined"
        size="large"
        fullWidth
        startIcon={<QrCode2Icon />}
        onClick={() => {
          setOnlinePaymentOpen(false);
          handleQRPayment();
        }}
        sx={{
          justifyContent: 'flex-start',
          py: 2,
          px: 3,
          textTransform: 'none',
          borderColor: '#28a745',
          color: '#28a745',
          '&:hover': {
            borderColor: '#28a745',
            backgroundColor: '#f0fff4',
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
          <Typography variant="body1" fontWeight="600">QR Code / UPI</Typography>
          <Typography variant="caption" color="text.secondary">Scan QR to pay via UPI</Typography>
        </Box>
      </Button>

      {/* POS Machine */}
      <Button
        variant="outlined"
        size="large"
        fullWidth
        startIcon={posProcessing ? <CircularProgress size={20} /> : <CreditCardIcon />}
        onClick={() => {
          setOnlinePaymentOpen(false);
          handlePOSPayment();
        }}
        disabled={!posConnected || posProcessing}
        sx={{
          justifyContent: 'flex-start',
          py: 2,
          px: 3,
          textTransform: 'none',
          borderColor: posConnected ? '#ff6b6b' : '#999',
          color: posConnected ? '#ff6b6b' : '#999',
          '&:hover': {
            borderColor: posConnected ? '#ff6b6b' : '#999',
            backgroundColor: posConnected ? '#fff5f5' : '#f5f5f5',
          },
          '&:disabled': {
            borderColor: '#ddd',
            color: '#999',
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
          <Typography variant="body1" fontWeight="600">
            POS Machine {!posConnected && '⚠️'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {posConnected ? 'Card swipe/chip/contactless' : 'POS device not connected'}
          </Typography>
        </Box>
      </Button>

    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOnlinePaymentOpen(false)}>Cancel</Button>
  </DialogActions>
</Dialog>

<Dialog
  open={qrModalOpen}
  onClose={closeQRModal}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
    <QrCode2Icon sx={{ fontSize: 40, color: '#5A8DEE', mb: 1 }} />
    <Typography variant="h5" fontWeight="bold">
      Scan QR Code to Pay
    </Typography>
  </DialogTitle>

  <DialogContent sx={{ textAlign: 'center', py: 3 }}>
    {qrCodeData && (
      <>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: '#f8f9fa',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Invoice: {qrCodeData.invoice_no}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="#5A8DEE" sx={{ mb: 2 }}>
            ₹{Number(qrCodeData.amount).toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Items: {cart.length}
          </Typography>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            p: 2,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {qrCodeImage ? (
            <img
              src={qrCodeImage}
              alt="QR Code"
              style={{
                width: '400px',
                height: '400px',
                objectFit: 'contain'
              }}
            />
          ) : (
            <CircularProgress size={60} />
          )}
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: paymentStatus === 'paid' ? '#d4edda' : paymentStatus === 'confirming' ? '#cce5ff' : '#fff3cd',
            borderRadius: 2,
            border: `2px solid ${paymentStatus === 'paid' ? '#28a745' : paymentStatus === 'confirming' ? '#007bff' : '#ffc107'}`
          }}
        >
          {paymentStatus === 'pending' && (
            <Box>
              <Typography variant="body1" fontWeight="bold" color="#856404" sx={{ mb: 2, textAlign: 'center' }}>
                Scan QR code with any UPI app to pay
              </Typography>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                onClick={handleConfirmPayment}
                sx={{ mt: 1 }}
              >
                I Have Paid - Confirm Payment
              </Button>
            </Box>
          )}

          {paymentStatus === 'confirming' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <CircularProgress size={24} sx={{ color: '#007bff' }} />
              <Typography variant="body1" fontWeight="bold" color="#004085">
                Confirming payment...
              </Typography>
            </Box>
          )}

          {paymentStatus === 'paid' && (
            <Typography variant="body1" fontWeight="bold" color="#155724">
              ✓ Payment Successful! Printing receipt...
            </Typography>
          )}
        </Paper>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          1. Scan QR code with GPay/PhonePe/Paytm
          2. Complete the payment
          3. Click "I Have Paid" button above
        </Typography>
      </>
    )}
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button
      onClick={closeQRModal}
      variant="outlined"
      disabled={paymentStatus === 'paid'}
    >
      Cancel
    </Button>
  </DialogActions>
</Dialog>

{/* Split Payment Modal */}
<Dialog open={splitPaymentOpen} onClose={() => setSplitPaymentOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Split Payment (Cash + Online)</DialogTitle>
  <DialogContent>
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#5A8DEE', fontWeight: 'bold' }}>
        Total Amount: ₹{Number(total).toFixed(2)}
      </Typography>

      <TextField
        label="Cash Amount"
        type="number"
        fullWidth
        value={cashAmount}
        onChange={(e) => {
          const cash = Number(e.target.value);
          setCashAmount(e.target.value);
          if (cash > 0 && cash < total) {
            setOnlineAmount((total - cash).toFixed(2));
          } else if (cash >= total) {
            setCashAmount(total.toFixed(2));
            setOnlineAmount("0");
          } else {
            setOnlineAmount("");
          }
        }}
        sx={{ mb: 2 }}
        inputProps={{ min: 0, max: total, step: 0.01 }}
        helperText={`Maximum: ₹${total.toFixed(2)}`}
      />

      <TextField
        label="Online Payment Amount (Remaining)"
        type="number"
        fullWidth
        value={onlineAmount}
        disabled
        sx={{ mb: 3 }}
        InputProps={{
          readOnly: true,
        }}
      />

      {Number(cashAmount) > 0 && Number(onlineAmount) > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Select Online Payment Method for ₹{Number(onlineAmount).toFixed(2)}:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* QR Code Payment */}
            <Button
              variant={splitPaymentMethod === 'qr' ? 'contained' : 'outlined'}
              size="large"
              fullWidth
              startIcon={<QrCode2Icon />}
              onClick={() => setSplitPaymentMethod('qr')}
              sx={{
                justifyContent: 'flex-start',
                py: 2,
                px: 3,
                textTransform: 'none',
                borderColor: '#28a745',
                color: splitPaymentMethod === 'qr' ? '#fff' : '#28a745',
                backgroundColor: splitPaymentMethod === 'qr' ? '#28a745' : 'transparent',
                '&:hover': {
                  borderColor: '#28a745',
                  backgroundColor: splitPaymentMethod === 'qr' ? '#218838' : '#f0fff4',
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
                <Typography variant="body1" fontWeight="600">QR Code / UPI</Typography>
                <Typography variant="caption" color={splitPaymentMethod === 'qr' ? 'inherit' : 'text.secondary'}>
                  Scan QR to pay remaining ₹{Number(onlineAmount).toFixed(2)}
                </Typography>
              </Box>
            </Button>

            {/* POS Machine */}
            <Button
              variant={splitPaymentMethod === 'pos' ? 'contained' : 'outlined'}
              size="large"
              fullWidth
              startIcon={<CreditCardIcon />}
              onClick={() => setSplitPaymentMethod('pos')}
              disabled={!posConnected}
              sx={{
                justifyContent: 'flex-start',
                py: 2,
                px: 3,
                textTransform: 'none',
                borderColor: posConnected ? '#ff6b6b' : '#999',
                color: splitPaymentMethod === 'pos' ? '#fff' : (posConnected ? '#ff6b6b' : '#999'),
                backgroundColor: splitPaymentMethod === 'pos' ? '#ff6b6b' : 'transparent',
                '&:hover': {
                  borderColor: posConnected ? '#ff6b6b' : '#999',
                  backgroundColor: splitPaymentMethod === 'pos' ? '#e63946' : (posConnected ? '#fff5f5' : '#f5f5f5'),
                },
                '&:disabled': {
                  borderColor: '#ddd',
                  color: '#999',
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
                <Typography variant="body1" fontWeight="600">
                  POS Machine {!posConnected && '⚠️'}
                </Typography>
                <Typography variant="caption" color={splitPaymentMethod === 'pos' ? 'inherit' : 'text.secondary'}>
                  {posConnected ? `Card payment for ₹${Number(onlineAmount).toFixed(2)}` : 'POS device not connected'}
                </Typography>
              </Box>
            </Button>

            {/* Credit Card / Razorpay */}
            <Button
              variant={splitPaymentMethod === 'credit' ? 'contained' : 'outlined'}
              size="large"
              fullWidth
              startIcon={<CreditCardIcon />}
              onClick={() => setSplitPaymentMethod('credit')}
              sx={{
                justifyContent: 'flex-start',
                py: 2,
                px: 3,
                textTransform: 'none',
                borderColor: '#5A8DEE',
                color: splitPaymentMethod === 'credit' ? '#fff' : '#5A8DEE',
                backgroundColor: splitPaymentMethod === 'credit' ? '#5A8DEE' : 'transparent',
                '&:hover': {
                  borderColor: '#5A8DEE',
                  backgroundColor: splitPaymentMethod === 'credit' ? '#4a7dd8' : '#f0f4ff',
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
                <Typography variant="body1" fontWeight="600">Credit Card (Razorpay)</Typography>
                <Typography variant="caption" color={splitPaymentMethod === 'credit' ? 'inherit' : 'text.secondary'}>
                  Pay ₹{Number(onlineAmount).toFixed(2)} via Razorpay
                </Typography>
              </Box>
            </Button>
          </Box>
        </>
      )}
    </Box>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => {
      setSplitPaymentOpen(false);
      setCashAmount("");
      setOnlineAmount("");
      setSplitPaymentMethod("");
    }}>
      Cancel
    </Button>

    <Button
      variant="contained"
      color="success"
      disabled={!cashAmount || !onlineAmount || !splitPaymentMethod || Number(cashAmount) <= 0 || Number(onlineAmount) <= 0}
      onClick={() => {
        if (splitPaymentMethod === 'qr') {
          handleSplitQRPayment();
        } else if (splitPaymentMethod === 'pos') {
          handleSplitPOSPayment();
        } else if (splitPaymentMethod === 'credit') {
          handleSplitCreditPayment();
        }
      }}
    >
      Proceed to Payment
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
}