import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Modal,
  Tabs,
  Tab,
  Grid,
   IconButton,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
   Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SearchFilter from "../../components/MainContentComponents/SearchFilter";
import TableLayout from "../../components/MainContentComponents/Table";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

import { columns } from "./columns";
import { searchProduct,add_product,favouriteList } from "../../services/productService";
import { useOutletContext } from "react-router-dom";
import {scanInvoice,scanProduct,confirmReturn,confirmExchange,saleReturnById} from "../../services/ReturnService";

//import SaleReturnModal from "../../components/HeaderComponents/SaleReturn";

export default function Dashboard() {

   const { addToCart } = useOutletContext();
   const[data,setData]=useState([])
      const[success,setSuccess]=useState('')
      const[error,setError]=useState('')
      const[loading,setLoading]=useState(false)
       const [confirmAdd, setConfirmAdd] = useState(false);
const [openAddModal, setOpenAddModal] = useState(false);
const [barcode, setBarcode] = useState("");
const [product_name, setProduct_name] = useState("");
const [selling_price, setSelling_price] = useState("");
 const [mode, setMode] = useState("refund");     
      const [invoice, setInvoice] = useState("");
const [saleItems, setSaleItems] = useState([]);
const [exchangeItems, setExchangeItems] = useState([]);
const [barcodeItem, setBarcodeItem] = useState(null);
const [refundAmount, setRefundAmount] = useState(0);
const [returnAmount, setReturnAmount] = useState(0);
const [exchangeAmount, setExchangeAmount] = useState(0);
const [difference, setDifference] = useState(0);

 
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

const handleBarcodeChange  = async (value) => {
  if (!value) {
    setData([]);
     setConfirmAdd(false);
    
    return;
  }
  setBarcode(value);
  setError("")
  
 if (value.length !== 12) return;
  try {
    
    const result = await searchProduct({ search: value });
    if (result.status===true) {
      
       addToCart({
        ...result.data,
         qty: 1,
        cart_type: "exchange"
      });
      // addToCart(result.data);
      setConfirmAdd(false); 
      setError("");
       setBarcode("");
      
    } else {
      setData([]);
      setConfirmAdd(true);
      setError("No product found");
       setBarcode("");
      
    }
  } catch (err) {
    setConfirmAdd(true);
   
    setError("Something went wrong");
  } 
};

const addProduct=async()=>{
  setError("")
  setSuccess("")
   try{
    const data={barcode,product_name,selling_price}
    const result=await add_product(data)
   if (result.status === true) {
      setSuccess("Product added successfully");
       addToCart({
        ...result.data,
         qty: 1,
        cart_type: "exchange"
      });
       //addToCart(result.data);
      setBarcode("");
      setProduct_name("");
      setSelling_price("");
      setOpenAddModal(false);
    } else {
      setError(result?.message || "Failed to add product");
    }
  } catch (error) {
    setError("Something went wrong");
  }
}

const returnItem=async(item)=>{
  try{
     if (!item.returned_qty || item.returned_qty <= 0) {
      alert("Please select return quantity");
      return;
    }
    const result= await saleReturnById(item.sale_item_id);
    if(result.status===true)
    {  
       const backendItem = result.data; 
      // addToCart( result.data)
      addToCart({
        ...backendItem,
        qty: item.returned_qty,  
        return_qty: item.returned_qty, 
        cart_type: "refund"
      });
    }
    }catch(error)
      {
        console.log(error.message)
      }
 
}

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

  return (
    <>
      <main
        style={{
          width: "100%",
          textAlign: "left",
          margin: 0,
          padding: 0,
        }}
      >
     <div className="row">
      <div className="col-12 col-md-6 col-lg-8">
      <SearchFilter  value={barcode} onSearchChange={(e) => handleBarcodeChange(e.target.value)}/>
      </div>
    </div>
         <div className="col-12 col-md-6 col-lg-8">
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
            {mode !== "exchange" && item.is_returned !== 'yes' ? (
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
             {item.is_returned !== 'yes' ? (
             <Button size="small" variant="outlined" color="success" onClick={() =>returnItem(item)}>
                Return
              </Button>
             ):(
               <Button size="small" variant="outlined" color="success" disabled>
                Refund
              </Button>
             )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
    
        </Table>
      </TableContainer>
    )}
    </div>
    
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

    <Button variant="contained" color="primary" onClick={()=>addProduct()}>
      Save Product
    </Button>
  </DialogActions>
</Dialog>

      </main>

    </>
  );
}
