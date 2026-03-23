import { useEffect, useState, useRef } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PaymentsIcon from "@mui/icons-material/Payments";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import PosCart from "../../components/Cart/PosCart";
import { useTheme } from "@mui/material/styles";
import {
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

export default function Cart({ cart, setCart }) {
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
    const deleteData = window.confirm('Are you sure you want to delete this item?')
    if (deleteData) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Clear Cart
  const clearCart = () => setCart([]);

  // Retrieve Example (Mock)
  const retrieveCart = async () => {
    try {

      if (mobile.length !== 10) {
        showToastNotification("Enter valid mobile number", "warning");
        return;
      }

      const payload = { customer_mobile: mobile }

      const result = await retrieveHoldSale(payload);
      if (result.status === true) {
        const { items, sale } = result.data;
        const saleId = sale?.id || null;
        setCart(
          items.map(item => ({
            id: item.product_id || item.id,
            product_id: item.product_id || item.id,
            product_name: item.product_name,
            qty: item.qty,
            price: item.price,
            image: item.image,
            tax: item.tax,
            sale_id: saleId
          }))
        );
        setOpenRetrieveModal(false);
        setMobile("");
      }
    } catch (error) {
      showToastNotification(error?.message || "Failed to retrieve sale", "error");
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
  const tax = cart.reduce((sum, item) => sum + getItemTaxAmount(item), 0);
  const totalTax = cart.reduce((sum, item) => sum + Number(item.tax), 0);
  const total = subtotal + tax;


  const submitHoldSale = async () => {
    try {

      if (mobile.length !== 10) {
        showToastNotification("Enter valid mobile number", "warning");
        return;
      }

      if (cart.length === 0) {
        showToastNotification("Cart is empty", "warning");
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
  const payload = {
    payment_method: 'cash',
    subtotal,
    tax,
    total,
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
      payment_method: 'cash',
      received_amount: receivedAmount,
      change_amount: returnAmount
    });

    // Send thank you to customer display
    socket.emit("show-thankyou", { roomId });

    setCashOpen(false);
    setCart([]);
    setReceivedAmount("");
    setReturnAmount(0);
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

  const result= await checkout_sale(payload)
  if(result.status===true) {
    showToastNotification("Sale completed successfully", "success");
    const invoice = buildExchangeInvoice(result.data);
    printInvoice(invoice);
    setCashOpen(false);
    setCart([]);
    setReceivedAmount("");
    setReturnAmount(0);
  }
} catch(error) {
  showToastNotification(error?.message || "Sale failed", "error");
}
};

useEffect(()=>{
  holdlist()
},[])

  const holdlist = async () => {
    try {
      const result = await HoldList()
      if (result.status === true) {
        setHoldItem(result.data)
      }
      else {
        setHoldItem([])
      }
    } catch (error) {
      showToastNotification(error?.message || "Failed to load holds", "error");
    }
  }

  const retrieveItem = async (id) => {
    try {
      const result = await retrieveHoldItem(id);
      if (result.status === true) {
        const { items, sale } = result.data;
        const saleId = sale?.id || id;
        setCart(
          items.map(item => ({
            id: item.product_id || item.id,
            product_id: item.product_id || item.id,
            product_name: item.product_name,
            qty: item.qty,
            price: item.price,
            image: item.image,
            tax: item.tax,
            sale_id: saleId,
          }))
        );
        setOpenRetrieveModal(false);
        setMobile("");
        showToastNotification("Sale retrieved successfully", "success");
      } else {
        showToastNotification("Hold Item Not Found", "warning");
        setOpenRetrieveModal(false);
      }
    } catch (error) {
      showToastNotification(error?.message || "Failed to retrieve item", "error");
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

    console.log("✅ API Success:", result);

    const payloadData = result.data?.data || result.data || {};
    const amount = payloadData.amount || payloadData.total_amount || 0;
    const razorpayOrderId = payloadData.razorpayOrderId || payloadData.razorpay_order_id || payloadData.order_id;
    const saleId = payloadData.saleId || payloadData.sale_id;

    if (!razorpayOrderId || !amount || amount <= 0) {
      console.error("❌ Invalid data:", { razorpayOrderId, amount });
      showToastNotification("Invalid payment data", "error");
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
            console.log("✅ Verified");
            showToastNotification("Payment verified successfully", "success");
            const invoice = buildExchangeInvoice(result.data.saleData || result.data);
            printInvoice(invoice);
            setCashOpen(false);
            setCart([]);
          } else {
            showToastNotification(verifyRes.message || "Payment verification failed", "error");
          }
        } catch (err) {
          console.error('Verification error:', err);
          showToastNotification(err?.message || "Payment verification error", "error");
        }
      },

      theme: {
        color: "#2e86de",
      },
    };

    console.log("🎯 Creating Razorpay instance...");
    const rzp = new window.Razorpay(options);
    console.log("📞 Opening modal...");
    rzp.open();
    console.log("✅ Modal opened");

  } catch (err) {
    console.error('Error:', err);
    showToastNotification(err?.message || "Payment failed", "error");
  }
};

  return (
    <>
      <PosCart
        title="Cart"
        cart={cart}
        deleteItem={deleteItem}
        updateQty={updateQty}
        updatePrice={updatePrice}
        editingPriceId={editingPriceId}
        setEditingPriceId={setEditingPriceId}
        subtotal={subtotal}
        tax={tax}
        total={total}
        totalTax={totalTax}
        checkoutSale={checkoutSale}
        renderPaymentButtons={
          <div className="d-flex gap-2 mt-3  d-flex align-items-center text-dark justify-content-around">
        {/* Discount */}
            <Tooltip title="Apply Discount" placement="top" arrow>
        <button className="btn  d-flex align-items-center justify-content-center no-hover">
                <LocalOfferIcon fontSize="small" />
              </button>
            </Tooltip>

            <Tooltip title="Cash" placement="top" arrow>
              <button className="btn  d-flex align-items-center justify-content-center no-hover"
                style={getButtonStyle("cash")}
                onClick={() => {
                  setActive("cash");
                  setCashOpen(true);
                }}>
                <PaymentsIcon />

              </button>
            </ Tooltip >

            <Tooltip title="Credit" placement="top" arrow>
          <button
            className="btn d-flex align-items-center justify-content-center no-hover"
            style={getButtonStyle("credit")}
            onClick={() => {
              setActive("credit");
              handleRazorpay();
            }}
          >
           <CreditCardIcon />
          </button>
            </ Tooltip >
          </div>
        }
        renderCartOptions={
          <>
    <div className="d-flex flex-row mt-3 gap-3 justify-content-around">
    <Tooltip title="Hold Sale" arrow>
   <button className="btn  pos-icon-btn no-hover" onClick={() => setOpenHoldModal(true)}><PauseCircleFilledIcon /></button>
    </ Tooltip >
    <Tooltip title="Clear Cart" arrow>
      <button className="btn  no-hover" onClick={clearCart}>
        <DeleteSweepIcon />
          </button>
    </ Tooltip >
    <Tooltip title="Retrieve" arrow>
      <button className="btn  no-hover" onClick={() => setOpenRetrieveModal(true)}>
        <UnarchiveIcon />
          </button>
    </ Tooltip >
      </div>
</>
    }
   />

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

          <Button variant="contained" color="primary" onClick={() => submitHoldSale()}>
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
                      <Button size="small" variant="outlined" color="success" onClick={() => retrieveItem(item.id)}>
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

          <Button variant="contained" color="primary" onClick={() => retrieveCart()}>
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

    {/* Toast Notification */}
    <Toast show={showToast} message={toastMessage} type={toastType} />

    </>
  );
}