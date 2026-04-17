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

import {
  add_product,
  allProductsList,
  favouriteList,
  looseItemList,
  decodeLooseBarcode,
  searchProductList,
} from "../../services/productService";

import WeightEntryModal from "./WeightEntryModal";

import { useOutletContext } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

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
  const [searchFilter, setSearchFilter] = useState("");
  const [product_name, setProduct_name] = useState("");
  const [selling_price, setSelling_price] = useState("");

  const [allProducts, setAllProducts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [looseItems, setLooseItems] = useState([]);

  // Barcode search results from API
  const [barcodeResults, setBarcodeResults] = useState([]);

  // Loose item weight entry modal
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [selectedLooseProduct, setSelectedLooseProduct] = useState(null);

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
    setSearchFilter(value);

    const trimmed = value.trim();
    const isNumeric = /^\d+$/.test(trimmed);

    // Auto-detect weighted barcode from scanner (prefix "20", length 13)
    if (trimmed.length === 13 && trimmed.startsWith("20")) {
      try {
        const result = await decodeLooseBarcode({ barcode: trimmed });
        if (result.status === true) {
          const item = result.data;
          const looseCartItem = {
            ...item,
            id: `${item.id}_loose_${Date.now()}`,
            product_id: item.id,
            qty: item.loose_weight,
            total: item.price,
            is_loose: 1,
          };
          addToCart(looseCartItem);
          sendToCustomerDisplay(looseCartItem);
          setSearchFilter("");
          setBarcodeResults([]);
          showToastNotification(
            `${item.product_name} (${item.loose_weight}${item.loose_unit}) added - Rs.${item.price}`,
            "success"
          );
          return;
        }
      } catch (error) {
        console.log("Not a weighted barcode, proceeding with normal search");
      }
    }

    // Barcode search: when 5+ numeric digits, search by barcode via API
    if (isNumeric && trimmed.length >= 5) {
      try {
        const result = await searchProductList({ search: trimmed });
        if (result.status === true && result.data?.length > 0) {
          setBarcodeResults(result.data);
        } else {
          setBarcodeResults([]);
        }
      } catch (error) {
        setBarcodeResults([]);
      }
    } else {
      setBarcodeResults([]);
    }
  };

  const handleSelectItem = (row) => {
    // If loose item → open weight entry modal
    if (row.is_loose === 1 || row.is_loose === true || row.favourite === 'loose') {
      setSelectedLooseProduct(row);
      setWeightModalOpen(true);
      return;
    }

    addToCart(row);
    sendToCustomerDisplay(row);
  };

  // Handle adding loose item from weight modal (both manual & label print)
  const handleAddLooseItem = (looseCartItem) => {
    // Directly set in cart (don't use addToCart which would qty++ for same id)
    // looseCartItem already has unique id like "5_loose_1681234567890"
    addToCart(looseCartItem);
    sendToCustomerDisplay(looseCartItem);
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
    getAllProductsList();
    getFavouriteList();
    fetchLooseItemList();
  }, []);

  const getAllProductsList = async () => {

    try {

      const result = await allProductsList();

      console.log('All Products List Result:', result);

      if (result.status === true) {

        setAllProducts(result.data || []);

      } else {

        setAllProducts([]);
        console.log('No products found');

      }

    } catch (error) {

      console.error('Error loading all products:', error);
      setAllProducts([]);

    }
  };

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

    const trimmed = searchFilter.trim();
    const isNumeric = /^\d+$/.test(trimmed);

    // If barcode search is active (5+ digits), show API results
    if (isNumeric && trimmed.length >= 5 && barcodeResults.length > 0) {
      return barcodeResults;
    }

    let products = [];

    // Get products based on active tab
    if (activeFilter === "All") {
      products = allProducts;
    } else if (activeFilter === "Favourite") {
      products = favourites;
    } else if (activeFilter === "Loose Items") {
      products = looseItems;
    }

    // Apply local search filter (product name only for text search)
    if (trimmed.length > 0 && !isNumeric) {
      const searchTerm = trimmed.toLowerCase();
      products = products.filter(product => {
        const productName = (product.product_name || '').toLowerCase();
        return productName.includes(searchTerm);
      });
    }

    return products;

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
              value={searchFilter}
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
                backgroundColor:
                  activeFilter === item ? "#415a77" : "transparent",
                border:
                  activeFilter === item
                    ? "1px solid #415a77"
                    : "1px solid #ccc",
                color: activeFilter === item ? "#fff" : "#444",
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

              <TableLayout
                columns={columns}
                rows={getFilteredProducts()}
                extra={{ selectItem: handleSelectItem }}
                actionButtons={[
                  { label: "Filter", variant: "outlined" },
                  { label: "Export", variant: "outlined" },
                  { label: "Import", variant: "outlined" },
                ]}
              />

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

        {/* WEIGHT ENTRY MODAL FOR LOOSE ITEMS */}
        <WeightEntryModal
          open={weightModalOpen}
          onClose={() => {
            setWeightModalOpen(false);
            setSelectedLooseProduct(null);
          }}
          product={selectedLooseProduct}
          onAddToCart={handleAddLooseItem}
        />

      </main>
    </>
  );
}