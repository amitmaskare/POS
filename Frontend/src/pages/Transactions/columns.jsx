import { Box } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentsIcon from "@mui/icons-material/Payments";

export const columns = [

  {
    id: "invoice_info",
    label: "Invoice",
    render: (row) => (
      <Box display="flex" gap={1.5} alignItems="flex-start">

        <ReceiptLongIcon sx={{ fontSize: 20, mt: "2px" }} />

        <Box>
          <div style={{ fontWeight: 600 }}>
            {row.invoice_no}
          </div>

          <div
            style={{
              fontSize: "12px",
             
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 14 }} />
            {new Date(row.created_at).toLocaleString()}
          </div>
        </Box>

      </Box>
    )
  },

  {
    id: "transaction",
    label: "Transaction",
    render: (row) => (
      <Box>

        <div
          style={{
            fontWeight: 600,
            
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <CurrencyRupeeIcon sx={{ fontSize: 16 }} />
          {row.total}
        </div>

        <div
          style={{
            fontSize: "12px",
            
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <CreditCardIcon sx={{ fontSize: 14 }} />
          {row.razorpay_payment_id || "-"}
        </div>

      </Box>
    )
  },

  {
    id: "payment",
    label: "Payment",
    render: (row) => (
      <Box display="flex" flexDirection="column" gap={0.5}>

        <span
          style={{
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            width: "fit-content",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <PaymentsIcon style={{ fontSize: "14px" }} />
          {row.payment_mode || "-"}
        </span>

        <span
          style={{
            padding: "4px 8px",
            borderRadius: "6px",
            backgroundColor:
              row.payment_status === "paid"
                ? "#16a34a"
                : "#dc2626",
            color: "#fff",
            fontSize: "12px",
            width: "fit-content"
          }}
        >
          {row.payment_status}
        </span>

      </Box>
    )
  }

];