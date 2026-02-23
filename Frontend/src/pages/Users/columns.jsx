import { Button,Box } from "@mui/material";
export const columns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "roleName", label: "Role" },
    { id: "created_at", label: "Created At" },
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
 
          <Button
            size="small"
            variant="outlined"
            sx={{
              borderColor: "#5A8DEE",
              color: "#5A8DEE",
              "&:hover": {
                borderColor: "#4a7dd9",
                backgroundColor: "#f0f4ff"
              }
            }}
            onClick={() => extra?.managePermissions(row?.userId)}
          >
            Manage Permissions
          </Button>
        </Box>
      ),
    }
  ];