import { Button,Box,Avatar } from "@mui/material";

export const columns = [
    { id: "store_name", label: "Store Name" },
    { id: "store_id", label: "Store ID" },
    { id: "phone", label: "Phone" },
    { id: "email", label: "Email" },
    { id: "address", label: "Address" },
    { id: "location", label: "Location" },
    { id: "type", label: "Type" },
    {
      id: "logo",
      label: "Logo",
      render: (row) => (
        <Avatar
          src={row?.logo}
          alt={row?.store_name}
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
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