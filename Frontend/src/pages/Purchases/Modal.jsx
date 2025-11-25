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
    Chip
  } from "@mui/material";
  
  export default function NewPurchaseOrderModal({ open, onClose }) {
    const items = [
      {
        product: "Coca Cola 500ml",
        category: "Beverages",
        supplier: "ABC Beverages Ltd",
        stock: 15,
        reorder: 50,
        price: 1.25,
        suggested: 185,
      },
      {
        product: "Lay's Chips Original",
        category: "Snacks",
        supplier: "Snack Distributors Inc",
        stock: 8,
        reorder: 30,
        price: 2.5,
        suggested: 92,
      },
    ];
  
    return (
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
    top: "55%",
    left: "60%",
    transform: "translate(-50%, -50%)",
    width: "70%",         // bigger modal
    maxHeight: "90vh",    // limit height
    overflowY: "auto",    // <--- THIS ENABLES SCROLL
    bgcolor: "background.paper",
    p: 4,
    borderRadius: 3,
          }}
        >
          <Typography variant="h6" mb={2} color="#5A8DEE">
            New Purchase Order
          </Typography>
  
          {/* PO DETAILS */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2} color="#5A8DEE">
              Purchase Order Details
            </Typography>
  
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="PO Number"
                fullWidth
                value="ST001-202511188070100"
                
              />
              <TextField
                label="Date"
                fullWidth
                value="11/18/2025, 07:01 AM"
                
              />
            </Box>
  
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Filter by Type</InputLabel>
                <Select value={"Low Stock Items"} label="Filter by Type">
                  <MenuItem value="Low Stock Items">Low Stock Items</MenuItem>
                </Select>
              </FormControl>
  
              <FormControl fullWidth>
                <InputLabel>Filter by Supplier</InputLabel>
                <Select value={"All suppliers"} label="Filter by Supplier">
                  <MenuItem value="All suppliers">All suppliers</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
  
          {/* TABLE */}
          <Paper sx={{ p: 3,  }}>
            <Typography fontWeight={700} mb={2} color="#5A8DEE">
              Items Requiring Reorder (5 items)
            </Typography>
  
            <Table>
              <TableHead  bgcolor="#5A8DEE">
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Product</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Supplier</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Current Stock</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Reorder Level</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Unit Price</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Suggested Qty</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Order Qty</TableCell>
                </TableRow>
              </TableHead>
  
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Typography fontWeight={600}>{item.product}</Typography>
                      <Typography fontSize="12px" color="#889">
                        {item.category}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.reorder}</TableCell>
                    <TableCell>
                      <Chip
                        label="critical"
                        size="small"
                        sx={{
                          bgcolor: "#ffb3b3",
                          color: "#900",
                          fontWeight: "bold"
                        }}
                      />
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.suggested}</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
  
            <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
              <Button onClick={onClose} variant="outlined" color="inherit">
                Cancel
              </Button>
              <Button variant="contained" sx={{ bgcolor: "#5A8DEE" }}>
                Create Purchase Order
              </Button>
            </Box>
          </Paper>
        </Box>
      </Modal>
    );
  }
  