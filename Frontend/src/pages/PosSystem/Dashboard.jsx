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

import SearchIcon from "@mui/icons-material/Search";
import SearchFilter from "../../components/MainContentComponents/SearchFilter";
import TableLayout from "../../components/MainContentComponents/Table";
import { columns } from "./columns";
import {
  searchProduct,
  add_product,
  favouriteList,
  looseItemList,
} from "../../services/productService";

import { getColumns } from "./columns";

import { useOutletContext } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";
import { useTheme } from "@mui/material/styles";

import socket from "../../socket";   // ✅ SOCKET IMPORT

export default function Dashboard() {

  const roomId = "pos_terminal_1";  // ✅ POS ROOM

  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Favourite", "Loose Items"];

  const { addToCart } = useOutletContext();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [confirmAdd, setConfirmAdd] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [barcode, setBarcode] = useState("");
  const [product_name, setProduct_name] = useState("");
  const [selling_price, setSelling_price] = useState("");

  const [favourites, setFavourites] = useState([]);
  const [looseItems, setLooseItems] = useState([]);

  const { showToast, toastMessage, toastType, showToastNotification } =
    useToast();

  const BARCODE_LENGTH = 13;

  // ✅ SOCKET CONNECTION
  useEffect(() => {

    socket.emit("join-room", roomId);

    return () => {
      socket.off();
    };

  }, []);

  // Function to open customer display
  const openCustomerDisplay = () => {
    const width = 900;
    const height = 700;
    const left = window.screen.width - width;
    const top = 0;

    window.open(
      `http://localhost:3000/customer-display`,
      "CustomerScreen",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  // ✅ SEND PRODUCT TO CUSTOMER SCREEN
  const sendToCustomerDisplay = (product) => {

    socket.emit("update-bill", {
      roomId: roomId,
      bill: product,
    });

  };

  const handleBarcodeChange = async (value) => {

    const trimmedValue = value.trim();
    setBarcode(trimmedValue);

    if (!trimmedValue || trimmedValue.length !== BARCODE_LENGTH) {
      return;
    }

    try {

      const payload = {
        search: trimmedValue,
      };

      const result = await searchProduct(payload);

      if (result.status === true) {

        showToastNotification("Product added to cart", "success");

        addToCart(result.data);

        sendToCustomerDisplay(result.data);  // ✅ SEND TO CUSTOMER

        setBarcode("");
        setConfirmAdd(false);

      } else {

        setConfirmAdd(true);

      }

    } catch (error) {

      showToastNotification(
        error.response?.data?.message || "Failed to search product",
        "error"
      );

      setConfirmAdd(true);

    }
  };

  const handleSelectItem = (row) => {

    addToCart(row);

    sendToCustomerDisplay(row);   // ✅ SEND PRODUCT

  };

  const addProduct = async () => {

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

      const data = {
        barcode: barcode.trim(),
        product_name: product_name.trim(),
        selling_price: Number(selling_price),
      };

      const result = await add_product(data);

      if (result.status === true) {

        showToastNotification("Product added successfully", "success");

        addToCart(result.data);

        sendToCustomerDisplay(result.data); // ✅ SEND PRODUCT

        setBarcode("");
        setProduct_name("");
        setSelling_price("");
        setOpenAddModal(false);

      } else {

        showToastNotification(result?.message || "Failed to add product", "error");

      }

    } catch (error) {

      showToastNotification(
        error.response?.data?.message || "Something went wrong",
        "error"
      );

    }

  };

  useEffect(() => {
    getFavouriteList();
    fetchLooseItemList();
  }, []);

  const getFavouriteList = async () => {

    try {

      const result = await favouriteList();

      console.log('Favourite List Result:', result);

      if (result.status === true) {

        setFavourites(result.data || []);

      } else {

        // If no data found, just set empty array without error
        setFavourites([]);
        console.log('No favourite products found');

      }

    } catch (error) {

      console.error('Error loading favourites:', error);
      setFavourites([]);

    }
  };

  const fetchLooseItemList = async () => {

    try {

      const result = await looseItemList();

      console.log('Loose Items Result:', result);

      if (result.status === true) {

        setLooseItems(result.data || []);

      } else {

        // If no data found, just set empty array without error
        setLooseItems([]);
        console.log('No loose items found');

      }

    } catch (error) {

      console.error('Error loading loose items:', error);
      setLooseItems([]);

    }
  };

  const getFilteredProducts = () => {

    if (activeFilter === "All") {
      return [...favourites, ...looseItems];
    }

    if (activeFilter === "Favourite") return favourites;

    if (activeFilter === "Loose Items") return looseItems;

    return [];

  };
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const columnsConfig = getColumns(isDark);
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

        <div className="row mb-3">
          <div className="col-12">
            <button
              className="btn btn-primary"
              onClick={openCustomerDisplay}
            >
              Open Customer Display
            </button>
          </div>
        </div>

        <div className="row">

          <div className="col-12 col-md-12 col-lg-8">

            <SearchFilter
              value={barcode}
              onSearchChange={(e) => handleBarcodeChange(e.target.value)}
              autoFocus
            />

          </div>

        </div>

        <div className="btn-group gap-2 mb-3 mt-3">

          {filters.map((item) => (

            <button
              key={item}
              onClick={() => setActiveFilter(item)}
              className="btn rounded-pill"
              style={{
                backgroundColor: activeFilter === item ? "#415a77" : "transparent",
                border: activeFilter === item ? "1px solid #415a77" : "1px solid #415a77",
                color: activeFilter === item
                  ? "#fff" 
                  : isDark 
                    ? "#fff"  // text white in dark mode
                    : "#415a77", // text dark in light mode
              }}
            >
              {item}
            </button>

          ))}

        </div>

        <Toast show={showToast} message={toastMessage} type={toastType} />

        {getFilteredProducts().length > 0 ? (

          <div className="row">

            <div className="col-12 col-md-12 col-lg-8">
              <TableLayout columns={columnsConfig} rows={getFilteredProducts()} extra={{ selectItem: handleSelectItem }} actionButtons={
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

          <div className="alert alert-info mt-3">
            No products found in {activeFilter} category
          </div>

        )}

        {/* CONFIRM ADD PRODUCT */}

        <Dialog open={confirmAdd} onClose={() => setConfirmAdd(false)}>

          <DialogTitle>Product Not Found</DialogTitle>

          <DialogContent>
            Are you sure you want to add this product?
          </DialogContent>

          <DialogActions>

            <Button
              onClick={() => {
                setConfirmAdd(false);
                setBarcode("");
              }}
              color="error"
            >
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

        {/* ADD PRODUCT MODAL */}

        <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>

          <DialogTitle>Add New Product</DialogTitle>

          <DialogContent>

            <TextField
              label="Barcode"
              value={barcode}
              fullWidth
              margin="dense"
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

            <Button variant="contained" color="primary" onClick={addProduct}>
              Save Product
            </Button>

          </DialogActions>

        </Dialog>

      </main>
    </>
  );
}