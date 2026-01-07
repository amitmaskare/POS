import React, { useEffect, useState } from "react";
import {
  Box,
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
  DialogActions,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SearchFilter from "../../components/MainContentComponents/SearchFilter";
import TableLayout from "../../components/MainContentComponents/Table";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import { columns } from "./columns";
import { searchProduct,add_product,favouriteList } from "../../services/productService";
import { useOutletContext } from "react-router-dom";
import SaleReturnModal from "../../components/HeaderComponents/SaleReturn";

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
const [openSaleReturn, setOpenSaleReturn] = useState(false);

const handleBarcodeChange  = async (value) => {
  if (!value) {
    setData([]);
     setConfirmAdd(false);
     setOpenSaleReturn(true);
    return;
  }
  setBarcode(value);
  setError("")
   setOpenSaleReturn(true);
 if (value.length !== 12) return;
  try {
    
    const result = await searchProduct({ search: value });
    if (result.status===true) {
       addToCart(result.data);
      setConfirmAdd(false); 
      setError("");
       setBarcode("");
       setOpenSaleReturn(true);
    } else {
      setData([]);
      setConfirmAdd(true);
      setError("No product found");
       setBarcode("");
       setOpenSaleReturn(true);
    }
  } catch (err) {
    setConfirmAdd(true);
    setOpenSaleReturn(true);
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
       addToCart(result.data);
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

useEffect(() => {
  setOpenSaleReturn(true);
}, []);


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

<SaleReturnModal
  open={openSaleReturn}
  onClose={() => setOpenSaleReturn(false)} addToCart={addToCart}
/>

      </main>

    </>
  );
}
