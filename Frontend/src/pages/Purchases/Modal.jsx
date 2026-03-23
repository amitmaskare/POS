import {
  Box,
  Modal,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Checkbox,
  IconButton
} from "@mui/material";

import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import { supplierList, productList } from "../../services/productService";
import { generateNextPONumber, createPurchase, updatePurchase } from "../../services/purchaseService";

export default function NewPurchaseOrderModal({ open, onClose, onSaved, editData }) {

  const [items, setItems] = useState([]);
  const [poNumber, setPoNumber] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [supplier, setSupplier] = useState([]);
  const [productItem, setProductItem] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [purchaseId, setPurchaseId] = useState("")
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editData || productItem.length === 0) return;

    const purchase = editData.purchase;
    const purchaseItems = editData.purchaseItem;

    setPoNumber(purchase.po_number);
    setSupplierId(purchase.supplier_id);
    setPurchaseId(purchase.id);

    // ---> 🟢 Type-wise product filtering
    let filteredItems = [];

    if (purchase.type === "draft") {
      // Show ALL products
      filteredItems = productItem;
    } else if (purchase.type === "send") {
      // Show ONLY purchased items
      filteredItems = productItem.filter((pi) =>
        purchaseItems.some((p) => p.product_id === pi.id)
      );
    }

    // ---> 🟢 Apply quantities + markings
    const updatedItems = filteredItems.map((item) => {
      const found = purchaseItems.find((p) => p.product_id === item.id);

      if (found) {
        return {
          ...item,
          selected: true,
          qty: found.quantity,
          price: found.cost_price,
          purchase_item_id: found.id,
        };
      }

      return {
        ...item,
        selected: false,
        qty: 0,
      };
    });

    setItems(updatedItems);
  }, [editData, productItem]);


  // CURRENT DATE
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // LOAD INITIAL DATA
  useEffect(() => {
    setCurrentDateTime(getCurrentDateTime());
    getSupplier();
    getNextPoNumber();
    getProductList();
  }, []);

  // WHEN PRODUCT LIST LOADS → BUILD items STATE
  useEffect(() => {
    if (productItem.length > 0) {
      const formattedItems = productItem.map((p) => ({
        ...p,
        selected: false,
        qty: 1,
        cost_price: p.cost_price || 0,
        tax_rate: p.tax_rate || 0
      }));
      setItems(formattedItems);
    }
  }, [productItem]);

  const getProductList = async () => {
    try {
      const result = await productList();
      if (result.status === true) {
        setProductItem(result.data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const getSupplier = async () => {
    try {
      const result = await supplierList();
      if (result.status === true) {
        setSupplier(result.data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const getNextPoNumber = async () => {
    try {
      const result = await generateNextPONumber();
      if (result.status === true) {
        setPoNumber(result.data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  // Checkbox toggle  
  const toggleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // when selecting first time in edit
        if (!item.selected) {
          return {
            ...item,
            selected: true,
            qty: item.qty && item.qty > 0 ? item.qty : 1 // 👈 FIX
          };
        }

        return {
          ...item,
          selected: false
        };
      })
    );
  };


  const increaseQty = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };
  const updateQty = (id, value) => {
    const newQty = Number(value) || 1;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: newQty } : item
      )
    );
  };


  const selectedItems = items.filter((i) => i.selected);

  const totalValue = selectedItems.reduce(
    (acc, i) => acc + i.qty * i.price,
    0
  );
  const getItemTaxAmount = (item) => {
    const base = item.qty * item.cost_price;
    const taxPercent = item.tax_rate || 0;
    return (base * taxPercent) / 100;
  };

  const getSubTotal = () => {
    return items
      .filter(i => i.selected)
      .reduce((sum, i) => sum + (i.qty * i.cost_price), 0);
  };

  const getTotalTax = () => {
    return items
      .filter(i => i.selected)
      .reduce((sum, i) => sum + getItemTaxAmount(i), 0);
  };

  const getGrandTotal = () => {
    return getSubTotal() + getTotalTax();
  };

  // CREATE PURCHASE (draft/order)
  const handleCreatePurchase = async (type) => {
    try {
      const selected = items.filter((i) => i.selected);
      if (selected.length === 0) {
        alert("Please select at least one item.");
        return;
      }
      const subtotal = getSubTotal();
      const totalTax = getTotalTax();
      const grandTotal = getGrandTotal();

      const payload = {
        id: purchaseId,
        po_number: poNumber,
        type,
        supplier_id: supplierId,
        purchase_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        items: selected.map((i) => ({
          id: i.purchase_item_id,
          product_id: i.id,
          quantity: i.qty,
          cost_price: i.cost_price,
          tax: i.tax_rate || 0,
          image: i.image || null
        })),
      };
      if (editData) {
        payload.id = editData.purchase.id;
      }
      const response = editData ? await updatePurchase(payload) : await createPurchase(payload);
      if (response.status === true) {
        setSuccess(editData ? "Purchase Updated Successfully!" : "Purchase Order Created Successfully!");
        onClose();
        onSaved();
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-container": {
          mt: 6,

        },
        "& .MuiPaper-root": {
          borderRadius: "1.2rem",
        }
      }}
    ><DialogTitle variant="h6" mb={2} sx={{
      fontSize: 20,
      fontWeight: 600,
      borderBottom: "1px solid #e0e0e0",
      color: "#fff",
      backgroundColor: "#415a77",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
        New Purchase Order
        <Button
          onClick={onClose}
          sx={{
            minWidth: "auto",
            color: "#fff",
            "&:hover": { background: "transparent", color: "#1e293b" },
          }}
        >
          ✕
        </Button>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>

        <Box>

          <Paper sx={{ p:1,mb: 3, background: "#fff", color: "#fff" }}>
            <Typography fontWeight={600} mb={2} color="#415A77">
              Purchase Order Details
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="PO Number"
                fullWidth
                value={poNumber}
                InputLabelProps={{ style: { color: "#415A77", fontWeight: "600" } }}
                sx={{ input: { color: "#fff",p:2} }}
              />
              <input type="hidden" value={purchaseId} onChange={(e) => setPurchaseId(e.target.value)} />
              <TextField
                label="Date"
                fullWidth
                value={currentDateTime}
                InputLabelProps={{ style: { color: "#415A77", fontWeight: "600" } }}
                sx={{ input: { color: "#fff" } }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#415A77" }}>Filter by Supplier</InputLabel>
                <Select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  label="Filter by Supplier"
                  sx={{ color: "#fff" }}
                >
                  <MenuItem value="">All suppliers</MenuItem>
                  {supplier.map((item, i) => (
                    <MenuItem key={i} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
          {/* ITEM TABLE */}
          <Paper sx={{  background: "#fff" }}>
            <Typography fontWeight={600} mb={2} color="red">
              ⚠ Items Requiring Reorder ({items.length} items)
            </Typography>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#415A77" }}>
                  {/* <TableCell sx={{ color: "#fff" }}>Select</TableCell> */}
                  <TableCell sx={{ color: "#fff" }}>Product</TableCell>
                  {(!editData || editData?.purchase?.type === "draft") && (
                    <>
                      <TableCell sx={{ color: "#fff" }}>Supplier</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Stock</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                    </>
                  )}
                  {/* <TableCell sx={{ color: "#fff" }}>Cost Price</TableCell> */}
                  <TableCell sx={{ color: "#fff" }}>Order Qty</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {/* <TableCell>
                      <Checkbox
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id)}
                        sx={{ color: "#9ca3af" }}
                      />
                    </TableCell> */}

<<<<<<< HEAD
          {/* FOOTER BUTTONS */}
          <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
            <Button onClick={onClose} variant="outlined" color="inherit">
              Cancel
            </Button>
           
          {(!editData || editData?.purchase?.type === "draft") && (
  <Button
    variant="contained"
    sx={{ bgcolor: "#5A8DEE" }}
    onClick={() => handleCreatePurchase("draft")}
  >
    Save as Draft
  </Button>
     )}

            <Button
              variant="contained"
              sx={{ bgcolor: "#5A8DEE" }}
              onClick={() => handleCreatePurchase("send")}
            >
              Create Purchase Order
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
=======
                    <TableCell>
                      <Box display="flex" alignItems="center" >

                        <Box display="flex" alignItems="center" gap={2}>

                          <img
                            src={item?.image || ""}
                            alt="product"
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: "50%",   // 👈 makes image round
                            }}
                          />

                          <Box>
                            <Typography fontWeight={600} fontSize="14px" color="#415A77">
                              {item.product_name}
                            </Typography>

                            <Typography fontSize="12px" fontWeight={600}>
                              {item.category_name}
                            </Typography>
                            <Typography fontSize="12px" fontWeight={600}>
                              ₹{item.cost_price.toFixed(2)}
                            </Typography>

                          </Box>

                        </Box>
                        <Checkbox
                          checked={item.selected}
                          onChange={() => toggleSelect(item.id)}
                          size="small"
                          sx={{
                            color: "#9ca3af",
                            p: 0.5,
                            "& .MuiSvgIcon-root": {
                              fontSize: 14, // 👈 control actual checkbox size
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    {(!editData || editData?.purchase?.type === "draft") && (
                      <>
                        <TableCell sx={{ color: "black" }}>{item.supplier_name}</TableCell>
                        <TableCell sx={{ color: "black" }}>{item.stock}</TableCell>

                        <TableCell>
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              bgcolor: "rgba(0,128,0,0.15)",
                              color: "green",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                      </>
                    )}
                    {/* <TableCell sx={{ color: "black" }}>
                      ₹{item.cost_price.toFixed(2)}
                    </TableCell> */}

                    <TableCell>
                      {item.selected ? (
                        <Box display="flex">
                          <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                              borderRadius: "6px",
                              overflow: "hidden",
                              background: "#415A77",
                              height: 26, // 👈 smaller height
                            }}
                          >
                            {/* Decrease */}
                            <IconButton
                              onClick={() => decreaseQty(item.id)}
                              sx={{
                                color: "#fff",
                                p: 0.3, // 👈 less padding
                              }}
                            >
                              <RemoveIcon sx={{ fontSize: 14 }} />
                            </IconButton>

                            {/* Input */}
                            <TextField
                              value={item.qty}
                              onChange={(e) => updateQty(item.id, e.target.value)}
                              variant="standard"
                              inputProps={{
                                style: {
                                  textAlign: "center",
                                  padding: 0,
                                  width: 24, // 👈 compact width
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#fff",
                                },
                              }}
                              InputProps={{
                                disableUnderline: true,
                              }}
                            />

                            {/* Increase */}
                            <IconButton
                              onClick={() => increaseQty(item.id)}
                              sx={{
                                color: "#fff",
                                p: 0.3,
                              }}
                            >
                              <AddIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>


                    <TableCell sx={{ color: "black" }}>
                      {item.selected ? "₹" + (item.qty * item.cost_price).toFixed(2) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* FOOTER BUTTONS */}
            <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
              <Button onClick={onClose} variant="outlined" color="inherit">
                Cancel
              </Button>

              {(!editData || editData?.purchase?.type === "draft") && (
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#415A77" }}
                  onClick={() => handleCreatePurchase("draft")}
                >
                  Save as Draft
                </Button>
              )}

              <Button
                variant="contained"
                sx={{ bgcolor: "#415A77" }}
                onClick={() => handleCreatePurchase("send")}
              >
                Create Purchase Order
              </Button>
            </Box>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
>>>>>>> 635bcb3 (ui changes)
  );
}
