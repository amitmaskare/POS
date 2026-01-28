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
    total,
    difference: apiResult.difference
  };
};

let printWindow = null;

const printInvoice = (invoice) => {
  const win = window.open("", "", "width=350");

  win.document.write(`
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
                <td class="right">${i.price.toFixed(2)}</td>
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

  win.document.close();
};

const checkoutSale = async () => {
  try{
      if (!saleId) {
      alert("Sale ID missing");
      return;
    }

    const return_items = cart
  .filter(item => item.cart_type === "refund")
  .map(item => ({
    sale_item_id: item.id,          // cart item id
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

    // if (!return_items.length || !exchange_items.length) {
    //   alert("Return & Exchange items required");
    //   return;
    // }
   const payload = {
      sale_id: saleId,
      payment_method:"cash",
      return_items,
      exchange_items,
    };
  const result= await confirmExchange(payload)
  if(result.status===true)
  {
   const diff = result.data.difference;
      if (diff > 0) {
        alert(`Customer pays ₹${diff}`);
      } else if (diff < 0) {
        alert(`Refund ₹${Math.abs(diff)}`);
      } else {
        alert("Even exchange – no payment");
      }
      const invoice = buildExchangeInvoice(result.data.invoice_no);
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
console.log(holdItem);
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
       const invoice = buildExchangeInvoice(result.data.invoice_no);
      printInvoice(invoice);
      setCart([])
    }
   }catch(error)
   {
    console.log(error.message)
   }
};

const verifyManager = async () => {
  const result = await verifyManagerAuth({
    user_id: managerUser,
    password: managerPass
  });

  if (result.status === true) {
    setShowApproval(false);
    handleRefundSave(result.data.manager_id);
  } else {
    alert("Invalid manager credentials");
  }
};

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
   printWindow = window.open("", "_blank", "width=350");

  if (!printWindow) {
    alert("Please allow popups");
    return;
  }
  await loadRazorpay();
  if (!saleId) {
      alert("Sale ID missing");
      return;
    }
     const return_items = cart
      .filter(i => i.cart_type === "refund")
      .map(i => ({
        sale_item_id: i.id,
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
      payment_method:"credit",
      return_items,
      exchange_items,
    };
  const result= await confirmExchange(payload)
   const options = {
    key: "rzp_test_RvRduZ5UNffoaN",
    amount: result.data.data.amount * 100,
    currency: "INR",
    order_id: result.data.data.razorpayOrderId,
    name: "My POS",
    handler: async function (response) {
        const data={
           ...response,
           razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
        saleId: result.data.data.saleId,
        amount: result.data.data.amount,
        }
      const verifyData=await verifyPayment(data);
     const invoice = buildExchangeInvoice(result.data.invoice_no);
     printInvoice(invoice);
    // writeInvoiceToPrintWindow(invoice);
     setCashOpen(false);
      setCart([]);
    },
     modal: {
      ondismiss: () => {
        printWindow.close(); // user closed payment popup
      }
    }
  };
  new window.Razorpay(options).open();
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
            style={getButtonStyle("cash")} onClick={() =>setShowApproval(true)}>
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
    setCashOpen(true);
  }}
          >
            <AttachMoneyIcon style={{ fontSize: 18, marginRight: 5 }} />
           Exchange Cash
          </button>

          <button
            className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
            style={getButtonStyle("credit")}
            onClick={() =>{
               setActive("credit")
              handleRazorpay()
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
    type="text"
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

    </>
  );
}
