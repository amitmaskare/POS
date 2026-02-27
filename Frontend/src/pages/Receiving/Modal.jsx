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

import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import { supplierList, productList } from "../../services/productService";
import { createPurchase,updatePurchase,receiveQuantity } from "../../services/purchaseService";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

export default function NewPurchaseOrderModal({ open, onClose, onSaved,editData }) {

  const { showToast, toastMessage, toastType, showToastNotification } = useToast();
  const [items, setItems] = useState([]);
  const [poNumber, setPoNumber] = useState("");
  const [supplier, setSupplier] = useState([]);
  const [productItem, setProductItem] = useState([]);
  const [supplierId, setSupplierId] = useState("");
 const [purchaseId,setPurchaseId]=useState("")

useEffect(() => {
 if (!editData || !editData.purchase) return; // WAIT until items are loaded

  const purchasedata = editData.purchase;
  const purchaseItems = editData.purchaseItem || [];

  // ✅ SAFETY: Validate data before accessing
  if (!purchasedata || !Array.isArray(purchaseItems)) {
    console.warn('Invalid editData structure:', editData);
    return;
  }

  setPoNumber(purchasedata.po_number || "");
  setSupplierId(purchasedata.supplier_id || "");
  setPurchaseId(purchasedata.id || "");

  const formatted = purchaseItems.map((p) => {
    if (!p || !p.product_id) return null; // Skip invalid items
    const product = productItem.find((prod) => prod?.id === p.product_id);

    return {
      product_id: p.product_id,
      purchase_item_id: p.id,
      order_qty: p.quantity || 0,
      qty: p.received_qty || 0,
      cost_price: p.cost_price || 0,
      selected: true,
      // MERGED PRODUCT DETAILS
      image: product?.image || "/images/placeholder.png",
      product_name: product?.product_name || "Unknown Product",
      category_name: product?.category_name || "Unknown Category",
    };
  }).filter(Boolean); // Remove null entries

  setItems(formatted.length > 0 ? formatted : []);
}, [editData, productItem]);  // ONLY runs after product list loads


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
  const toggleSelect = (product_id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === product_id ? { ...item, selected: !item.selected } : item
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

    const updateReason = (product_id, reason) => {
      setItems(prev =>
        prev.map(item =>
          item.product_id === product_id ? { ...item, received_reason: reason } : item
        )
      );
    };

  const totalValue = selectedItems.reduce(
    (acc, i) => acc + i.qty * i.price,
    0
  );

  // CREATE PURCHASE (draft/order)
  const handleReceivedQty = async () => {
    try {
      const selected = items.filter(i => i.selected && i.qty > 0);
  
      if (selected.length === 0) {
        showToastNotification("Please enter receive quantity", "warning");
        return;
      }

      // Validate receive qty doesn't exceed order qty
      for (const item of selected) {
        if (item.qty > item.order_qty) {
          showToastNotification(
            `Cannot receive ${item.qty} units of ${item.product_name}. Only ${item.order_qty} units ordered.`,
            "error"
          );
          return;
        }
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
        showToastNotification("Items received successfully", "success");
        onClose();
        onSaved();
      } else {
        showToastNotification(response.message, "error");
      }
  
    } catch (error) {
      console.error(error);
      showToastNotification(error.response?.data?.message || "Something went wrong", "error");
    }
  };
  
  return (
    <>
       <Dialog open={open} onClose={onClose}
    fullWidth
    maxWidth="md"
        sx={{
        bgcolor: "#fff",
        marginTop:6,
        marginLeft:25,
        borderRadius: 3,
          maxHeight: "90vh",
      }}
   
        >
          <DialogTitle variant="h6" mb={2} sx={{color:"#fff",background:"#415A77"}}>
          Receiving Items</DialogTitle>
          
          <DialogContent  sx={{ p: 0 }}>
  
  <Box sx={{ p: 3 }}>
    <Paper sx={{ p: 3, mb: 3, background: "#fff", color: "#fff" }}>
          {/* PO DETAILS */}
           
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="PO Number"
                fullWidth
                value={poNumber}
                InputLabelProps={{ style: { color: "#415A77",fontWeight:"600" } }}
                sx={{ input: { color: "#fff" } }}
              />

              <input type="hidden" value={purchaseId} />
            </Box>

            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#415A77", fontWeight:"600" }}>Filter by Supplier</InputLabel>
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
          <Paper sx={{ p: 3, background: "#fff" }}>
            <Typography fontWeight={600} mb={2} color="#415A77">
              Receiving Items ({items.length} items)
            </Typography>

            <Table>
              <TableHead>
                <TableRow sx={{ background: "#415A77" }}>
                  <TableCell sx={{ color: "#fff" }}>Select</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Product</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Order Quantity</TableCell>
                  <TableCell sx={{ color: "#fff" }}>-</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Received Quantity</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Reason</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items && items.length > 0 ? items.map((item) => (
                  <TableRow key={item?.product_id || Math.random()}>
                    <TableCell>
                      <Checkbox
                        checked={item?.selected || false}
                        onChange={() => item?.product_id && toggleSelect(item.product_id)}
                        sx={{ color: "#9ca3af" }}
                      />
                    </TableCell>

                    <TableCell>
                      {item?.image && (
                        <img
                          src={item.image}
                          alt="product"
                          className="rounded-3"
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                      )}
                      <Typography fontWeight={600} color="#415A77">
                        {item?.product_name || "Unknown"}
                      </Typography>
                      <Typography fontSize="12px" color="#415A77">
                        {item?.category_name || "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ color: "#415A77" }}>{item?.order_qty || 0}</TableCell>
                    <TableCell sx={{ color: "#415A77" }}>
                      {item?.qty > item?.order_qty ? (
                        <span style={{ color: "#415A77" }}>
                          Cannot receive more than {item?.order_qty || 0} (Already received: {(item?.qty || 0) - (item?.order_qty || 0)})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {item?.selected ? (
                         <Box
                         display="flex"
                         alignItems="center"
                         justifyContent="center"
                       >
                         <Box
                           display="flex"
                           alignItems="center"
                           sx={{
                             
                             borderRadius: "8px",
                             overflow: "hidden",
                             background: "#415A77",
                           }}
                         >
                           <IconButton
                             onClick={() => decreaseQty(item.id)}
                             size="small"
                             sx={{
                               color: "#fff",
                               
                               borderRadius: 0,
                             }}
                           >
                             <RemoveIcon fontSize="small" />
                           </IconButton>
                         <TextField
                             value={item.qty}
                             onChange={(e) => updateQty(item.id, e.target.value)}
                             variant="standard"
                             InputProps={{
                               disableUnderline: true,
                               sx: {
                                 width: "12px",
                                 textAlign: "center",
                                 color: "#fff",
                                 fontSize:"14px",
                                 fontWeight: 600,
                               },
                             }}
                           />
                   
                           <IconButton
                             onClick={() => increaseQty(item.id)}
                             size="small"
                             sx={{
                               color: "#fff",
                               
                               borderRadius: 0,
                             }}
                           >
                             <AddIcon fontSize="small" />
                           </IconButton>
                         </Box>
                       </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell sx={{ color: "#415A77" }}>
                      {item?.selected ? (
                        <TextField
                          placeholder="Reason (optional)"
                          value={item?.received_reason || ""}
                          onChange={(e) => item?.product_id && updateReason(item.product_id, e.target.value)}
                          size="small"
                          sx={{
                            width: "150px",
                            input: { color: "#415A77", fontSize: "12px" },
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: "#475569" }
                            }
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "#415A77", py: 3 }}>
                      No items available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* FOOTER BUTTONS */}
            <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
              <Button onClick={onClose} variant="outlined" color="inherit">
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ bgcolor: "#415A77" }}
                onClick={() => handleReceivedQty()}
              >
                Submit
              </Button>
            </Box>
          </Paper>
        </Box>
        </DialogContent>
  </Dialog>
      <Toast show={showToast} message={toastMessage} type={toastType} />
    </>
  );
}
