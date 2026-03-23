import { Button, Box } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
export const getColumns = (isDark) => [
  {
    id: "product_name",
    label: "Product Details",
    render: (row) => (
      <Box display="flex" alignItems="center" gap={1}>
        
        {/* Icon */}
        <Inventory2Icon sx={{ fontSize: 18,color: isDark ? "#ccc" : "#415a77", }} />

        {/* Text Content */}
        <Box>
          <Box
            sx={{
              fontWeight: 600,
              textTransform: "capitalize",
              fontSize: "14px",
              color: isDark ? "#fff" : "#415A77", 
            }}
          >
            {row.product_name}
          </Box>

          <Box
            sx={{
              fontSize: "12px",
              mt: 0.3,
              fontWeight: 600,
              
            }}
          >
            QTY: {row.qty}
          </Box>
        </Box>
      </Box>
    ),
  },

  {
    id: "price",
    label: "Price",
    render: (row) => (
      <Box sx={{ fontWeight: 600,color: isDark ? "#fff" : "#415A77", }}>
        ₹ {row.price}
      </Box>
    ),
  },

  {
    id: "actions",
    label: "Actions",
    render: (row, extra) => (
      <Box display="flex" gap={1}>
        <Button
          size="small"
          variant="outlined"
          color="success"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
          }}
          onClick={() => extra?.selectItem(row)}
        >
          Select
        </Button>
      </Box>
    ),
  },
];
