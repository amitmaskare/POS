import { useEffect, useState } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CircularProgress from "@mui/material/CircularProgress";
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
import { getDeviceStatus } from "../../services/posService";
import {
  handleCashExchange,
  handleQRExchange,
  handlePOSExchange,
  handleCreditExchange,
  handleSplitPayment
} from "./paymentHandlers";

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
const[managerUser,setManagerUser]=useState("")
const[managerPass,setManagerPass]=useState("")
const [approvalType, setApprovalType] = useState("");
const [onlinePaymentOpen, setOnlinePaymentOpen] = useState(false);
const [splitPaymentOpen, setSplitPaymentOpen] = useState(false);
const [cashAmount, setCashAmount] = useState("");
const [onlineAmount, setOnlineAmount] = useState("");
const [splitPaymentMethod, setSplitPaymentMethod] = useState("");
const [qrModalOpen, setQrModalOpen] = useState(false);
const [qrCodeData, setQrCodeData] = useState(null);
const [qrCodeImage, setQrCodeImage] = useState(null);
const [paymentStatus, setPaymentStatus] = useState("pending");
const [posConnected, setPosConnected] = useState(false);
const [posProcessing, setPosProcessing] = useState(false); 
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
      tax: item.tax
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
  const base = item.qty * item.price;
  const taxPercent = item.tax || 0;
  return (base * taxPercent) / 100;
};
const tax =  cart.reduce((sum, item) => sum + getItemTaxAmount(item),0);
const totalTax = cart.reduce((sum, item) => sum + Number(item.tax), 0);
const saleId = cart.length > 0 ? cart[0].id : null;

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

const buildExchangeInvoice = (apiResult, paymentDetails = {}) => {
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
    difference: apiResult.difference,
    payment_method: paymentDetails.payment_method || 'cash',
    cash_amount: paymentDetails.cash_amount || null,
    online_amount: paymentDetails.online_amount || null,
    online_method: paymentDetails.online_method || null
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

        <div class="line"></div>

        <table>
          <tr>
            <td colspan="2"><b>Payment Details</b></td>
          </tr>
          <tr>
            <td>Payment Mode</td>
            <td class="right">
              ${
                invoice.payment_method === 'cash' ? 'Cash' :
                invoice.payment_method === 'credit' ? 'Credit Card' :
                invoice.payment_method === 'qr_code' ? 'QR Code/UPI' :
                invoice.payment_method === 'pos_card' ? 'POS Machine' :
                invoice.payment_method === 'split' ? 'Split Payment' :
                'Cash'
              }
            </td>
          </tr>
          ${
            invoice.payment_method === 'split' && invoice.cash_amount && invoice.online_amount
              ? `
                <tr>
                  <td>Cash Amount</td>
                  <td class="right">₹${parseFloat(invoice.cash_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Online Amount (${
                    invoice.online_method === 'qr_code' ? 'QR/UPI' :
                    invoice.online_method === 'pos_card' ? 'POS Card' :
                    invoice.online_method === 'credit' ? 'Credit Card' : 'Online'
                  })</td>
                  <td class="right">₹${parseFloat(invoice.online_amount).toFixed(2)}</td>
                </tr>
              `
              : ''
          }
        </table>

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
  await handleCashExchange({
    saleId,
    cart,
    printInvoice,
    buildExchangeInvoice,
    callbacks: {
      onSuccess: () => {
        setCashOpen(false);
        setCart([]);
        setReceivedAmount("");
        setReturnAmount(0);
      }
    }
  });
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
  }catch(error)
    {
      console.log(error.message)
    }
}
 const handleRefundSave = async (manager_id) => {
  
   try{
    const payload = {
    sale_id: saleId,
    return_type: "refund",
    manager_id,
    items: cart.map(item => ({
      sale_item_id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      image: item.image,
      qty: Number(item.return_qty),   // 👈 backend expects this
      price: item.price,
      tax: item.tax
    }))
  };

  const result= await confirmReturn(payload);
    if(result.status===true)
    {
      alert(`Refund Amount ₹${result.data.refundAmount}`);
      setCart([])
      const invoice = buildExchangeInvoice(result.data.invoice_no, { payment_method: 'cash' });
      printInvoice(invoice);
    }
   }catch(error)
   {
    console.log(error.message)
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

      // case "credit":
      //   handleRazorpay();  
      //   break;

      default:
        alert("Invalid approval type");
    }
  }
 }catch(error)
 {
  alert(error.response?.data?.message || error.message)
 }
};

