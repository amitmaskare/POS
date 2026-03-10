import { Button,Box } from "@mui/material";

export  const columns = [
  {
    id: "po_number",
    label: "Purchase Order",
    render: (row) => (
      <div>
        <div>{row.po_number}</div>
        <div style={{ fontSize: "12px", color: "#415A77" }}>
          {row.purchase_date}
        </div>
        <div style={{ fontSize: "12px", color: "#6c757d" }}>
          Type: {row.type}
        </div>
      </div>
    )
  },

  { id: "supplier_name", label: "Supplier" },

  {
    id: "total_items",
    label: "Summary",
    render: (row) => (
      <div>
        <div>Items: {row.total_items}</div>
        <div style={{ fontSize: "12px", color: "#415A77" }}>
          ₹{row.amount}
        </div>
        <div style={{ fontSize: "12px", color: "#2E7D32" }}>
          {row.status}
        </div>
      </div>
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
      </Box>
    )
  }
];