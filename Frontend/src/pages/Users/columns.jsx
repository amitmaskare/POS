import { Button,Box } from "@mui/material";
export const columns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "role", label: "Role" },
    { id: "status", label: "Status" },
    { id: "created_at", label: "Last Login" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.userId)}>
            Edit
          </Button>
    
          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.userId)}>
            Delete
          </Button>
        </Box>
      ),
    }
  ];