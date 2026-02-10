import { useEffect, useState, useRef } from "react";
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
import { checkout_sale,verifyPayment,createQRPayment,checkQRPaymentStatus } from "../../services/saleService";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CircularProgress from "@mui/material/CircularProgress";
import QRCode from "qrcode";

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
const [qrModalOpen, setQrModalOpen] = useState(false);
const [qrCodeData, setQrCodeData] = useState(null);
const [paymentStatus, setPaymentStatus] = useState("pending");
const [pollingInterval, setPollingInterval] = useState(null);
const [qrCodeImage, setQrCodeImage] = useState(null);
const qrCanvasRef = useRef(null);
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
          const invoice = buildExchangeInvoice(result.data.saleData);
          printInvoice(invoice);

          // Reset POS
          setCashOpen(false);
          setCart([]);
        } else {
           invoiceWindow.close();
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

      // Start polling for payment status
      startPaymentPolling(result.data.qrCodeId, result.data.saleId, result.data.saleData);
    } else {
      alert("Failed to generate QR code");
    }
  } catch (error) {
    console.error("QR Payment Error:", error);
    alert("Failed to create QR payment");
  }
};

const startPaymentPolling = (qrCodeId, saleId, saleData) => {
  const interval = setInterval(async () => {
    try {
      const statusResult = await checkQRPaymentStatus({ qrCodeId, saleId });

      if (statusResult.status && statusResult.data.status === "paid") {
        setPaymentStatus("paid");
        clearInterval(interval);
        setPollingInterval(null);

        // Print invoice
        setTimeout(() => {
          const invoice = buildExchangeInvoice(saleData);
          printInvoice(invoice);

          // Reset and close
          setQrModalOpen(false);
          setCart([]);
          setQrCodeData(null);
          setPaymentStatus("pending");
        }, 1000);
      }
    } catch (error) {
      console.error("Polling Error:", error);
    }
  }, 3000); // Poll every 3 seconds

  setPollingInterval(interval);
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
            style={{...getButtonStyle("credit"), flex: 1}}
            onClick={() =>{
              setActive("credit");
              handleRazorpay();
            }}
          >
            <CreditCardIcon style={{ fontSize: 18, marginRight: 5 }} />
            Credit
          </button>

          <button
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
            style={{...getButtonStyle("qr_code"), flex: 1}}
            onClick={handleQRPayment}
          >
            <QrCode2Icon style={{ fontSize: 18, marginRight: 5 }} />
            QR
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
            backgroundColor: paymentStatus === 'paid' ? '#d4edda' : '#fff3cd',
            borderRadius: 2,
            border: `2px solid ${paymentStatus === 'paid' ? '#28a745' : '#ffc107'}`
          }}
        >
          {paymentStatus === 'pending' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <CircularProgress size={24} sx={{ color: '#ffc107' }} />
              <Typography variant="body1" fontWeight="bold" color="#856404">
                Waiting for payment...
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
          Open any UPI app and scan the QR code to complete payment
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

    </>
  );
}