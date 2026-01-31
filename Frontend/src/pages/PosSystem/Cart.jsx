import { useEffect, useState } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { QRCodeSVG } from 'qrcode.react';
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
  DialogActions,
  IconButton} from "@mui/material";
import { holdSale,retrieveHoldSale,HoldList,retrieveHoldItem } from "../../services/HoldSaleService";
import { checkout_sale,verifyPayment } from "../../services/saleService";

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
const [qrCodeData, setQrCodeData] = useState(null);
const [enlargedQR, setEnlargedQR] = useState(false);
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
      id: item.product_id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      image: item.image
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

const buildExchangeInvoice = (apiResult) => {
  return {
    shop_name: "My Super Store",
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
    difference: apiResult.difference
  };
};

let printWindow = null;
const printInvoice = (invoice) => {
   if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Exchange Invoice</title>
        <style>
          body { font-family: monospace; font-size: 12px; }
          h3, h4 { text-align: center; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 4px 0; }
          .right { text-align: right; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        <h3>${invoice.shop_name}</h3>
        <h4>Exchange Invoice</h4>
        <p>
          Invoice: ${invoice.invoice_no}<br/>
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
            <td>Tax(%)</td>
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
          window.print();
          window.close();
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
  if(result.status===true)
  {
  //alert("Sale completed");
  const invoice = buildExchangeInvoice(result.data);
    printInvoice(invoice);
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
    const { items } = result.data;
      setCart(
     items.map(item => ({
      id: item.product_id || item.id,
      product_id: item.id,
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
  console.log("🚀 handleRazorpay called!");

  printWindow = window.open("", "_blank", "width=350");

  if (!printWindow) {
    alert("Please allow popups");
    return;
  }

  await loadRazorpay();

  const payload = {
    payment_method: 'credit',
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
      image: item.image
    }))
  };

  console.log("📦 Sending payload:", payload);
  const result = await checkout_sale(payload);
  console.log("✅ Got result:", result);

  // Store payment data
  const tempPaymentData = {
    saleId: result.data.data.saleId,
    amount: result.data.data.amount,
    saleData: result.data.saleData,
    orderId: result.data.data.razorpayOrderId
  };
  console.log("💾 Payment data:", tempPaymentData);

  // Generate UPI payment string for QR code
  const upiString = `upi://pay?pa=yourvpa@bank&pn=My POS&am=${result.data.data.amount}&cu=INR&tn=Payment for Order ${result.data.data.razorpayOrderId}`;
  setQrCodeData(upiString);

  // Create floating "View QR Code" button overlay
  const createQRButton = () => {
    const buttonOverlay = document.createElement('div');
    buttonOverlay.id = 'qr-button-overlay';
    buttonOverlay.style.cssText = `
      position: fixed;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000001;
      padding: 14px 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      animation: pulse 2s infinite;
    `;

    buttonOverlay.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      View QR Code
    `;

    buttonOverlay.onmouseover = () => {
      buttonOverlay.style.transform = 'translateX(-50%) scale(1.05)';
      buttonOverlay.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.6)';
    };

    buttonOverlay.onmouseout = () => {
      buttonOverlay.style.transform = 'translateX(-50%) scale(1)';
      buttonOverlay.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
    };

    buttonOverlay.onclick = () => {
      setEnlargedQR(true);
    };

    // Add pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.85; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(buttonOverlay);
  };

  // Remove QR button when modal closes
  const removeQRButton = () => {
    const buttonOverlay = document.getElementById('qr-button-overlay');
    if (buttonOverlay) {
      buttonOverlay.remove();
    }
  };

  const options = {
    key: "rzp_test_RvRduZ5UNffoaN",
    amount: result.data.data.amount * 100,
    currency: "INR",
    order_id: result.data.data.razorpayOrderId,
    name: "My POS",
    description: `Total: ₹${result.data.data.amount}`,
    handler: async function (response) {
      const data = {
        ...response,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        saleId: tempPaymentData.saleId,
        amount: tempPaymentData.amount,
      };

      await verifyPayment(data);
      const invoice = buildExchangeInvoice(tempPaymentData.saleData);
      printInvoice(invoice);
      setCashOpen(false);
      setCart([]);
      setEnlargedQR(false);
      removeQRButton();
    },
    modal: {
      ondismiss: () => {
        printWindow.close();
        setEnlargedQR(false);
        removeQRButton();
      }
    }
  };

  // Open Razorpay modal
  new window.Razorpay(options).open();

  // Create the QR button after a short delay to ensure Razorpay is rendered
  setTimeout(createQRButton, 500);
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

<div style={{ display: "none" }}>
<div id="receipt" style={{
        width: "300px",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#000",
        padding: "8px",
      }}>
  <center>
    <h3>ABC STORE</h3>
    <p>Main Road, Indore</p>
    <p>Ph: 9876543210</p>
    <hr/>
  </center>

  <p>
    Invoice: <b>INV-1025</b><br/>
    Date: 28-12-2025<br/>
    Payment: CASH
  </p>

  <hr/>

  <table width="100%">
    <thead>
      <tr>
        <th align="left">Item</th>
        <th>Qty</th>
        <th align="right">Amt</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Soap</td>
        <td align="center">1</td>
        <td align="right">₹60</td>
      </tr>
      <tr>
        <td>Water Bottle</td>
        <td align="center">1</td>
        <td align="right">₹30</td>
      </tr>
    </tbody>
  </table>

  <hr/>

  <p>
    Subtotal: ₹90<br/>
    Tax (5%): ₹4.50<br/>
    <b>Total: ₹94.50</b>
  </p>

  <center>
    <p>Thank You! Visit Again 🙏</p>
  </center>
</div>
</div>

{/* Enlarged QR Code Modal - Shows on top of Razorpay */}
<Dialog
  open={enlargedQR}
  onClose={() => setEnlargedQR(false)}
  maxWidth="md"
  fullWidth
  sx={{ zIndex: 10000000 }}
  PaperProps={{
    sx: {
      bgcolor: 'white',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
    }
  }}
>
  <DialogTitle sx={{ textAlign: 'center', bgcolor: '#667eea', color: 'white', py: 2 }}>
    <Typography variant="h5" fontWeight="bold">
      Scan QR Code to Pay
    </Typography>
  </DialogTitle>
  <DialogContent sx={{ textAlign: 'center', py: 5, bgcolor: '#f5f5f5' }}>
    {qrCodeData && (
      <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 3, display: 'inline-block', boxShadow: 3 }}>
        <QRCodeSVG value={qrCodeData} size={400} level="H" />
      </Box>
    )}
    <Typography variant="body1" sx={{ mt: 3, fontWeight: 'bold', color: '#333' }}>
      Use any UPI app to scan this QR code
    </Typography>
    <Button
      variant="contained"
      onClick={() => setEnlargedQR(false)}
      sx={{ mt: 3, bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}
    >
      Close QR Code
    </Button>
  </DialogContent>
</Dialog>


    </>
  );
}
