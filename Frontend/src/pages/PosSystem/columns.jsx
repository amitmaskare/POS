import { Button,Box } from "@mui/material";
export const columns = [
    { id: "product_name", label: "Product Name" },
    { id: "qty", label: "QTY" },
    { id: "price", label: "Price" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="success" onClick={() => extra?.selectItem(row)}>
            Select
          </Button>
        </Box>
      ),
    }
  ];