import { useEffect, useState } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import JsBarcode from "jsbarcode";
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
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

export default function Cart({ cart, setCart }) {
  const [active, setActive] = useState(""); 
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [mobile, setMobile] = useState("");
  const [openHoldModal, setOpenHoldModal] = useState(false);
  const [openRetrieveModal, setOpenRetrieveModal] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [returnAmount, setReturnAmount] = useState(0);
  const [holdItem, setHoldItem] = useState([]);
  
  // Use custom toast hook
  const { showToast, toastMessage, toastType, showToastNotification } = useToast();
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
    showToastNotification("Enter valid mobile number", "warning");
    return;
  }

const payload={customer_mobile: mobile}

  const result= await retrieveHoldSale(payload);
  if(result.status===true)
  {
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
      tax:item.tax,
      sale_id: saleId
    }))
     );
  setOpenRetrieveModal(false);
  setMobile("");
  }
  } catch(error) {
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
 const tax =  cart.reduce((sum, item) => sum + getItemTaxAmount(item),0);
 const totalTax = cart.reduce((sum, item) => sum + Number(item.tax), 0);
const total = subtotal + tax;


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
  if(result.status===true) {
    setCart([]);
    setMobile("");
    setOpenHoldModal(false);
    showToastNotification("Sale held successfully", "success");
  }
  } catch(error) {
    showToastNotification(error?.message || "Failed to hold sale", "error");
  }
 
};

const buildExchangeInvoice = (apiResult) => {
  return {
    shop_name: apiResult.shop_name || "Dmart",
    invoice_no: apiResult.invoice_no,
    date: new Date().toLocaleString(),
    items: cart.map(item => ({
      name: item.product_name,
      qty: item.qty,
      price: item.price,
      type: item.cart_type, // refund / exchange
      total:
        item.cart_type === "refund"
          ? -item.price * item.qty
          : item.price * item.qty
    })),
    subtotal,
    tax,
    total,
    totalTax: totalTax,
    difference: apiResult.difference,
    message: apiResult.message || `${apiResult.shop_name || "Dmart"} - Tax Invoice`
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
          .shop { text-align: center; font-weight: bold; font-size: 16px; }
          .subtitle { text-align: center; font-size: 12px; color: #333; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 6px 4px; border-bottom: 1px dashed #ddd; }
          th { text-align: left; }
          .right { text-align: right; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          .totals td { padding: 4px 0; }
        </style>

        <!-- JsBarcode CDN -->
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>

      <body>
        <div class="shop">${invoice.shop_name}</div>
        <div class="subtitle">TAX INVOICE</div>
        <p style="text-align:center; margin:6px 0 10px 0;">
          Invoice: ${invoice.invoice_no}<br/>
          <svg id="barcode"></svg><br/>
          Date: ${invoice.date}
        </p>

        <div class="line"></div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="right">Qty</th>
              <th class="right">Price</th>
              <th class="right">Tax</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
          ${invoice.items
            .map(i => {
              const itemTotal = (i.price || 0) * (i.qty || 0);
              const itemTax = (i.tax || 0) ? (itemTotal * (i.tax / 100)) : 0;
              return `
                <tr>
                  <td>${i.name}</td>
                  <td class="right">${i.qty}</td>
                  <td class="right">${Number(i.price).toFixed(2)}</td>
                  <td class="right">${itemTax.toFixed(2)}</td>
                  <td class="right">${(itemTotal + itemTax).toFixed(2)}</td>
                </tr>
              `
            })
            .join("")}
          </tbody>
        </table>

        <div class="line"></div>

        <table class="totals" style="width:100%;">
          <tr>
            <td>Subtotal</td>
            <td class="right">${Number(invoice.subtotal).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Total Tax</td>
            <td class="right">${Number(invoice.tax).toFixed(2)}</td>
          </tr>
          <tr>
            <td><b>Grand Total</b></td>
            <td class="right"><b>${Number(invoice.total).toFixed(2)}</b></td>
          </tr>
        </table>

        <div class="line"></div>

        <p style="text-align:center; margin:8px 0;">${invoice.message || `Thank you for shopping at ${invoice.shop_name}`}</p>

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
      total:item.price*item.tax,
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
  } catch(error) {
    showToastNotification(error?.message || "Failed to load holds", "error");
  }
}

const retrieveItem=async(id)=>{
   try{
  const result= await retrieveHoldItem(id);
  if(result.status===true) {
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
  } catch(error) {
    showToastNotification(error?.message || "Failed to retrieve item", "error");
  }
}

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

const handleRazorpay = async () => {
  try {
    console.log("🔵 Starting Razorpay...");
    
    // Load SDK
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      showToastNotification("Failed to load Razorpay SDK", "error");
      return;
    }
    console.log("✅ SDK ready");

    // Build payload
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

    console.log("📤 Calling checkout_sale...");
    const result = await checkout_sale(payload);
    
    if (!result?.status) {
      showToastNotification(result?.message || "Payment initialization failed", "error");
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

    const amountInPaise = Math.round(amount * 100);
    console.log("💳 Opening Razorpay - Amount:", amountInPaise);

    // Razorpay Options
    const options = {
      key: "rzp_test_RvRduZ5UNffoaN",
      amount: amountInPaise,
      currency: "INR",
      order_id: razorpayOrderId,
      name: "POS System",
      description: `Payment - Order ${razorpayOrderId}`,

      prefill: {
        contact: "9999999999",
      },

      handler: async function (response) {
        console.log("✅ Payment success:", response);
        try {
          // Verify Payment
          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            saleId: saleId,
            amount: amount,
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
    <aside className="cart p-3"  style={{
    flex: 1,
    overflowY: "auto",
    paddingRight: "4px",
  }}>
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
            className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
            style={getButtonStyle("cash")}
            onClick={() => {
    setActive("cash");
    setCashOpen(true);
  }}
          >
            <AttachMoneyIcon style={{ fontSize: 18, marginRight: 5 }} />
            Cash
          </button>

          <button
            className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
            style={getButtonStyle("credit")}
            onClick={() =>{ 
              setActive("credit");
              handleRazorpay();
            }}
          >
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

        {/* Print */}
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-success" onClick={checkoutSale }>
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