import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Divider,
  Typography,
  Chip
} from "@mui/material";

export default function ViewSaleModal({ open, onClose, viewData }) {

  if (!viewData) return null;

  const { returns, items } = viewData;

  if (!returns || !items) return null;

  const total = Number(returns.refund_amount) || 0;

  const getStatusColor = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'failed') return 'error';
    return 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

      {/* ---------- TITLE ---------- */}
      <DialogTitle>
        Return Details
        <Typography variant="subtitle2" color="text.secondary">
          Invoice No: {returns.invoice_no}
        </Typography>
      </DialogTitle>

      {/* ---------- CONTENT ---------- */}
      <DialogContent dividers>

        {/* REFUND STATUS */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="text.secondary">Refund Status</Typography>
          <Chip
            label={returns.refund_status || 'N/A'}
            size="small"
            color={getStatusColor(returns.refund_status)}
          />
        </Box>

        {returns.refund_method && (
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="body2" color="text.secondary">Refund Method</Typography>
            <Typography variant="body2" fontWeight="bold">{returns.refund_method}</Typography>
          </Box>
        )}

        {returns.payment_method && (
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="body2" color="text.secondary">Original Payment</Typography>
            <Typography variant="body2" fontWeight="bold">{returns.payment_method}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ITEMS LIST */}
        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
          Returned Items
        </Typography>
        {items.map((item) => (
          <Box
            key={item.id}
            display="flex"
            justifyContent="space-between"
            mb={1}
          >
            <Typography>
              {item.product_name} x {item.return_qty}
            </Typography>
            <Typography fontWeight="bold">
              ₹{Number(item.refund_amount).toFixed(2)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* TOTAL */}
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold" color="#d32f2f">Total Refund</Typography>
          <Typography fontWeight="bold" color="#d32f2f">
            ₹{total.toFixed(2)}
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
