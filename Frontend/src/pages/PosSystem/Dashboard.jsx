import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"; 
import SearchFilter from "../../components/MainContentComponents/SearchFilter";
import TableLayout from "../../components/MainContentComponents/Table";
import { columns } from "./columns";
import { searchProduct,add_product,favouriteList,looseItemList } from "../../services/productService";
import { useOutletContext } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Favourite","Loose Items"];
  const { addToCart } = useOutletContext();
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product_name, setProduct_name] = useState("");
  const [selling_price, setSelling_price] = useState("");
  const [favourites, setFavourites] = useState([]); 
  const [looseItems, setLooseItems] = useState([]);
  // Use custom toast hook for notifications
  const { showToast, toastMessage, toastType, showToastNotification } = useToast();

  const BARCODE_LENGTH = 13;
  const handleBarcodeChange = async (value) => {
    const trimmedValue = value.trim();
    setBarcode(trimmedValue);

    if (!trimmedValue || trimmedValue.length !== BARCODE_LENGTH) {
      return;
    }

    try {
      const payload = {
        search: trimmedValue
      };
      const result = await searchProduct(payload);
      if (result.status === true) {
        showToastNotification("Product added to cart", "success");
        addToCart(result.data);
        setBarcode("");
        setConfirmAdd(false);
      }
      else {
        setConfirmAdd(true);
      }
    } catch (error) {
      showToastNotification(error.response?.data?.message || "Failed to search product", "error");
      setConfirmAdd(true);
    }
  };


  const handleSelectItem =(row)=>{
    addToCart(row);
  }
  const addProduct=async()=>{
    // Validation
    if (!barcode.trim()) {
      showToastNotification("Barcode is required", "warning");
      return;
    }
    if (!product_name.trim()) {
      showToastNotification("Product name is required", "warning");
      return;
    }
    if (!selling_price || Number(selling_price) <= 0) {
      showToastNotification("Valid selling price is required", "warning");
      return;
    }

    try {
      const data={barcode: barcode.trim(), product_name: product_name.trim(), selling_price: Number(selling_price) }
      const result=await add_product(data)
      if (result.status === true) {
        showToastNotification("Product added successfully", "success");
        addToCart(result.data);
        setBarcode("");
        setProduct_name("");
        setSelling_price("");
        setOpenAddModal(false);
      } else {
        showToastNotification(result?.message || "Failed to add product", "error");
      }
    } catch (error) {
      showToastNotification(error.response?.data?.message || "Something went wrong", "error");
    }
  }
  useEffect(()=>{
    getFavouriteList()
    fetchLooseItemList()
  }, [])

const getFavouriteList=async()=>{
    try{
      const result = await favouriteList()
      if(result.status===true){
        showToastNotification(result.message, "success");
        setFavourites(result.data)
      }else{
        showToastNotification(result.message, "error");
      }
    }catch(error){
     showToastNotification(error.response?.data?.message || error.message, "error");
    }
  }

  const fetchLooseItemList=async()=>{
    try{
      const result=await looseItemList()
      if(result.status===true){
        showToastNotification(result.message, "success");
        setLooseItems(result.data)
      }else{
        showToastNotification(result.message, "error");
      }
    }catch(error)
    {
      showToastNotification(error.response?.data?.message || error.message, "error");
    }
  }

  const getFilteredProducts = () => {
    if (activeFilter === "All") {
      return [...favourites, ...looseItems];
    }
    if (activeFilter === "Favourite") return favourites;
    if (activeFilter === "Loose Items") return looseItems;
    return [];
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
          <div className="col-12 col-md-12 col-lg-8">
            <SearchFilter value={barcode} onSearchChange={(e) => handleBarcodeChange(e.target.value)}
              autoFocus />
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
                  activeFilter === item ? "#415a77" : "transparent",
                border:
                  activeFilter === item ? "1px solid #415a77" : "1px solid #ccc",
                color: activeFilter === item ? "#fff" : "#444",
              }}
            >
              {item}
            </button>
          ))}

        </div>

        {/* Toast Notification */}
        <Toast show={showToast} message={toastMessage} type={toastType} />

        {/* Products Table */}
        {getFilteredProducts().length > 0 ? (
          <div className="row">
            <div className="col-12 col-md-12 col-lg-8">
              <TableLayout columns={columns} rows={getFilteredProducts()} extra={{ selectItem: handleSelectItem }} actionButtons={
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
              } />
            </div>
          </div>
        ) : (
          <div className="alert alert-info mt-3">No products found in {activeFilter} category</div>
        )}
        <Dialog open={confirmAdd} onClose={() => setConfirmAdd(false)}>
          <DialogTitle>Product Not Found</DialogTitle>

          <DialogContent>
            Are you sure you want to add this product?
          </DialogContent>

          <DialogActions>
            <Button onClick={() => {
              setConfirmAdd(false); // modal close
              setBarcode("");      // ✅ input blank
            }} color="error" >
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
            <Button onClick={() => {
              setOpenAddModal(false);
            }}>Cancel</Button>

            <Button variant="contained" color="primary" onClick={() => addProduct()}>
              Save Product
            </Button>
          </DialogActions>
        </Dialog>

      </main>

    </>
  );
}
