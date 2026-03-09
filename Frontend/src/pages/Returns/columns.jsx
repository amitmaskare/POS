import { Button,Box } from "@mui/material";
export  const columns = [
    { id: "invoice_no", label: "Invoice Number" },
    { id: "total_items", label: "Total Items" },
    { id: "amount", label: "Refund Amount" },
    { id: "status", label: "Type" },
    { id: "return_date", label: "Return Date" },
    // { id: "actions", label: "Actions" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button size="small" variant="outlined" color="primary" onClick={() => extra?.view(row?.id)}>
            View Detail
          </Button>
        </Box>
      ),
    }

  ];
