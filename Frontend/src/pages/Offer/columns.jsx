import { Button,Box } from "@mui/material";
export const columns = [
    { id: "offer_name", label: "Offer Name" },
    { id: "product_name", label: "Product Name" },
    { id: "min_qty", label: "Min QTY" },
    { id: "offer_price", label: "Offer Price" },
    { id: "offer_qty_price", label: "Offer QTY Price" },
    { id: "start_date", label: "Start Date" },
    { id: "end_date", label: "End Date" },
    { id: "status", label: "Status" },
   
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.id)}>
            Edit
          </Button>
    
          <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.id)}>
            Delete
          </Button>
        </Box>
      ),
    }
  ];