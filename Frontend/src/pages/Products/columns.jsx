import { Button,Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
export const columns = [
  
  {
    id: "product_name",
    label: "Product",
    render: (row) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <img
          src={row?.image || ""}
          alt="product"
          width={45}
          height={45}
          style={{
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
  
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontWeight: 600,
            color: "#415a77",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
  {row?.product_name}
  <span
    style={{
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: row?.status?.toLowerCase() === "active" ? "green" : "#ef4444",
      display: "inline-block",
    }}
  />
</span>
          
  
          <span
            style={{
              fontSize: "12px",
              color: "black",
            }}
          >
            {row?.category_name}
          </span>
  
          <span
            style={{
              fontSize: "12px",
              color: row?.stock < 5 ? "#e63946" : "#2a9d8f"
            }}
          >
             <span style={{ fontSize: "12px", color: "#415a77" }}>
          Stock: {row?.stock ?? 0}
        </span>
        </span>
        </div>
      </div>
    ),
  },
    

    {
      id: "selling_price",
      label: "Price",
      render: (row) => (
        <div style={{ lineHeight: "1.4" }}>
          <div style={{ fontSize: "12px", color: "black", fontWeight: 600}}>
            Cost: ₹{row?.cost_price}
          </div>
          <div style={{ fontSize: "12px",fontWeight: 600 }}>
            Sell: ₹{row?.selling_price}
          </div>
        </div>
      ),
    },
    // { id: "supplier_name", label: "Supplier" },
  
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
  <Button
    variant="contained"
    size="small"
    onClick={() =>extra?.stock(row?.id)}
    sx={{
      minWidth: "30px",
      width: "30px",
      height: "30px",
      padding: "0",
      borderRadius: "50%",
      border: "1px solid #4CAF50",
      backgroundColor: "#DFF5E1",
      color: "#2E7D32",
      
    }}>
   <AddIcon sx={{ fontSize: 16 ,stroke: "currentColor",
    strokeWidth: 1}} />
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
      color: "#1565C0"
    }}
  >
    <EditIcon sx={{ fontSize: 16 }}/>
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
      color: "#D32F2F"
    }}
  >
    <DeleteIcon sx={{ fontSize: 16 }}/>
  </Button>
</Box>
      ),
    }
  ];