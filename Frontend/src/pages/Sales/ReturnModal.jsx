import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  Typography,
    TextField,
} from "@mui/material";
import SearchFilter from "../../components/MainContentComponents/SearchFilter";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useState, useEffect } from "react";
import { confirmReturn,confirmExchange } from "../../services/ReturnService";
import { searchProduct,add_product } from "../../services/productService";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

export default function ReturnModal({ open, onClose,onSaved, viewData }) {

  // ✅ Hooks ALWAYS on top
  const { showToast, toastMessage, toastType, showToastNotification } = useToast();
  const [mode, setMode] = useState("return"); 
  const [returnItems, setReturnItems] = useState([]);
  const [exchangeCart, setExchangeCart] = useState([]);
 const [confirmAdd, setConfirmAdd] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product_name, setProduct_name] = useState("");
  const [selling_price, setSelling_price] = useState("");
  // ✅ Safe destructuring
  const sale = viewData?.sale;
  const items = viewData?.items || [];

  useEffect(() => {
  if (!items?.length) return;

  setReturnItems(prev => {
    const prevMap = new Map(
      prev.map(p => [p.product_id, p])
    );

    const mapped = items.map(i => ({
      ...i,
      product_id: i.product_id,
      sale_item_id: i.id,   // 🔥 important
      return_qty: prevMap.get(i.product_id)?.return_qty || 0,
      selected: prevMap.get(i.product_id)?.selected || false
    }));

    return mapped;
  });
}, [items]);


  // Qty change
const updateQty = (product_id, type, field) => {
  setReturnItems(prev =>
    prev.map(item => {
      if (item.product_id !== product_id) return item;

      let value = item[field] || 0;

      if (type === "inc") value += 1;
      if (type === "dec") value = Math.max(0, value - 1);

      return {
        ...item,
        [field]: value,
        // ✅ return_qty change → checkbox auto update
        selected:
          field === "return_qty"
            ? value > 0
            : item.selected
      };
    })
  );
};

  // Refund total
  const refundAmount = returnItems.reduce(
    (sum, i) => sum + i.return_qty * i.price,
    0
  );

  // ✅ Conditional UI render (NOT hook)
  if (!viewData) return null;

  const exchangeAmount = exchangeCart.reduce(
  (sum, i) => sum + i.qty * i.price,
  0
);

const difference = exchangeAmount - refundAmount;

const handleConfirmExchange = async () => {

  const returnPayload = returnItems
    .filter(i => i.selected && i.return_qty > 0)
    .map(i => ({
      sale_item_id: i.id,
      product_id: i.product_id,
      qty: i.return_qty // ✅ correct return qty
    }));

  if (!returnPayload.length) {
    showToastNotification("Select valid return items", "warning");
    return;
  }

  if (!exchangeCart.length) {
    showToastNotification("Add exchange products", "warning");
    return;
  }

  const exchangePayload = exchangeCart.map(i => ({
    product_id: i.product_id,
    qty: i.qty,
    price: i.price,
    product_name: i.product_name,
    image: i.image
  }));

  const payload = {
    sale_id: sale.id,
    return_items: returnPayload,
    exchange_items: exchangePayload
  };
  

  try {
    const res = await confirmExchange(payload);

    if (res.status) {
      showToastNotification(`Payable Amount: ₹${res.data.payable}`, "info");
      onSaved();
      setMode("return"); 
      onClose();

    } else {
      showToastNotification(res.message, "error");
    }
  } catch (error) {
    console.error(error);
    showToastNotification("Exchange failed", "error");
  }
};

  const handleConfirmReturn = async (type) => {
  const payloadItems = returnItems
    .filter(i => i.return_qty > 0)
    .map(i => ({
      sale_item_id: i.id,
      product_id: i.product_id,
      qty: i.return_qty,
      price: i.price
    }));

  if (!payloadItems.length) return;

  const payload = {
    sale_id: sale.id,
    return_type: type, // refund | exchange
    items: payloadItems
  };

  try {
    const res = await confirmReturn(payload);
    if (res.status === true) {
      showToastNotification(`Success! Refund ₹${res.data.refundAmount}`, "success");
        onSaved()
      onClose();
    } else {
      showToastNotification(res.message, "error");
    }
  } catch (err) {
    showToastNotification("Return failed", "error");
  }
};

const handleBarcodeChange = async (value) => {
 
  if (!value) {
     setConfirmAdd(false);
    return;
  }
   if (mode !== "exchange") return;
  if (!value || value.length !== 12) return;
  setBarcode(value);
  try {
    const result = await searchProduct({ search: value });

    if (result.status === true) {
      setConfirmAdd(false); 
      const data = result.data;

      // ✅ SAFE MAPPING (MOST IMPORTANT)
      const product_id = data.product_id ?? data.id;
      const product_name = data.product_name ?? data.name;
      const image = data.image ?? null;
      const price = Number(data.price);

      if (!product_id) {
        showToastNotification("Invalid product_id", "error");
        return;
      }

      /* ---------------- EXCHANGE CART ---------------- */
      setExchangeCart(prev => {
        const exists = prev.find(p => p.product_id === product_id);

        if (exists) {
          return prev.map(p =>
            p.product_id === product_id
              ? { ...p, qty: p.qty + 1 }
              : p
          );
        }

        return [
          ...prev,
          {
            product_id,
            product_name,
            image,
            price,
            qty: 1
          }
        ];
      });

      /* ---------------- RETURN ITEMS ---------------- */
      setReturnItems(prev => {
        const exists = prev.find(i => i.product_id === product_id);
        if (exists) return prev;

        return [
          ...prev,
          {
            product_id,
            product_name,
            image,
            price,
            qty: 1,
            return_qty: 0,
            selected: true
          }
        ];
      });

    } else {
      setConfirmAdd(true);
     // alert("No product found");
    }

  } catch (err) {
    setConfirmAdd(true);
   // alert("Something went wrong");
  }
};

