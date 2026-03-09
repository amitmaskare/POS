import { Button,Box } from "@mui/material";
export const Column = [
    { id: "name", label: "Permission Name" },
  
    { id: "created_at", label: "Created Date" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.permissionId)}>
            Edit
          </Button>
    
          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.permissionId)}>
            Delete
          </Button>
        </Box>
      ),
    }
  ];