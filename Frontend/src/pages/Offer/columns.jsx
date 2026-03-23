import { Button, Box } from "@mui/material";

export const columns = [
  {
    id: "offer_info",
    label: "Offer",
    render: (row) => (
      <Box>
        <div style={{ fontWeight: 600 }}>{row.offer_name}</div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {row.product_name}
        </div>
      </Box>
    )
  },

  {
    id: "pricing",
    label: "Pricing",
    render: (row) => (
      <Box>
        <div style={{ fontSize: "13px" }}>
          Min Qty: <b>{row.min_qty}</b>
        </div>

        <div style={{ fontSize: "13px" }}>
          Offer Price: ₹{row.offer_price}
        </div>

        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          Type: {row.offer_qty_price}
        </div>
      </Box>
    )
  },

  {
    id: "validity",
    label: "Validity",
    render: (row) => (
      <Box>
        <div style={{ fontSize: "12px" }}>
          {row.start_date}
        </div>

        <div style={{ fontSize: "12px" }}>
          {row.end_date}
        </div>

        <span
          style={{
            marginTop: "4px",
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: "6px",
            backgroundColor: row.status === "active" ? "#16a34a" : "#dc2626",
            color: "#fff",
            fontSize: "12px"
          }}
        >
          {row.status}
        </span>
      </Box>
    )
  },

  {
    id: "actions",
    label: "Actions",
    render: (row, extra) => (
      <Box display="flex" gap={1}>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => extra?.edit(row?.id)}
        >
          Edit
        </Button>

        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => extra?.deleteItem(row?.id)}
        >
          Delete
        </Button>
      </Box>
    )
  }
];