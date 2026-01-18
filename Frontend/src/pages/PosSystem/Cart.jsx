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

export default function Cart({ cart, setCart }) {
  const [active, setActive] = useState(""); 
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [mobile, setMobile] = useState("");
const [openHoldModal, setOpenHoldModal] = useState(false);
const [openRetrieveModal, setOpenRetrieveModal] = useState(false);
const [cashOpen, setCashOpen] = useState(false);
const [receivedAmount, setReceivedAmount] = useState("");
const [returnAmount, setReturnAmount] = useState(0);
const [holdItem, setHoldItem] = useState(0);
  // Handle Quantity
 const updateQty = (id, action) => {
  setCart((prev) =>
    prev.map((item) => {
      if (item.id !== id) return item;

      const newQty =
        action === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1);

      let totalPrice = newQty * item.selling_price; // default

      // 🔥 OFFER LOGIC
      if (item.offer_price) {
        // ✅ CASE 2: FIXED OFFER PRICE (per-unit)
        if (item.offer_qty_price === "offer_price") {
          totalPrice = newQty * item.offer_price;
        }

        // ✅ CASE 1: REGULAR (offer only till min_qty)
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
 const subtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);

const taxRate = 0.05;
const tax = subtotal * taxRate;
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
  const payload = {
    payment_method: 'cash',
    subtotal,
    tax,
    total,
    cart: cart.map(item => ({
      product_id: item.id,
      product_name: item.product_name,
      qty: item.qty,
      price: item.price,
      total:item.price,
      image: item.image
    }))
  };

  const result= await checkout_sale(payload)
  if(result.status===true)
  {
  alert("Sale completed");
  const invoice = buildExchangeInvoice('Invoice-0001');
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
}

 const loadRazorpay = () =>
  new Promise(resolve => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
const handleRazorpay = async () => {
  
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
      total:item.price,
      image: item.image
    }))
  };
  const result= await checkout_sale(payload)
 // console.log(result); return false;
   const options = {
    key: "rzp_test_RvRduZ5UNffoaN",
    amount: result.data.amount * 100,
    currency: "INR",
    order_id: result.data.razorpayOrderId,
    name: "My POS",
    handler: async function (response) {
        const data={
           ...response,
           razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
        saleId: result.data.saleId,
        amount: response.amount,
        }
      const verifyData=await verifyPayment(data);

      alert("Payment Successful");
     const invoice = buildExchangeInvoice('Invoice-0001');
     printInvoice(invoice);
     setCashOpen(false);
      setCart([]);
    },
  };

  //new window.Razorpay(options).open();
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
          <span>Tax (5%)</span>
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
          <TableCell align="center"><b>Amount</b></TableCell>
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

      <TableCell align="center">{item.price}</TableCell>

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

    </>
  );
}
