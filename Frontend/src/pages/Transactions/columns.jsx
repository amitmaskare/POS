import { Box } from "@mui/material";

export const columns = [
//   {
//     id: "index",
//     label: "#",
//     render: (row, extra) => extra?.indexMap?.[row.id] ?? "-"
//   },

  { id: "invoice_no", label: "Invoice" },

  {
    id: "total",
    label: "Amount",
    render: (row) => `₹${row.total}`
  },

  {
    id: "payment_mode",
    label: "Mode",
    render: (row) => (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "6px",
          
          color: "#fff",
          fontSize: "12px"
        }}
      >
        {row.payment_mode}
      </span>
    )
  },

  {
    id: "payment_status",
    label: "Status",
    render: (row) => (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "6px",
          backgroundColor: row.payment_status === "paid" ? "#16a34a" : "#dc2626",
          color: "#fff",
          fontSize: "12px"
        }}
      >
        {row.payment_status}
      </span>
    )
  },

  {
    id: "razorpay_payment_id",
    label: "Payment ID",
    render: (row) => row.razorpay_payment_id || "-"
  },

  {
    id: "created_at",
    label: "Date",
    render: (row) => new Date(row.created_at).toLocaleString()
  }
];