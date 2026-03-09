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

  const { returns, items } = viewData;

  const subtotal = items.reduce(
    (sum, i) => sum + i.refund_amount * i.return_qty,
    0
  );
  const tax = returns.tax || 0;
  const total = returns.refund_amount;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

      {/* ---------- TITLE ---------- */}
      <DialogTitle>
        Invoice Details
        <Typography variant="subtitle2" color="text.secondary">
          Invoice No: {returns.invoice_no}
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
              {item.product_name} × {item.return_qty}
            </Typography>
            <Typography fontWeight="bold">
              ₹{(item.refund_amount * item.return_qty).toFixed(2)}
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
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>

    </Dialog>
  );
}
