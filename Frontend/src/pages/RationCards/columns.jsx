import { Button,Box } from "@mui/material";

export const columns = [
    { id: "card_number", label: "Card Details" },
    { id: "card_holder_name", label: "Holder Info" },
    { id: "family_member", label: "Limits" },
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