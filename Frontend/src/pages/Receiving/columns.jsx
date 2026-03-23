import { Button, Box } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";

export const getColumns = (isDark) => [
  {
    id: "po_details",
    label: "Purchase Order",
    render: (row) => (
      <Box display="flex" alignItems="center" gap={1.5}>

        {/* Icon */}
        <LocalShippingIcon sx={{ fontSize: 22, color: isDark ? "#fff" : "#415A77" }} />

        {/* Details */}
        <Box>
          <div style={{ fontWeight: 600, color: isDark ? "#fff" : "#415A77" }}>
            {row.po_number}
          </div>

          <div style={{ fontSize: "12px", fontWeight: 600 }}>
            {row.supplier_name}
          </div>

          <div style={{ fontSize: "12px", fontWeight: 600 }}>
            <Box sx={{ fontSize: "12px", fontWeight: 600 }}>
              {row.purchase_date
                ? new Date(row.purchase_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "-"}
            </Box>
          </div>
        </Box>
      </Box>
    ),
  },

  {
    id: "amount",
    label: "Amount & Items",
    render: (row) => (
      <Box sx={{ fontWeight: 600, fontSize: "12px" }}>
        <div>Cost:₹{row.amount}</div>
        <div style={{ fontSize: "12px", fontWeight: 600,  }}>
          Items:{row.total_items}
        </div>
      </Box>
    ),
  },

  {
    id: "actions",
    label: "Actions",
    render: (row, extra) => {
      if (!row || typeof row !== "object") return <Box>-</Box>;

      const handleClick = () => {
        if (extra?.edit && typeof extra.edit === "function" && row?.id) {
          extra.edit(row.id);
        }
      };

      return (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            size="small"
            onClick={handleClick}
            sx={{
              minWidth: "30px",
              width: "30px",
              height: "30px",
              padding: "0",
              borderRadius: "50%",
              border: "1px solid #2196F3",
              backgroundColor: "#D6EAF8",
              color: "#1565C0",
            }}
          >
            <MoveToInboxIcon sx={{ fontSize: 16 }} />
          </Button>
        </Box>
      );
    },
  },
];
