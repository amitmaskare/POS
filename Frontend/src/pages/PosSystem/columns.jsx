import { Button,Box } from "@mui/material";
export const columns = [
  {
    id: "product_name",
    label: "Product Details",
    render: (row) => (
      <div>
        <div>{row.product_name}</div>
        <div style={{ fontSize: "12px", color: "black" }}>
         <span style={{ fontSize: "12px", color: "#415A77" }}>QTY:</span>  {row.qty}
        </div>
      </div>
    )
  },

    { id: "price", label: "Price" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="contained" color="success" onClick={() => extra?.selectItem(row)}>
            Select
          </Button>
        </Box>
      ),
    }
  ];