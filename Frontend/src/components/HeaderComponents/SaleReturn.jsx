import {useState,useEffect} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
   Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import SearchFilter from "../MainContentComponents/SearchFilter";
import {scanInvoice,scanProduct,confirmReturn,confirmExchange,saleReturnById} from "../../services/ReturnService";
import {searchProduct,add_product} from "../../services/productService";

export default function SaleReturnModal({ open, onClose,addToCart }) {
   
  const [mode, setMode] = useState("refund"); 
      const[data,setData]=useState([])
      const [invoice, setInvoice] = useState("");
const [saleItems, setSaleItems] = useState([]);
const [exchangeItems, setExchangeItems] = useState([]);
const [barcodeItem, setBarcodeItem] = useState(null);
const [refundAmount, setRefundAmount] = useState(0);
const [returnAmount, setReturnAmount] = useState(0);
const [exchangeAmount, setExchangeAmount] = useState(0);
const [difference, setDifference] = useState(0);
 const [confirmAdd, setConfirmAdd] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  // const [barcode, setBarcode] = useState("");
  const [product_name, setProduct_name] = useState("");
  const [selling_price, setSelling_price] = useState("");
  
const handleInvoiceSearch = async (value) => {
  if (!value) return;
  const result = await scanInvoice({ invoice_no: value });
  if (result.status===true) {
    setInvoice({ invoice_no: result.data.invoice_no });

    // 🔥 RESET list with invoice items
    setSaleItems(
      result.data.saleData.map(item => ({
        ...item,
        returned_qty: item.returned_qty || 0
      }))
    );
  } else {
    setInvoice(null);
    setSaleItems([]);
  }
};


const handleBarcodeSearch = async (value) => {
  if (!value || !invoice?.invoice_no) return;

  try {
    const payload = {
      invoice_no: invoice.invoice_no,
      barcode: value
    };

    const result = await scanProduct(payload);

    if (result.status===true && result.data) {
      setSaleItems([
        {
          ...result.data,
          returned_qty: 0
        }
      ]);
    }
  } catch (err) {
    alert("Something went wrong");
  }
};



const updateReturnedQty = (sale_item_id, type) => {
  setSaleItems(prev =>
    prev.map(item => {
      if (item.sale_item_id !== sale_item_id) return item;

     // if (item.is_returnable !== "yes") return item;

      let qty = item.returned_qty || 0;

      if (type === "inc" && qty < item.qty) qty += 1;
      if (type === "dec" && qty > 0) qty -= 1;

      return { ...item, returned_qty: qty };
    })
  );
};

useEffect(() => {
  const total = saleItems.reduce((sum, item) => {
   // if (item.is_returnable !== "yes") return sum;

    return sum + Number(item.price) * Number(item.returned_qty || 0);
  }, 0);

  setRefundAmount(total.toFixed(2));
}, [saleItems]);

useEffect(() => {
  const rAmt = saleItems.reduce(
    (sum, i) => sum + i.returned_qty * i.price,
    0
  );

  const eAmt = exchangeItems.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

  setReturnAmount(rAmt);
  setExchangeAmount(eAmt);
  setDifference(eAmt - rAmt);
}, [saleItems, exchangeItems]);



const handleConfirmExchange = async () => {
  const payload = {
    sale_id: invoice.id,
    return_items: saleItems
      .filter(i => i.returned_qty > 0)
      .map(i => ({  
        sale_item_id: i.sale_item_id,
        qty: i.returned_qty
      })),
    exchange_items: exchangeItems.map(i => ({
      product_id: i.product_id,
      product_name: i.product_name,
       image: i.image,
      price: i.price,
      qty: i.qty
    }))
  };

  try {
    const res = await confirmExchange(payload);
    if (res.status === true) {
      alert(`Exchange completed ₹${res.data.difference}`);
      setInvoice(null)
      setSaleItems([])
      setBarcodeItem(null)
      setMode("refund")
      setExchangeItems([])
      onClose();
    } else {
      alert(res.message);
    }
  } catch (err) {
    alert("Return failed");
  }
 
};

const handleBarcodeChange = async (value) => {
   if (!value) {
     setConfirmAdd(false);
    return;
  }
  if (!value || mode !== "exchange") return;
 
  setBarcodeItem(value);

  try {
    const result = await searchProduct({ search: value });

    if (!result.status || !result.data) {
      alert("No product found");
      setConfirmAdd(true);
      return;
    }
    setConfirmAdd(false); 
    const data = result.data;

    // ✅ SAFE MAPPING
    const product_id = data.product_id ?? data.id;
    const product_name = data.product_name ?? data.name;
    const image = data.image ?? null;
    const price = Number(data.price);

    if (!product_id) {
      alert("Invalid product");
      return;
    }

    /* ---------------- EXCHANGE ITEMS ONLY ---------------- */
    setExchangeItems(prev => {
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

  } catch (err) {
     setConfirmAdd(true);
    console.error(err);
    alert("Something went wrong");
  }
};

const addNewProduct = async () => {

  try {
    const payload = {
      barcode:barcodeItem,
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
        alert("Invalid product id");
        return;
      }

      setExchangeItems(prev => {
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

      /* ---------------- RESET FORM ---------------- */
      setBarcodeItem("");
      setProduct_name("");
      setSelling_price("");
      setOpenAddModal(false); 

    } else {
      alert(result.message || "Failed to add product");
    }

  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    alert("Something went wrong");
  }
};
const returnItem=async(id)=>{
  try{
    const result= await saleReturnById(id);
    if(result.status===true)
    {  
      addToCart( result.data)
    }
    }catch(error)
      {
        console.log(error.message)
      }
 
}
  return (
    <>
    <Dialog
    anchor="left"
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      hideBackdrop={true}   // ✅ REMOVE GREY BACKGROUND
  PaperProps={{
    sx: {
      position: "fixed",
      top: 200,
     left:500,
      m: 0,
      borderRadius: 2,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },
  }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: 20,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} color="#5A8DEE">
          <HistoryIcon />
         Sale Return
        </Box>

        <IconButton
          onClick={onClose}
          sx={{ "&:hover": { background: "transparent" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

       <SearchFilter
  placeholder="Search Invoice No"
  onSearchChange={(e) => handleInvoiceSearch(e.target.value)}
/>
{invoice && (
  <Box mt={2}>
    <SearchFilter
      placeholder="Scan / Search Barcode"
      onSearchChange={(e) => handleBarcodeSearch(e.target.value)}
    />
  </Box>
)}
     {saleItems.length > 0 && (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
          <TableCell><b>Product</b></TableCell>
          <TableCell><b>Price</b></TableCell>
          <TableCell align="center"><b>Qty</b></TableCell>
          <TableCell align="center"><b>Returned Qty</b></TableCell>
          <TableCell align="center"><b>Status</b></TableCell>
        </TableRow>
      </TableHead>

     <TableBody>
  {(mode === "exchange" ? exchangeItems : saleItems).map(item => (
    <TableRow
      key={mode === "exchange" ? item.product_id : item.sale_item_id}
    >
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <img
            src={item.image}
            alt={item.product_name}
            width={40}
            height={40}
            style={{ borderRadius: 4 }}
          />
          <Typography>{item.product_name}</Typography>
        </Box>
      </TableCell>

      <TableCell>₹{item.price}</TableCell>

      <TableCell align="center">
        {mode === "exchange" ? item.qty : item.qty}
      </TableCell>

      <TableCell align="center">
        {mode !== "exchange" ? (
          <>
            <IconButton
              onClick={() =>
                updateReturnedQty(item.sale_item_id, "dec")
              }
            >
              −
            </IconButton>

            <Typography component="span" mx={1}>
              {item.returned_qty || 0}
            </Typography>

            <IconButton
              onClick={() =>
                updateReturnedQty(item.sale_item_id, "inc")
              }
            >
              +
            </IconButton>
          </>
        ) : (
          // ✅ exchange mode → just show qty
          item.qty
        )}
      </TableCell>

      <TableCell align="center">
         <Button size="small" variant="outlined" color="success" onClick={() =>returnItem(item.sale_item_id)}>
            Return
          </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

    </Table>
  </TableContainer>
)}

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
              value={barcodeItem}
              fullWidth
              margin="dense"
               onChange={(e) => setBarcodeItem(e.target.value)}
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
    </>
  );
}