const addNewProduct = async () => {

  try {
    const payload = {
      barcode,
      product_name,
      selling_price
    };

    const result = await add_product(payload);

    if (result.status === true) {
      const data = result.data;
      const product_id = data.id;
      const product_name = data.product_name;
      const image = data.image || null;
      const price = Number(data.price);

      if (!product_id) {
        showToastNotification("Invalid product id", "error");
        return;
      }

       setExchangeCart(prev => {
        const exists = prev.find(p => p.product_id === product_id);

        if (exists) {
          return prev.map(p =>
            p.product_id === product_id
              ? { ...p, qty: p.qty + 1 }
              : p
          );
        }

        return [
          ...prev,
          {
            product_id,
            product_name,
            image,
            price,
            qty: 1
          }
        ];
      });

      setReturnItems(prev => {
        const exists = prev.find(i => i.product_id === product_id);
        if (exists) return prev;

        return [
          ...prev,
          {
            product_id,
            product_name,
            image,
            price,
            qty: 1,
            return_qty: 0,
            selected: true
          }
        ];
      });

      /* ---------------- RESET FORM ---------------- */
      setBarcode("");
      setProduct_name("");
      setSelling_price("");
      setOpenAddModal(false); 

    } else {
      showToastNotification(result.message || "Failed to add product", "error");
    }

  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    showToastNotification("Something went wrong", "error");
  }
};


  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

      <DialogTitle>
        Return Items – Invoice #{sale.invoice_no}
      </DialogTitle>

      <DialogContent>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Return</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Return Qty</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {returnItems.map(item => (
              <TableRow key={item.product_id}>
                <TableCell>
                  <Checkbox checked={item.selected} />
                </TableCell>

                <TableCell>{item.product_name}</TableCell>

                <TableCell>
                   {mode === "exchange" ? (
    <>
      <IconButton onClick={() => updateQty(item.product_id, "dec", "qty")}>
          <RemoveIcon />
        </IconButton>

        {item.qty}

        <IconButton onClick={() => updateQty(item.product_id, "inc", "qty")}>
          <AddIcon />
        </IconButton>
    </>
  ) : (
    // Just display return_qty as text when NOT in exchange mode
    item.qty
  )}
        
      </TableCell>
              
                <TableCell>
                  {mode !== "exchange" ? (
    <>
      <IconButton onClick={() => updateQty(item.product_id, "dec", "return_qty")}>
        <RemoveIcon />
      </IconButton>

      {item.return_qty}

      <IconButton onClick={() => updateQty(item.product_id, "inc", "return_qty")}>
        <AddIcon />
      </IconButton>
    </>
  ) : (
    // Just display return_qty as text when NOT in exchange mode
    item.return_qty
  )}
                </TableCell>
              
                <TableCell>
                   { mode !== "exchange" ? (
                  (item.return_qty * item.price).toFixed(2)
                   ) :(
                     (item.qty * item.price).toFixed(2)
                   )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="h6" align="right" sx={{ mt: 2 }}>
          Refund Amount: ₹{refundAmount.toFixed(2)}
        </Typography>
         {mode === "exchange" && (
    <>
     <div className="row">
      <div className="col-12 col-md-12 col-lg-12">
      <SearchFilter onSearchChange={(e) => handleBarcodeChange(e.target.value)}/>
      </div>
    </div>
    </>
  )}

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        {mode === "return" && (
    <>
      <Button
        color="warning"
        disabled={refundAmount === 0}
        onClick={() => setMode("exchange")}
      >
        Exchange
      </Button>

      <Button
        color="error"
        disabled={refundAmount === 0}
        onClick={() => handleConfirmReturn("refund")}
      >
        Refund
      </Button>
    </>
  )}

  {mode === "exchange" && (
    <>
    
    <Button
      color="success"
      disabled={!exchangeCart.length}
      onClick={handleConfirmExchange}
    >
      Confirm Exchange
    </Button>
    </>
  )}

      </DialogActions>

    </Dialog>

    <Dialog open={confirmAdd} onClose={() => setConfirmAdd(false)}>
      <DialogTitle>Product Not Found</DialogTitle>
    
      <DialogContent>
        Are you sure you want to add this product?
      </DialogContent>
    
      <DialogActions>
        <Button onClick={() => setConfirmAdd(false)} color="error">
          No
        </Button>
    
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            setConfirmAdd(false);
            setOpenAddModal(true);
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
    
      <DialogContent>
        <TextField
          label="Barcode"
          value={barcode}
          fullWidth
          margin="dense"
           onChange={(e) => setBarcode(e.target.value)}
          disabled
        />
    
        <TextField
          label="Product Name"
          fullWidth
          margin="dense"
           value={product_name}
          onChange={(e) => setProduct_name(e.target.value)}
        />
    
        <TextField
          label="Price"
          type="number"
          fullWidth
          value={selling_price}
        onChange={(e) => setSelling_price(e.target.value)}
          margin="dense"
        />
    
      </DialogContent>
    
      <DialogActions>
        <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
    
        <Button variant="contained" color="primary" onClick={()=>addNewProduct()}>
          Save Product
        </Button>
      </DialogActions>
    </Dialog>
    <Toast show={showToast} message={toastMessage} type={toastType} />
    </>
  );
}
