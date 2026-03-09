import { Button,Box } from "@mui/material";
export const Column = [
    { id: "name", label: "Name" },
  
    { id: "created_at", label: "Created Date" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.roleId)}>
            Edit
          </Button>
    
          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.roleId)}>
            Delete
          </Button>
        </Box>
      ),
    }
  ];