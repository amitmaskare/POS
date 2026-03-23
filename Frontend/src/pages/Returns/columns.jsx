import { Button,Box } from "@mui/material";
export  const columns = [
  {
    id: "invoice_info",
    label: "Invoice Info",
    render: (row) => (
      <>
        <div style={{fontWeight:600}}>{row.invoice_no}</div>
        <div style={{fontSize:"12px", color:"#777",fontWeight:600}}>{row.return_date}</div>
      </>
    )
  },
  {
    id: "summary",
    label: "Summary",
    render: (row) => (
      <>
        <div>Items: {row.total_items}</div>
        <div style={{fontWeight:600}}>₹{row.amount}</div>
      </>
    )
  },
    // { id: "amount", label: "Refund Amount" },
    { id: "status", label: "Type" },
    // { id: "return_date", label: "Return Date" },
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
