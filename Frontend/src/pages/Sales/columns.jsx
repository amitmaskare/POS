import { Button, Box } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
export const columns = [
  {
    id: "invoice_no",
    label: "Invoice Details",
    render: (row) => (
      <div>
        <div>{row.invoice_no}</div>

        <div style={{ fontSize: "12px", color: "#415A77" }}>
          {row.sale_date}
        </div>

        <div style={{ fontSize: "12px", color: "#2E7D32", fontWeight: 500 }}>
          {row.status}
        </div>
      </div>
    )
  },

  {
    id: "total_items",
    label: "Summary",
    render: (row) => (
      <div>
        <div>Items: {row.total_items}</div>
        <div style={{ fontSize: "12px", color: "#415A77" }}>
          ₹{row.amount}
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
          onClick={() => extra?.view(row?.id)}
          sx={{
            minWidth: "30px",
            width: "30px",
            height: "30px",
            padding: "0",
            borderRadius: "50%",
            border: "1px solid #2196F3",
            backgroundColor: "#D6EAF8",
            color: "#1565C0"
          }}
        >
          <VisibilityIcon fontSize="16"/>
        </Button>
      </Box>
    )
  }
];