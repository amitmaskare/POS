import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Divider,
  Typography,
  Chip,
  Paper
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

  // Payment method display logic
  const getPaymentMethodDisplay = () => {
    const method = sale.payment_method?.toLowerCase();

    switch(method) {
      case 'cash':
        return { label: 'Cash', color: 'success' };
      case 'qr_code':
        return { label: 'QR Code/UPI', color: 'info' };
      case 'pos_card':
        return { label: 'POS Card', color: 'primary' };
      case 'credit':
        return { label: 'Credit Card', color: 'primary' };
      case 'split':
        return { label: 'Split Payment', color: 'warning' };
      default:
        return { label: method || 'N/A', color: 'default' };
    }
  };

  const paymentDisplay = getPaymentMethodDisplay();
  const isSplitPayment = sale.payment_method?.toLowerCase() === 'split';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

      {/* ---------- TITLE ---------- */}
      <DialogTitle>
        Invoice Details
        <Typography variant="subtitle2" color="text.secondary">
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

        <Divider sx={{ my: 2 }} />

        {/* PAYMENT DETAILS */}
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Payment Details
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography>Payment Method:</Typography>
          <Chip
            label={paymentDisplay.label}
            color={paymentDisplay.color}
            size="small"
          />
        </Box>

        {isSplitPayment && (
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', mt: 1, border: '1px solid', borderColor: 'grey.300' }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom color="primary">
              💰 Split Payment Breakdown:
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={1} sx={{ py: 0.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>💵</Typography>
                <Typography variant="body2">Cash Payment:</Typography>
              </Box>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                ₹{Number(sale.cash_amount || 0).toFixed(2)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={0.5} sx={{ py: 0.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
                  {sale.online_method === 'qr_code' ? '📱' :
                   sale.online_method === 'pos_card' ? '💳' :
                   sale.online_method === 'credit' ? '💳' : '💰'}
                </Typography>
                <Typography variant="body2">
                  {sale.online_method === 'qr_code' ? 'QR Code/UPI' :
                   sale.online_method === 'pos_card' ? 'POS Card' :
                   sale.online_method === 'credit' ? 'Credit Card' : 'Online'} Payment:
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="bold" color="primary.main">
                ₹{Number(sale.online_amount || 0).toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" sx={{ py: 0.5, bgcolor: 'white', px: 1, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">Total Received:</Typography>
              <Typography variant="body2" fontWeight="bold" color="text.primary">
                ₹{(Number(sale.cash_amount || 0) + Number(sale.online_amount || 0)).toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        )}

        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="body2">Payment Status:</Typography>
          <Chip
            label={sale.payment_status?.toUpperCase() || 'PENDING'}
            color={sale.payment_status === 'paid' ? 'success' : 'warning'}
            size="small"
          />
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
