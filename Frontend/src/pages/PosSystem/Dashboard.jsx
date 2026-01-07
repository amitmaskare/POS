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
import { rows } from "./rows";
import { searchProduct,add_product,favouriteList } from "../../services/productService";
import { useOutletContext } from "react-router-dom";

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["Favourite"];
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
const [favourites, setFavourites] = useState([]); 

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
       addToCart(result.data);
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

const handleSelectItem =(row)=>{
  addToCart(row);
}

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
 useEffect(()=>{
getFavouriteList()
},[])

const getFavouriteList=async()=>{
setSuccess(null)
    setError(null)
    try{
      const result=await favouriteList()
      if(result.status===true)
      {
        setSuccess(result.message)
        setFavourites(result.data)
      }else{
        setError(result.message)
      }
    }catch(error)
    {
        setError(error.response?.data?.message || error.message);
    }
}

const filteredProducts = () => {
  if (activeFilter === "All") return true;
  if (activeFilter === "Favourite") return true;
}
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
   

        <div className="btn-group gap-2 mb-3 mt-3">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setActiveFilter(item)}
              className="btn rounded-pill"
              style={{
                backgroundColor:
                  activeFilter === item ? "#5A8DEE" : "transparent",
                border:
                  activeFilter === item ? "1px solid #5A8DEE" : "1px solid #ccc",
                color: activeFilter === item ? "#fff" : "#444",
              }}
            >
              {item}
            </button>
          ))}
      
        </div>
          {activeFilter === "Favourite" && (
             <div className="btn-group d-flex w-100">
         <TableLayout columns={columns} rows={favourites}  extra={{ selectItem: handleSelectItem}} actionButtons={
      [
        {
          label: "Filter",
          variant: "outlined",
        },
        {
          label: "Export",
          variant: "outlined",

        },
        {
          label: "Import",
          variant: "outlined",

        },
      ]
      }/>
      </div>
          )}
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
