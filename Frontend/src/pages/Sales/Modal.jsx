import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Divider,
  Typography
} from "@mui/material";

export default function ViewSaleModal({ open, onClose, viewData }) {

  if (!viewData) return null;

  const { sale, items } = viewData;

  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );
  const tax = sale.tax || 0;
  const total = sale.total;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

      {/* ---------- TITLE ---------- */}
      <DialogTitle color="#fff" variant="h6" sx={{color:"#fff",background:"#415A77"}}>
        Invoice Details
        <Typography variant="subtitle2" color="#fff">
          Invoice No: {sale.invoice_no}
        </Typography>
      </DialogTitle>

      {/* ---------- CONTENT ---------- */}
      <DialogContent dividers>

        {/* ITEMS LIST */}
        {items.map((item) => (
          <Box
            key={item.id}
            display="flex"
            justifyContent="space-between"
            mb={1}
          >
            <Typography>
              {item.product_name} × {item.qty}
            </Typography>
            <Typography fontWeight="bold">
              ₹{(item.price * item.qty).toFixed(2)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* TOTALS */}
        <Box display="flex" justifyContent="space-between">
          <Typography>Subtotal</Typography>
          <Typography>₹{subtotal.toFixed(2)}</Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography>Tax</Typography>
          <Typography>₹{tax}</Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Total</Typography>
          <Typography fontWeight="bold">
            ₹{total}
          </Typography>
        </Box>

      </DialogContent>

      {/* ---------- ACTIONS ---------- */}
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{color:"#fff",background:"#415A77"}}>
          Close
        </Button>
      </DialogActions>

    </Dialog>
  );
}
