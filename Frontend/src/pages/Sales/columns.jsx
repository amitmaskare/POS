import { Button, Box } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

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
    label: "Summary",
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
    id: "actions",
    label: "Actions",
    render: (row, extra) => (
      <Box display="flex" gap={1}>
        <Button
          size="small"
          variant="outlined"
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
          <VisibilityIcon sx={{ fontSize: 16 }} />
        </Button>
      </Box>
    )
  }
];