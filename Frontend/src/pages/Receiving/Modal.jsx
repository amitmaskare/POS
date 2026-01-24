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
import { createPurchase,updatePurchase,receiveQuantity } from "../../services/purchaseService";

export default function NewPurchaseOrderModal({ open, onClose, onSaved,editData }) {

  const [items, setItems] = useState([]);
  const [poNumber, setPoNumber] = useState("");
  const [supplier, setSupplier] = useState([]);
  const [productItem, setProductItem] = useState([]);
  const [supplierId, setSupplierId] = useState("");
 const [purchaseId,setPurchaseId]=useState("")

useEffect(() => {
 if (!editData) return; // WAIT until items are loaded

  const purchasedata = editData.purchase;

  setPoNumber(purchasedata.po_number);
  setSupplierId(purchasedata.supplier_id);
  setPurchaseId(purchasedata.id);

 const purchaseItems = editData.purchaseItem;

 const formatted = purchaseItems.map((p) => {
  const product = productItem.find((prod) => prod.id === p.product_id);

    return {
      product_id: p.product_id,
      purchase_item_id: p.id,
      order_qty: p.quantity,      // ordered quantity
      qty: p.received_qty || 0,                     // received qty default
      cost_price: p.cost_price,                     // received qty default
      selected: true,
      // MERGED PRODUCT DETAILS
      image: product?.image || "Unknown Product",
      product_name: product?.product_name || "Unknown Product",
      category_name: product?.category_name || "Unknown Category",
    };
  });

  setItems(formatted);
}, [editData,productItem]);  // ONLY runs after product list loads


  // LOAD INITIAL DATA
  useEffect(() => {
    getSupplier();
    getProductList();
  }, []);

  // WHEN PRODUCT LIST LOADS → BUILD items STATE
  useEffect(() => {
    if (productItem.length > 0) {
      const formattedItems = productItem.map((p) => ({
        ...p,
        selected: true,
        qty: 1,
        price: p.cost_price,
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


  // Checkbox toggle  
  const toggleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

 const increaseQty = (product_id) => {
  setItems(prev =>
    prev.map(item =>
      item.product_id === product_id ? { ...item, qty: item.qty + 1 } : item
    )
  );
};

 const decreaseQty = (product_id) => {
  setItems(prev =>
    prev.map(item =>
      item.product_id === product_id && item.qty > 0
        ? { ...item, qty: item.qty - 1 }
        : item
    )
  );
};
  const updateQty = (product_id, value) => {
  const newQty = Number(value) || 0;

  setItems(prev =>
    prev.map(item =>
      item.product_id === product_id ? { ...item, qty: newQty } : item
    )
  );
};


  const selectedItems = items.filter((i) => i.selected);

  const totalValue = selectedItems.reduce(
    (acc, i) => acc + i.qty * i.price,
    0
  );

  // CREATE PURCHASE (draft/order)
  const handleReceivedQty = async () => {
    try {
      const selected = items.filter(i => i.selected && i.qty > 0);
  
      if (selected.length === 0) {
        alert("Please enter receive quantity");
        return;
      }
  
      const payload = {
        po_number: poNumber,
        items: selected.map(i => ({
          product_id: i.product_id,
          receive_qty: Number(i.qty),               // ✅ received now
          received_reason: i.received_reason || "" // optional
        }))
      };
  
      const response = await receiveQuantity(payload); // ✅ CORRECT API
  
      if (response.status === true) {
        alert("Items received successfully");
        onClose();
        onSaved();
      } else {
        alert(response.message);
      }
  
    } catch (error) {
      console.error(error);
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
         Receiving Items
        </Typography>

        {/* PO DETAILS */}
        <Paper sx={{ p: 3, mb: 3, background: "#1e293b", color: "#fff" }}>
         
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="PO Number"
              fullWidth
              value={poNumber}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
              sx={{ input: { color: "#fff" } }}
            />

            <input type="hidden" value={purchaseId} />
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
            Receiving Items ({items.length} items)
          </Typography>

          <Table>
            <TableHead>
              <TableRow sx={{ background: "#5A8DEE" }}>
                <TableCell sx={{ color: "#fff" }}>Select</TableCell>
                <TableCell sx={{ color: "#fff" }}>Product</TableCell>
                <TableCell sx={{ color: "#fff" }}>Order Quantity</TableCell>
                <TableCell sx={{ color: "#fff" }}>Received Quantity</TableCell>
                <TableCell sx={{ color: "#fff" }}>Reason</TableCell>
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

                  <TableCell sx={{ color: "#fff" }}> {item.order_qty}</TableCell>
                 
                  <TableCell>
                    {item.selected ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={() => decreaseQty(item.product_id)} sx={{ color: "#fff" }}>
                          <RemoveIcon />
                        </IconButton>

                        <TextField
                          value={item.qty}
                           onChange={(e) => updateQty(item.product_id, e.target.value)}
                          sx={{
                            width: "60px",
                            input: { color: "#fff", textAlign: "center" },
                          }}
                        />

                        <IconButton onClick={() => increaseQty(item.product_id)} sx={{ color: "#fff" }}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell sx={{ color: "#fff" }}>
                   <input type="text" placeholder="Reason" />
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
            <Button
              variant="contained"
              sx={{ bgcolor: "#5A8DEE" }}
              onClick={() => handleReceivedQty()}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
}
