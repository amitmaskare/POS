import { Button,Box } from "@mui/material";

export const columns = [
    {id: "image",
    label: "Image",
    render: (row) => (
      <img
        src={row?.image || ""}
        alt="product"
        width={45}
        height={45}
        style={{
          objectFit: "cover",
          borderRadius: 6,
        }}
      />
    ),
  },
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
  <Button
    variant="outlined"
    size="small"
    onClick={() =>extra?.stock(row?.id)}
    sx={{
      fontSize: "11px",
      padding: "2px 8px",
      minWidth: "auto",
    }}
  >
    Add Stock
  </Button>

  <Button
    variant="outlined"
    size="small"
    onClick={() => extra?.edit(row?.id)}
    sx={{
      fontSize: "11px",
      padding: "2px 8px",
      minWidth: "auto",
    }}
  >
    Edit
  </Button>

  <Button
    variant="outlined"
    size="small"
    color="error"
    onClick={() => extra?.deleteItem(row?.id)}
    sx={{
      fontSize: "11px",
      padding: "2px 8px",
      minWidth: "auto",
    }}
  >
    Delete
  </Button>
</Box>
      ),
    }
  ];