const handleRazorpay = async () => {
  await handleCreditExchange({
    saleId,
    cart,
    printInvoice,
    buildExchangeInvoice,
    callbacks: {
      onSuccess: () => {
        setCashOpen(false);
        setCart([]);
      }
    }
  });
};

  return (
    <>
    <aside className="cart p-3">
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
                   {!item.return_qty ? (
                    <>
                  <button className="btn btn-sm p-0 px-2" onClick={() => updateQty(item.id, "dec")}>
                    −
                  </button>
                  <span className="fw-bold" style={{ fontSize: "14px" }}>
                    {item.return_qty}
                  </span>
                  <button className="btn btn-sm p-0 px-2" onClick={() => updateQty(item.id, "inc")}>
                    +
                  </button>
                  </>
                  ):(
                    <span className="fw-bold" style={{ fontSize: "14px" }}>
                    {item.qty}
                  </span> 

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
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
            style={{...getButtonStyle("cash"), flex: 1}}
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

        {/* Print  onClick={checkoutSale } */}
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-success" >
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
    placeholder="Manager Passsword"
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
          setApprovalType("credit");
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
          handleQRExchange({
            saleId,
            cart,
            subtotal,
            tax,
            total,
            callbacks: {
              onQRGenerated: ({ qrCodeData, qrCodeImage }) => {
                setQrCodeData(qrCodeData);
                setQrCodeImage(qrCodeImage);
                setQrModalOpen(true);
              }
            }
          });
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
          handlePOSExchange({
            saleId,
            cart,
            total,
            printInvoice,
            buildExchangeInvoice,
            posConnected,
            callbacks: {
              onProcessing: setPosProcessing,
              onSuccess: () => {
                setCart([]);
                setCashOpen(false);
                setActive("");
              }
            }
          });
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
        slotProps={{ htmlInput: { min: 0, max: total, step: 0.01 } }}
        helperText={`Maximum: ₹${total.toFixed(2)}`}
      />

      <TextField
        label="Online Payment Amount (Remaining)"
        type="number"
        fullWidth
        value={onlineAmount}
        disabled
        sx={{ mb: 3 }}
        slotProps={{
          input: {
            readOnly: true,
          }
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
        handleSplitPayment({
          saleId,
          cart,
          cashAmount,
          onlineAmount,
          onlineMethod: splitPaymentMethod === 'qr' ? 'qr_code' : splitPaymentMethod === 'pos' ? 'pos_card' : 'credit',
          subtotal,
          tax,
          total,
          posConnected,
          printInvoice,
          buildExchangeInvoice,
          callbacks: {
            onQRGenerated: ({ qrCodeData, qrCodeImage }) => {
              setQrCodeData(qrCodeData);
              setQrCodeImage(qrCodeImage);
              setSplitPaymentOpen(false);
              setQrModalOpen(true);
            },
            onProcessing: setPosProcessing,
            onSuccess: () => {
              setCart([]);
              setSplitPaymentOpen(false);
              setCashAmount("");
              setOnlineAmount("");
              setActive("");
            }
          }
        });
      }}
    >
      Proceed to Payment
    </Button>
  </DialogActions>
</Dialog>

{/* QR Code Modal */}
<Dialog
  open={qrModalOpen}
  onClose={() => setQrModalOpen(false)}
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
            Invoice: {qrCodeData.invoice_no || 'N/A'}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="#5A8DEE" sx={{ mb: 2 }}>
            ₹{Number(qrCodeData.online_amount || qrCodeData.amount || total).toFixed(2)}
          </Typography>
          {qrCodeData.cash_amount && (
            <Typography variant="body2" color="text.secondary">
              Cash: ₹{Number(qrCodeData.cash_amount).toFixed(2)} | Online: ₹{Number(qrCodeData.online_amount).toFixed(2)}
            </Typography>
          )}
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
            <Typography variant="body1" fontWeight="bold" color="#856404">
              Scan QR code with any UPI app to complete payment
            </Typography>
          )}

          {paymentStatus === 'paid' && (
            <Typography variant="body1" fontWeight="bold" color="#155724">
              ✓ Payment Successful!
            </Typography>
          )}
        </Paper>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          1. Scan QR code with GPay/PhonePe/Paytm
          <br />
          2. Complete the payment
          <br />
          3. Payment will be confirmed automatically
        </Typography>
      </>
    )}
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button
      onClick={() => {
        setQrModalOpen(false);
        setQrCodeData(null);
        setQrCodeImage(null);
        setPaymentStatus("pending");
      }}
      variant="outlined"
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
}
