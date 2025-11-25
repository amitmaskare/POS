import { Button,Box } from "@mui/material";
export  const columns = [
    { id: "ponumber", label: "PO Number" },
    { id: "supplier", label: "Supplier" },
    { id: "date", label: "Date" },
    { id: "items", label: "Items" },
    { id: "amount", label: "Amount" },
    { id: "status", label: "Status" },
    // { id: "actions", label: "Actions" },
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
