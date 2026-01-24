import { Button,Box } from "@mui/material";
export  const columns = [
    { id: "po_number", label: "PO Number" },
    { id: "supplier_name", label: "Supplier" },
    { id: "purchase_date", label: "Date" },
    { id: "total_items", label: "Items" },
    { id: "amount", label: "Amount" },
    // { id: "actions", label: "Actions" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary" onClick={() => extra?.edit(row?.id)}>
            Received Items
          </Button>
    
          {/* <Button size="small" variant="outlined" color="error">
            Delete
          </Button> */}
        </Box>
      ),
    }

  ];
