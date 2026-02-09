import { useEffect, useState } from "react";
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
import { checkout_sale,verifyPayment } from "../../services/saleService";
import {confirmReturn,confirmExchange,verifyManagerAuth} from "../../services/ReturnService";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

export default function SaleReturnCart({ cart, setCart }) {

  const [active, setActive] = useState(""); 
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [mobile, setMobile] = useState("");
  const [openHoldModal, setOpenHoldModal] = useState(false);
  const [openRetrieveModal, setOpenRetrieveModal] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [returnAmount, setReturnAmount] = useState(0);
  const [holdItem, setHoldItem] = useState([]);
  const [showApproval, setShowApproval] = useState(false);
  const [managerUser, setManagerUser] = useState("");
  const [managerPass, setManagerPass] = useState("");
  const [approvalType, setApprovalType] = useState("");
  
  // Use custom toast hook
  const { showToast, toastMessage, toastType, showToastNotification } = useToast(); 
  // Handle Quantity
 const updateQty = (id, type) => {
  setCart((prev) =>
    prev.map((item) => {
      if (item.id !== id) return item;

      const newQty =
        type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1);

      let totalPrice = newQty * item.selling_price; // default

      // ✅ OFFER BLOCK LOGIC (CORRECT)
      if (item.min_qty && item.offer_price && newQty >= item.min_qty) {
        const offerSets = Math.floor(newQty / item.min_qty);
        const remainingQty = newQty % item.min_qty;

        totalPrice =
          offerSets * item.offer_price +
          remainingQty * item.selling_price;
      }

      return {
        ...item,
        qty: newQty,
        price: totalPrice, // 👈 store TOTAL, not per-unit
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

  // ✅ FIXED: Retrieve Cart with proper error handling and notifications
  const retrieveCart = async() => {
     try{

  if (mobile.length !== 10) {
    showToastNotification("Enter valid mobile number", "warning");
    return;
  }

const payload={customer_mobile: mobile}

  const result = await retrieveHoldSale(payload);
  if(result.status === true)
  {
    const { items, sale } = result.data;
    const saleId = sale?.id || null; // 🔥 Extract sale_id from response
    
      setCart(
    items.map(item => ({
      id: item.product_id || item.id,
      product_id: item.product_id || item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      image: item.image,
      tax: item.tax,
      sale_id: saleId  // 🔥 Add sale_id to each item
    }))
     );
  setOpenRetrieveModal(false);
  setMobile("");
  showToastNotification("Sale retrieved successfully", "success");
  } else {
    showToastNotification(result.message || "Failed to retrieve sale", "error");
  }
  }catch(error)
    {
      showToastNotification(error.response?.data?.message || error.message || "Retrieve failed", "error");
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

const mode = cart.some(item => item.cart_type === "exchange")
  ? "exchange"
  : "refund";

const subtotal = cart.reduce((sum, item) => {
  const qty = item.qty || 1;
  const price = Number(item.price);

  // 🔁 REFUND MODE → sab ADD hoga
  if (mode === "refund") {
    return sum + price * qty;
  }

  // 🔄 EXCHANGE MODE
  if (mode === "exchange") {
    if (item.cart_type === "refund") {
      return sum - price * qty;   // 🔴 old item
    }
    return sum + price * qty;     // 🟢 new item
  }

  return sum;
}, 0);
const getItemTaxAmount = (item) => {
  const qty = item.qty || 1;
  const price = Number(item.price) || 0;
  const base = qty * price;
  const taxPercent = Number(item.tax) || 0;

  // In exchange mode, refund items contribute negatively to subtotal
  // so their tax should also be negative. Detect signed contribution:
  const sign = mode === "exchange" && item.cart_type === "refund" ? -1 : 1;
  return sign * (base * taxPercent) / 100;
};

const tax = cart.reduce((sum, item) => sum + getItemTaxAmount(item), 0);

// Determine a sensible tax percent label: if all items share the same tax percent, show it; otherwise leave blank
const uniqueTaxPercents = Array.from(new Set(cart.map(i => Number(i.tax) || 0)));
const totalTax = uniqueTaxPercents.length === 1 ? uniqueTaxPercents[0] : "";

// Determine saleId robustly: prefer explicit `sale_id`/`saleId`/`invoice_no` on items
const saleId = (() => {
  if (!cart || cart.length === 0) return null;

  // Look for explicit properties on any cart item
  for (const it of cart) {
    if (it.sale_id) return it.sale_id;
    if (it.saleId) return it.saleId;
    if (it.invoice_no && it.sale_id) return it.sale_id;
  }

  // Fallback: some flows store sale id on a top-level property
  const first = cart[0];
  return first?.sale_id || first?.saleId || null;
})();

const total = subtotal + tax;

  // ✅ FIXED: submitHoldSale with proper success notification
  const submitHoldSale = async () => {
    try{

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
    saleId,
    subtotal,
    tax,
    total,
    cart: cart.map(item => ({
      product_id: item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      tax: item.tax,
      image: item.image
    }))
  };

  const result = await holdSale(payload);
  if(result.status === true)
  {
     setCart([]);        // clear cart
     setMobile("");      // reset
     setOpenHoldModal(false);
     showToastNotification("Sale held successfully", "success");  // ✅ FIX: Added success notification
  } else {
    showToastNotification(result.message || "Failed to hold sale", "error");
  }
  }catch(error)
    {
      showToastNotification(error.response?.data?.message || error.message || "Hold sale failed", "error");
    }
 
};

const buildExchangeInvoice = (apiData) => {
  // Handle both object and string responses
  const invoiceNo = typeof apiData === 'string' ? apiData : apiData?.invoice_no || apiData?.data?.invoice_no || 'N/A';
  
  return {
    shop_name: "My Super Store",
    invoice_no: invoiceNo,
    date: new Date().toLocaleString(),
    items: cart.map(item => ({
      name: item.product_name,
      qty: item.qty || item.return_qty || 0,
      price: item.price || 0,
      type: item.cart_type, // refund / exchange
      total:
        item.cart_type === "refund"
          ? -item.price * (item.qty || item.return_qty || 0)
          : item.price * (item.qty || item.return_qty || 0)
    })),
    subtotal,
    tax,
    total,
    difference: apiData?.difference || 0
  };
};
let printWindow=null;
const printInvoice = (invoice) => {
  printWindow = window.open("", "_blank", "width=350,height=600");

  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Exchange Invoice</title>
        <style>
          body { font-family: monospace; font-size: 12px; }
          h3, h4 { text-align: center; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 4px 0; }
          .right { text-align: right; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
        </style>

        <!-- JsBarcode CDN -->
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>

      <body>
        <h3>${invoice.shop_name}</h3>
        <h4>Exchange Invoice</h4>

        <p>
          Invoice: ${invoice.invoice_no}<br/>
          <svg id="barcode"></svg><br/>
          Date: ${invoice.date}
        </p>

        <div class="line"></div>

        <table>
          ${invoice.items
            .map(
              i => `
                <tr>
                  <td>${i.name} (${i.qty})</td>
                  <td class="right">${i.total.toFixed(2)}</td>
                </tr>
              `
            )
            .join("")}
        </table>

        <div class="line"></div>

        <table>
          <tr>
            <td>Subtotal</td>
            <td class="right">${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax</td>
            <td class="right">${invoice.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td><b>Total</b></td>
            <td class="right"><b>${invoice.total.toFixed(2)}</b></td>
          </tr>
        </table>

        <div class="line"></div>

        <p style="text-align:center;">
          ${
            invoice.difference > 0
              ? `Customer Pays ₹${invoice.difference}`
              : invoice.difference < 0
              ? `Refund ₹${Math.abs(invoice.difference)}`
              : "Even Exchange"
          }
        </p>

        <p style="text-align:center;">Thank You!</p>

        <script>
          window.onload = function () {
            JsBarcode("#barcode", "${invoice.invoice_no}", {
              format: "CODE128",
              width: 2,
              height: 40,
              displayValue: false
            });

            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

// ✅ FIXED: Improved checkoutSale with better error handling
const checkoutSale = async () => {
  try{
    if (!cart || cart.length === 0) {
      showToastNotification("Cart is empty", "warning");
      return;
    }

    if (mode === "exchange" && !saleId) {
      showToastNotification("Sale ID missing", "warning");
      return;
    }

    const return_items = cart
      .filter(item => item.cart_type === "refund" || mode === "refund")
      .map(item => ({
        sale_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        image: item.image || null,
        qty: Number(item.qty || item.return_qty) || 0,
        tax: Number(item.tax) || 0,
      }));
     
    const exchange_items = cart
      .filter(i => i.cart_type === "exchange")
      .map(i => ({
        product_id: i.id,
        product_name: i.product_name,
        image: i.image,
        qty: i.qty || 0,
        price: i.price || 0,
        tax: i.tax || 0,
      }));

    const payload = {
      sale_id: saleId,
      payment_method: "cash",
      return_items,
      exchange_items,
    };

    const result = await confirmExchange(payload);
    if(result.status === true) {
      const diff = result.data?.difference || 0;
      if (diff > 0) {
        showToastNotification(`Customer pays ₹${Math.abs(diff).toFixed(2)}`, "info");
      } else if (diff < 0) {
        showToastNotification(`Refund ₹${Math.abs(diff).toFixed(2)}`, "info");
      } else {
        showToastNotification("Even exchange – no payment", "info");
      }
      
      const invoice = buildExchangeInvoice(result.data);
      printInvoice(invoice);
      setCashOpen(false);
      setCart([]);
      setReceivedAmount("");
      setReturnAmount(0);
    } else {
      showToastNotification(result.message || "Checkout failed", "error");
    }
  } catch(error) {
    const errorMsg = error.response?.data?.message || error.message || "Checkout failed";
    showToastNotification(errorMsg, "error");
  }
};

useEffect(()=>{
  holdlist()
},[])

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
    const { items, sale } = result.data;
    const saleId = sale?.id || id; // 🔥 Extract sale_id - prefer sale object, fallback to id param
    
      setCart(
    items.map(item => ({
      id: item.product_id || item.id,
      product_id: item.product_id || item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      image: item.image,
      tax: item.tax,
      sale_id: saleId  // 🔥 Add sale_id to each item
    }))
     );
  setOpenRetrieveModal(false);
  setMobile("");
  showToastNotification("Item retrieved successfully", "success");
  } else {
    showToastNotification("Failed to retrieve item", "error");
  }
  }catch(error)
    {
      showToastNotification(error.response?.data?.message || error.message || "Retrieve failed", "error");
    }
}

// ✅ FIXED: Improved handleRefundSave with better error handling
const handleRefundSave = async (manager_id) => {
  try {
    if (!cart || cart.length === 0) {
      showToastNotification("Cart is empty", "warning");
      return;
    }

    const payload = {
      sale_id: saleId,
      return_type: "refund",
      manager_id,
      items: cart.map(item => ({
        sale_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        image: item.image,
        qty: Number(item.return_qty || item.qty) || 0,
        price: item.price || 0,
        tax: item.tax || 0
      }))
    };

    const result = await confirmReturn(payload);
    if(result.status === true) {
      const refundAmt = result.data?.refundAmount || 0;
      showToastNotification(`Refund Amount ₹${refundAmt.toFixed(2)}`, "success");
      const invoice = buildExchangeInvoice(result.data);
      printInvoice(invoice);
      setCart([]);
      setOpenHoldModal(false);
    } else {
      showToastNotification(result.message || "Refund processing failed", "error");
    }
  } catch(error) {
    const errorMsg = error.response?.data?.message || error.message || "Refund processing failed";
    showToastNotification(errorMsg, "error");
  }
};

const verifyManager = async () => {
  try{
    const result = await verifyManagerAuth({
      user_id: managerUser,
      password: managerPass
    });
    if (result.status === true) {
      setShowApproval(false);
       switch (approvalType) { 
      case "refund":
       handleRefundSave(result.data.manager_id);
        break;
      case "exchange":
        setCashOpen(true);
        break;

      case "credit":
        handleRazorpay();  
        break;

      default:
        showToastNotification("Invalid approval type", "error");
    }
  } else {
    showToastNotification(result.message || "Verification failed", "error");
  }
 }catch(error)
 {
  const errorMsg = error.response?.data?.message || error.message || "Verification failed";
  showToastNotification(errorMsg, "error");
 }
};

const loadRazorpay = () => {
  return new Promise((resolve) => {
    // If Razorpay already loaded
    if (window.Razorpay) {
      console.log("✅ Razorpay already loaded");
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    
    script.onload = () => {
      console.log("✅ Razorpay SDK loaded");
      resolve(true);
    };
    
    script.onerror = () => {
      console.error("❌ Failed to load Razorpay");
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

// ✅ FIXED: Simplified handleRazorpay 
const handleRazorpay = async () => {
  try {
    console.log("🔵 Starting Razorpay payment flow...");
    
    // Step 1: Load SDK
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      showToastNotification("Failed to load Razorpay SDK", "error");
      return;
    }
    console.log("✅ SDK ready");

    // Step 2: Validate cart
    if (!Array.isArray(cart) || cart.length === 0) {
      showToastNotification("Cart is empty", "warning");
      return;
    }

    // Step 3: Build payload
    const return_items = cart
      .filter(i => mode === "refund" || i.cart_type === "refund")
      .map(i => ({
        sale_item_id: i.id,
        product_id: i.product_id,
        product_name: i.product_name,
        image: i.image ?? null,
        qty: Number(i.return_qty ?? i.qty ?? 0),
        tax: Number(i.tax ?? 0),
      }))
      .filter(i => i.qty > 0);

    const exchange_items = cart
      .filter(i => i.cart_type === "exchange")
      .map(i => ({
        product_id: i.id,
        product_name: i.product_name,
        image: i.image ?? null,
        qty: Number(i.qty ?? 0),
        price: Number(i.price ?? 0),
        tax: Number(i.tax ?? 0),
      }))
      .filter(i => i.qty > 0);

    const payload = {
      sale_id: saleId,
      payment_method: "credit",
      return_items,
      exchange_items,
    };

    console.log("📤 Exchange payload:", payload);

    // Step 4: Call API
    const result = await confirmExchange(payload);
    
    if (!result?.status) {
      console.error("❌ API Error:", result);
      showToastNotification(result?.message || "Exchange initialization failed", "error");
      return;
    }

    console.log("✅ API Success:", result);

    const data = result.data?.data ?? result.data ?? {};
    const difference = Number(data.difference ?? 0);

    // If no payment needed
    if (difference <= 0) {
      console.log("✅ Even exchange - no payment needed");
      showToastNotification("Exchange completed successfully", "success");
      printInvoice(buildExchangeInvoice(result.data));
      setCart([]);
      setCashOpen(false);
      setShowApproval(false);
      return;
    }

    // Step 5: Extract Razorpay details
    const razorpayOrderId = data.razorpay_order_id || data.razorpayOrderId || data.order_id;
    const amount = Number(data.amount ?? 0);
    const orderId = data.sale_id ?? data.saleId;

    console.log("💳 Razorpay Order:", { razorpayOrderId, amount, orderId });

    if (!razorpayOrderId || amount <= 0) {
      console.error("❌ Invalid payment data:", { razorpayOrderId, amount });
      showToastNotification("Invalid payment data from server", "error");
      return;
    }

    // Step 6: Open Razorpay
    const options = {
      key: "rzp_test_RvRduZ5UNffoaN",
      amount: Math.round(amount * 100),
      currency: "INR",
      order_id: razorpayOrderId,
      name: "POS System",
      description: `Exchange - Order ${razorpayOrderId}`,
      
      prefill: {
        contact: "9999999999",
      },

      handler: async (response) => {
        console.log("✅ Payment response:", response);
        try {
          const verifyResult = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            saleId: orderId,
            amount,
          });

          if (verifyResult?.status) {
            showToastNotification("Payment successful!", "success");
            printInvoice(buildExchangeInvoice(result.data));
            setCart([]);
            setCashOpen(false);
            setShowApproval(false);
          } else {
            showToastNotification("Payment verification failed", "error");
          }
        } catch (err) {
          console.error("❌ Verification error:", err);
          showToastNotification("Payment verification error", "error");
        }
      },

      theme: { color: "#5A8DEE" }
    };

    console.log("🎯 Opening Razorpay with options:", options);
    const rzp = new window.Razorpay(options);
    rzp.open();
    console.log("✅ Modal opened");

  } catch (error) {
    console.error("❌ Error:", error);
    showToastNotification(error?.message || "Payment failed", "error");
  }
};


  return (
    <>
    <aside className="cart p-3" style={{
    flex: 1,
    overflowY: "auto",
    paddingRight: "4px",
  }}>
      <h3 className="fw-bold mb-4" style={{color:"#5A8DEE"}}>Sale Return </h3>

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
             src={item?.image || ""}
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
                   {item.return_qty ? (
                    <span className="fw-bold" style={{ fontSize: "14px" }}>
                      {item.return_qty}
                    </span>
                  ) : (
                    <>
                      <button className="btn btn-sm p-0 px-2" onClick={() => updateQty(item.id, "dec")}>
                        −
                      </button>
                      <span className="fw-bold" style={{ fontSize: "14px" }}>
                        {item.qty}
                      </span>
                      <button className="btn btn-sm p-0 px-2" onClick={() => updateQty(item.id, "inc")}>
                        +
                      </button>
                    </>
                  )}
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
        {total < 0 ? (
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal (Refund)</span>
            <span>₹{Math.abs(Number(subtotal)).toFixed(2)}</span>
          </div>
        ) : (
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>₹{Number(subtotal).toFixed(2)}</span>
          </div>
        )}
        <div className="d-flex justify-content-between mb-2">
          <span>Tax {totalTax !== "" ? `(${totalTax} %)` : ""}</span>
          <span>₹{Math.abs(Number(tax)).toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold border-top pt-3 mt-4">
          <span style={{color:"#5A8DEE"}}>{total < 0 ? "Total Refund" : "Total"}</span>
          <span style={{color:"#5A8DEE"}}>₹{Math.abs(Number(total)).toFixed(2)}</span>
        </div>

        {/* Discount */}
        <button className="btn btn-outline-secondary btn-sm w-100 mt-3 d-flex align-items-center text-dark justify-content-center">
          % Apply Discount
        </button>


          <div className="d-flex gap-2 mt-3">
          <button
            className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
            style={getButtonStyle("cash")} onClick={() => {
                setApprovalType("refund");
                setShowApproval(true);
              }}>
            <AttachMoneyIcon style={{ fontSize: 18, marginRight: 5 }} />
            Refund
          </button>

        </div>

        {/* Payment Buttons */}
        <div className="d-flex gap-2 mt-3">
          <button
            className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
            style={getButtonStyle("cash")}
            onClick={() => {
    setActive("cash");
     setApprovalType("exchange");
    setShowApproval(true);
  }}
          >
            <AttachMoneyIcon style={{ fontSize: 18, marginRight: 5 }} />
            Cash
          </button>

          <button
            className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
            style={getButtonStyle("cash")}
            onClick={() =>{
               setActive("cash")
              setApprovalType("credit");
              setShowApproval(true);
              }} >
            <CreditCardIcon style={{ fontSize: 18, marginRight: 5 }} />
            Credit
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

        {/* Print Receipt */}
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-success" onClick={() => {
            if (cart.length === 0) {
              showToastNotification("Cart is empty. Add items to print receipt.", "warning");
              return;
            }
            checkoutSale();
          }}>
            <PrintIcon style={{ fontSize: 18, marginRight: 5 }} />
            Print Receipt
          </button>
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
    {/* Compute amountDue: positive => customer pays, negative => refund to customer */}
    {total >= 0 ? (
      <>
        <Typography>Total Amount: ₹{Number(total).toFixed(2)}</Typography>

        <TextField
          label="Received Amount"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={receivedAmount}
          onChange={(e) => {
            const raw = e.target.value;
            const val = raw === "" ? "" : Number(raw);
            setReceivedAmount(val);
            setReturnAmount((val === "" ? 0 : val) - total);
          }}
        />

        <Typography sx={{ mt: 2 }} fontWeight="bold">
          Return Amount: ₹{returnAmount > 0 ? returnAmount.toFixed(2) : "0.00"}
        </Typography>
      </>
    ) : (
      <>
        <Typography fontWeight="bold">Refund To Customer: ₹{Math.abs(Number(total)).toFixed(2)}</Typography>
        <Typography sx={{ mt: 2 }} color="text.secondary">
          This is an exchange where the customer should receive a refund. Click below to process refund and print invoice.
        </Typography>
      </>
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setCashOpen(false)}>Cancel</Button>

    <Button
      variant="contained"
      color="success"
      disabled={total >= 0 ? (receivedAmount === "" || Number(receivedAmount) < total) : false}
      onClick={checkoutSale}
    >
      {total >= 0 ? "OK & Print" : "Refund & Print"}
    </Button>
  </DialogActions>
</Dialog>




      <Dialog open={showApproval} onClose={() => setShowApproval(false)}>
  <DialogTitle>Manager Approval Required</DialogTitle>
         <DialogContent>
     <input
    type="text"
    placeholder="Manager Username"
     className="form-control mt-2"
    value={managerUser}
    onChange={e => setManagerUser(e.target.value)}
  />
      </DialogContent>
      <DialogContent>
     <input
    type="password"
    placeholder="Manager Password"
     className="form-control mt-2"
    value={managerPass}
    onChange={e => setManagerPass(e.target.value)}
  />
      </DialogContent>
   <DialogActions>
    <Button onClick={() => setShowApproval(false)}>Cancel</Button>

    <Button variant="contained" color="primary" onClick={() =>verifyManager()}>
     Approve
    </Button>
  </DialogActions>
   
</Dialog>

    {/* Toast Notification */}
    <Toast show={showToast} message={toastMessage} type={toastType} />

    </>
  );
}
