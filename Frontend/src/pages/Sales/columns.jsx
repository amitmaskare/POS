import { Button,Box } from "@mui/material";
export  const columns = [
    { id: "invoice_no", label: "Invoice Number" },
    { id: "total_items", label: "Items" },
    { id: "amount", label: "Total Amount" },
    { id: "sale_date", label: "Payment Date" },
    { id: "status", label: "Status" },
    // { id: "actions", label: "Actions" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary" onClick={() => extra?.view(row?.id)}>
            View Detail
          </Button>
    
           <Button size="small" variant="outlined" color="error"  onClick={() => extra?.return(row?.id)}>
            Return
          </Button> 
        </Box>
      ),
    }

  ];
