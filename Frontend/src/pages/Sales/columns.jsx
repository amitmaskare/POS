import { Button, Box, Chip, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PrintIcon from "@mui/icons-material/Print";

export const getColumns = (isDark) => [
  {
    id: "invoice_no",
    label: "Invoice Details",
    render: (row) => (
      <Box display="flex" gap={1.5} alignItems="flex-start">

        <ReceiptLongIcon sx={{ fontSize: 20, mt: "2px", color: isDark ? "#fff" : "#415A77" }} />

        <div>
          <div style={{ fontWeight: 600, color: isDark ? "#fff" : "#415A77" }}>{row.invoice_no}</div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >

            {new Date(row.sale_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })} 
            {/* <span>{row.status}</span> */}
          </div>


        </div>
      </Box>
    )
  },
  {
    id: "total_items",
    label: "Items",
    align: "center",
    sortable: true,
    render: (row) => (
      <div>
        <div
          style={{
            fontSize: "12.9px",
            display: "flex",
            fontWeight:600,
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Inventory2Icon sx={{ fontSize: 15 ,color: isDark ? "#fff" : "#415A77" }} />
          Items:{row.total_items} 
        </div>

        <div
          style={{
            fontSize: "12.9px",
            fontWeight:600,
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <CurrencyRupeeIcon sx={{ fontSize: 15 }} />
          {row.amount}
        </div>
      </div>
    )
  },
  {
    id: "paymentMethod",
    label: "Payment Method",
    align: "center",
    sortable: true,
    render: (row) => {
      if (row.paymentMethod === "SPLIT") {
        // Get the online method display name
        const onlineMethodDisplay = {
          qr_code: "QR/UPI",
          pos_card: "POS Card",
          credit: "Credit Card",
        };

        const onlineMethod = row.online_method?.toLowerCase() || "online";
        const methodName = onlineMethodDisplay[onlineMethod] || "Online";

        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Chip
              label="Split Payment"
              color="warning"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Typography
              variant="caption"
              display="block"
              sx={{ mt: 0.5, color: "text.secondary" }}
            >
              Cash + {methodName}
            </Typography>
          </Box>
        );
      }

      // For non-split payments
      const paymentLabels = {
        CASH: { label: "Cash", color: "success", icon: "💵" },
        QR_CODE: { label: "QR Code/UPI", color: "info", icon: "📱" },
        POS_CARD: { label: "POS Card", color: "primary", icon: "💳" },
        CREDIT: { label: "Credit Card", color: "primary", icon: "💳" },
        CARD: { label: "Card", color: "primary", icon: "💳" },
        UPI: { label: "UPI", color: "info", icon: "📱" },
      };

      const paymentInfo = paymentLabels[row.paymentMethod] || {
        label: row.paymentMethod || "N/A",
        color: "default",
        icon: "💰",
      };

      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Chip
            label={`${paymentInfo.icon} ${paymentInfo.label}`}
            color={paymentInfo.color}
            size="small"
          />
        </Box>
      );
    },
  },
  {
    id: "cash_amount",
    label: "Cash Received",
    align: "right",
    sortable: true,
    render: (row) => {
      const cashAmount = Number(row.cash_amount || 0);

      // For split payments, show the split cash amount
      if (row.paymentMethod === "SPLIT") {
        return (
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "success.main" }}
            >
              ₹{cashAmount.toFixed(2)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              (Split)
            </Typography>
          </Box>
        );
      }

      // For cash-only payments, show total as cash
      if (row.paymentMethod === "CASH") {
        return (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "success.main", textAlign: "right" }}
          >
            ₹{Number(row.amount || 0).toFixed(2)}
          </Typography>
        );
      }

      // For other payment methods, show dash
      return (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "right" }}
        >
          -
        </Typography>
      );
    },
  },
  {
    id: "online_amount",
    label: "Online Received",
    align: "right",
    sortable: true,
    render: (row) => {
      const onlineAmount = Number(row.online_amount || 0);

      // For split payments, show the split online amount
      if (row.paymentMethod === "SPLIT") {
        return (
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              ₹{onlineAmount.toFixed(2)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              (Split)
            </Typography>
          </Box>
        );
      }

      // For online-only payments (QR, POS, Credit), show total as online
      if (
        ["QR_CODE", "POS_CARD", "CREDIT", "CARD", "UPI"].includes(
          row.paymentMethod
        )
      ) {
        return (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "primary.main", textAlign: "right" }}
          >
            ₹{Number(row.amount || 0).toFixed(2)}
          </Typography>
        );
      }

      // For cash payments, show dash
      return (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "right" }}
        >
          -
        </Typography>
      );
    },
  },
  {
    id: "amount",
    label: "Total Amount",
    align: "right",
    sortable: true,
    render: (row) => (
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, textAlign: "right" }}
      >
        ₹{Number(row.amount || 0).toFixed(2)}
      </Typography>
    ),
  },
  {
    id: "sale_date",
    label: "Payment Date",
    align: "center",
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ textAlign: "center" }}>
        {row.sale_date || "-"}
      </Typography>
    ),
  },
  {
    id: "status",
    label: "Status",
    align: "center",
    sortable: true,
    render: (row) => (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Chip
          label={row.status || "N/A"}
          color={
            row.status === "COMPLETED"
              ? "success"
              : row.status === "CANCELLED"
              ? "error"
              : row.status === "RETURNED"
              ? "warning"
              : "default"
          }
          size="small"
        />
      </Box>
    ),
  },
  {
    id: "actions",
    label: "Actions",
    align: "center",
    sortable: false,
    render: (row, extra) => (
      <Box display="flex" gap={1} justifyContent="center">
        <Button
          size="small"
          variant="outlined"
          onClick={() => extra?.view(row?.id)}
        >
          <VisibilityIcon sx={{ fontSize: 16 }} />
        </Button>

        <Button
          size="small"
          variant="outlined"
          color="success"
          startIcon={<PrintIcon />}
          onClick={() => extra?.print(row?.id)}
        >
          Print
        </Button>

        {/* <Button size="small" variant="outlined" color="error"  onClick={() => extra?.return(row?.id)}>
            Return
          </Button>  */}
      </Box>
    ),
  },
];
