import { Button,Box } from "@mui/material";
export const columns = [
    { id: "sku", label: "SKU" },
    { id: "product_name", label: "Product Name" },
    { id: "category_id", label: "Category" },
    { id: "units", label: "Units/Package" },
    { id: "unit_price", label: "Unit Price" },
    { id: "min_stock", label: "Stock" },
    { id: "supplier_id", label: "Supplier" },
    { id: "status", label: "Status" },
    {
      id: "actions",
      label: "Actions",
      render: (row) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary">
            Edit
          </Button>
    
          <Button size="small" variant="outlined" color="error">
            Delete
          </Button>
        </Box>
      ),
    }
  ];