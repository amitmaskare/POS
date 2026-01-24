import { Button,Box } from "@mui/material";

export const columns = [
    { id: "sku", label: "SKU" },
    { id: "product_name", label: "Product Name" },
    { id: "category_name", label: "Category" },
    { id: "stock", label: "Stock" },
    { id: "cost_price", label: "Cost Price" },
    { id: "selling_price", label: "Selling Price" },
    { id: "supplier_name", label: "Supplier" },
    { id: "status", label: "Status" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
           <Button size="small" variant="outlined" color="primary" onClick={() =>extra?.stock(row?.id)}>
            Add Stock
          </Button>
          <Button size="small" variant="outlined" color="primary" onClick={() => extra?.edit(row?.id)}>
            Edit
          </Button>
    
          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.id)}>
            Delete
          </Button>
        </Box>
      ),
    }
  ];