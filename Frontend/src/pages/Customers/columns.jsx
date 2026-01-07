import { Button,Box } from "@mui/material";

export const columns = [
    { id: "name", label: "Name" },
    { id: "phone", label: "Contact" },
    { id: "email", label: "Email" },
    { id: "address", label: "Address" },
    { id: "status", label: "Status" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
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