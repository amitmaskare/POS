import { Button, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const getColumns = (isDark) => [
  {
    id: "product_info",
    label: "Product Info",
    render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Product Image */}
        <img
          src={row?.image || ""}
          alt="product"
          width={45}
          height={45}
          style={{ objectFit: "cover", borderRadius: "50%" }}
        />

        {/* Name, Category, Supplier */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ alignItems: "center", gap: "6px", fontWeight: 600, textTransform: "capitalize",color:isDark ? "#fff" : "#415A77", }}>
            {row?.product_name}
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                marginLeft: "4px",
                backgroundColor: row?.status?.toLowerCase() === "active" ? "green" : "#ef4444",
                display: "inline-block",
              }}
            />
          </span>

          <Box sx={{ fontSize: "12px", fontWeight: 600,}}>
            {row?.category_name}
          </Box>

          <Box sx={{ fontSize: "12px", fontWeight: 600 }}>
            {row?.supplier_name}
          </Box>
        </div>
      </div>
    ),
  },

  {
    id: "price_stock",
    label: "Price & Stock",
    render: (row) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600 }}>
          <span style={{ color:isDark ? "#fff" : "#415A77", }}>Cost:</span>{" "}
          <span >₹{row?.cost_price}</span>
        </div>
        <div style={{ fontSize: "12px", fontWeight: 600 }}>
          <span style={{ color: isDark ? "#fff" : "#415A77", }}>Sell:</span>{" "}
          <span >₹{row?.selling_price}</span>
        </div>
        <div style={{ fontSize: "12px", color: row?.stock < 5 ? "#e63946" : "#2a9d8f", fontWeight: 600 }}>
          Stock: {row?.stock ?? 0}
        </div>
      </div>
    ),
  },

  {
    id: "actions",
    label: "Actions",
    render: (row, extra) => (
      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          size="small"
          onClick={() => extra?.stock(row?.id)}
          sx={{
            minWidth: "30px",
            width: "30px",
            height: "30px",
            padding: "0",
            borderRadius: "50%",
            border: "1px solid #4CAF50",
            backgroundColor: "#DFF5E1",
            color: "#2E7D32",
          }}
        >
          <AddIcon sx={{ fontSize: 16, stroke: "currentColor", strokeWidth: 1 }} />
        </Button>

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
          }}
        >
          <EditIcon sx={{ fontSize: 16 }} />
        </Button>

        <Button
          variant="contained"
          size="small"
          color="error"
          onClick={() => extra?.deleteItem(row?.id)}
          sx={{
            minWidth: "30px",
            width: "30px",
            height: "30px",
            padding: "0",
            borderRadius: "50%",
            border: "1px solid #F44336",
            backgroundColor: "#FAD4D4",
            color: "#D32F2F",
          }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </Button>
      </Box>
    ),
  },
];