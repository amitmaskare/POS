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
import { generateNextPONumber, createPurchase,updatePurchase } from "../../services/purchaseService";

export default function NewPurchaseOrderModal({ open, onClose, onSaved,editData }) {

  const [items, setItems] = useState([]);
  const [poNumber, setPoNumber] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [supplier, setSupplier] = useState([]);
  const [productItem, setProductItem] = useState([]);
  const [supplierId, setSupplierId] = useState("");
 const [purchaseId,setPurchaseId]=useState("")

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
        price: found.unit_price,
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
        price: p.unit_price,
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
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
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

  // CREATE PURCHASE (draft/order)
  const handleCreatePurchase = async (type) => {
  try {
    const selected = items.filter((i) => i.selected);

    if (selected.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    const payload = {
  id: purchaseId,
  po_number: poNumber,
  type,
  supplier_id: supplierId,
  purchase_date: new Date().toISOString().slice(0, 19).replace("T", " "),
  userId: 1,
  subtotal: totalValue,
  tax: 10,
  grand_total: totalValue,
  items: selected.map((i) => ({
     id: i.purchase_item_id,
    product_id: i.id,
    quantity: i.qty,
    unit_price: i.unit_price,
  })),
};

    let response;

    if (editData) {
      response = await updatePurchase(payload);
    } else {
      response = await createPurchase(payload);
    }

    if (response.status === true) {
      alert(editData ? "Purchase Updated Successfully!" : "Purchase Order Created Successfully!");
      onClose();
      onSaved();
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.log(error);
    alert(error.response?.data?.message || "Something went wrong");
  }
};

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "75%",
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "#0f172a",
          p: 4,
          borderRadius: 3,
          color: "#fff",
        }}
      >
        <Typography variant="h6" mb={2} color="#5A8DEE">
          New Purchase Order
        </Typography>

        {/* PO DETAILS */}
        <Paper sx={{ p: 3, mb: 3, background: "#1e293b", color: "#fff" }}>
          <Typography fontWeight={600} mb={2} color="#5A8DEE">
            Purchase Order Details
          </Typography>

          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="PO Number"
              fullWidth
              value={poNumber}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
              sx={{ input: { color: "#fff" } }}
            />
        <input type="hidden" value={purchaseId} onChange={(e) => setPurchaseId(e.target.value)} />
        
            <TextField
              label="Date"
              fullWidth
              value={currentDateTime}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
              sx={{ input: { color: "#fff" } }}
            />
          </Box>

          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#94a3b8" }}>Filter by Supplier</InputLabel>
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
        <Paper sx={{ p: 3, background: "#1e293b" }}>
          <Typography fontWeight={600} mb={2} color="#facc15">
            ⚠ Items Requiring Reorder ({items.length} items)
          </Typography>

          <Table>
            <TableHead>
              <TableRow sx={{ background: "#5A8DEE" }}>
                <TableCell sx={{ color: "#fff" }}>Select</TableCell>
                <TableCell sx={{ color: "#fff" }}>Product</TableCell>
          {(!editData || editData?.purchase?.type === "draft") && (
              <>
                <TableCell sx={{ color: "#fff" }}>Supplier</TableCell>
                <TableCell sx={{ color: "#fff" }}>Stock</TableCell>
                <TableCell sx={{ color: "#fff" }}>Reorder</TableCell>
                <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                </>
          )}
                <TableCell sx={{ color: "#fff" }}>Unit Price</TableCell>
                <TableCell sx={{ color: "#fff" }}>Order Qty</TableCell>
                <TableCell sx={{ color: "#fff" }}>Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      sx={{ color: "#9ca3af" }}
                    />
                  </TableCell>

                  <TableCell>
                     <img
              src={item.image}
              alt="product"
              className="rounded-3"
              style={{ width: 55, height: 55, objectFit: "cover" }}
            />
                    <Typography fontWeight={600} color="#fff">
                      
                      {item.product_name}
                    </Typography>
                    <Typography fontSize="12px" color="#94a3b8">
                      {item.category_name}
                    </Typography>
                  </TableCell>
          {(!editData || editData?.purchase?.type === "draft") && (
                <>
                  <TableCell sx={{ color: "#fff" }}>{item.supplier_name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{item.initial_stock}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{item.reorder_level}</TableCell>

                  <TableCell>
                    <Chip
                      label="critical"
                      size="small"
                      sx={{
                        bgcolor: "#fee2e2",
                        color: "#b91c1c",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  </>
          )}
                  <TableCell sx={{ color: "#fff" }}>
                    ₹{item.unit_price.toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {item.selected ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={() => decreaseQty(item.id)} sx={{ color: "#fff" }}>
                          <RemoveIcon />
                        </IconButton>

                        <TextField
                          value={item.qty}
                           onChange={(e) => updateQty(item.id, e.target.value)}
                          sx={{
                            width: "60px",
                            input: { color: "#fff", textAlign: "center" },
                          }}
                        />

                        <IconButton onClick={() => increaseQty(item.id)} sx={{ color: "#fff" }}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell sx={{ color: "#fff" }}>
                    {item.selected ? "₹" + (item.qty * item.unit_price).toFixed(2) : "-"}
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
  );
}
