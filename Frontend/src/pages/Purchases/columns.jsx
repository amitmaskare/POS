import { Button, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // ✅ PO icon

export const getColumns = (isDark) => [
  {
    id: "po_info",
    label: "Purchase Order",
    render: (row) => (
      <Box display="flex" gap={1.5} alignItems="flex-start">

        {/* ✅ Icon */}
        <ReceiptLongIcon
          sx={{
            fontSize: 20,
            color: isDark ? "#fff" : "#415A77",
            mt: "1rem"
          }}
        />

        {/* ✅ Text */}
        <Box>
          <Box sx={{ fontWeight: 600, color: isDark ? "#fff" : "#415A77", }}>
            {row.po_number}
          </Box>

          <Box sx={{ fontSize: "12px", fontWeight: 600 }}>
            {row.supplier_name}
          </Box>

          <Box
            component="span"
            sx={{
              ml: 0.5,
              px: 1,
              py: 0.2,
              borderRadius: 1,
              bgcolor:
                row.type?.toLowerCase() === "send"
                  ? "#E6F4EA"
                  : row.type?.toLowerCase() === "draft"
                    ? "#FFF4E6"
                    : "#F3F4F6",
              color:
                row.type?.toLowerCase() === "send"
                  ? "#2E7D32"
                  : row.type?.toLowerCase() === "draft"
                    ? "#D97706"
                    : "#6B7280",
              fontWeight: 700,
              fontSize: "11px",
              display: "inline-block",
            }}
          >
            {row.type}
          </Box>
        </Box>
      </Box>
    )
  },

  {
    id: "summary",
    label: "Summary",
    render: (row) => (
      <Box>
        <Box sx={{ fontSize: "12px", fontWeight: 600 }} >Items: {row.total_items}</Box>


        <Box sx={{ fontSize: "12px", fontWeight: 600 }}>
          Cost: ₹{row.amount}
        </Box>

        <Box
          sx={{
            fontSize: "12px",
            color: row.status === "received" ? "#2E7D32" : "#D97706",
            fontWeight: 600,
            textTransform: "capitalize"
          }}
        >
          {row.status}
        </Box>
      </Box>
    )
  },

  {
    id: "actions",
    label: "Actions",
    render: (row, extra) => (
      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          size="small"
          onClick={() => extra?.edit(row?.id)}
          sx={{
            minWidth: "30px",
            width: "30px",
            height: "30px",
            padding: "0",
            borderRadius: "50%",
            border: "1px solid #2196F3",
            backgroundColor: "#D6EAF8",
            color: "#1565C0",
            "&:hover": {
              backgroundColor: "#BBDEFB",
            }
          }}
        >
          <EditIcon sx={{ fontSize: 16 }} />
        </Button>
      </Box>
    )
  }
];