import { Button,Box } from "@mui/material";
export const Column = [
    { id: "role_name", label: "Role Name" },
    { id: "updated_at", label: "Date" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.role_id)}>
            Edit
          </Button>
    
          {/* <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.role_id)}>
            Delete
          </Button> */}
        </Box>
      ),
    }
  ];