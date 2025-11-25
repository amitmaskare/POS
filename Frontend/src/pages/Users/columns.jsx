import { Button,Box } from "@mui/material";
export const columns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "role", label: "Role" },
    { id: "status", label: "Status" },
    { id: "created_at", label: "Last Login" },

    { id: "lastlogin", label: "Last Login" },
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