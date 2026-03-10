import { Button,Box } from "@mui/material";
export  const columns = [
  {
    id: "po_number",
    label: "PO Details",
    render: (row) => (
      <div>
        <div>{row.po_number}</div>
        <div style={{ fontSize: "12px", color: "#415A77" }}>
          {row.purchase_date}
        </div>
      </div>
    )
  },
  {
    id: "supplier_name",
    label: "Supplier Details",
    render: (row) => (
      <div>
        <div>{row.supplier_name}</div>
        <div style={{ fontSize: "12px", color: "#415A77" }}>
          Items: {row.total_items}
        </div>
      </div>
    )
  },
    // { id: "purchase_date", label: "Date" },
    // { id: "total_items", label: "Items" },
    { id: "amount", label: "Amount" },
    {
      id: "actions",
      label: "Actions",
      render: (row, extra) => {
        // ✅ SAFETY: Validate input parameters
        if (!row || typeof row !== 'object') return <Box>-</Box>;
        
        const handleClick = () => {
          if (extra?.edit && typeof extra.edit === 'function' && row?.id) {
            extra.edit(row.id);
          }
        };
        
        return (
          <Box display="flex" gap={1}>
            <Button 
              size="small" 
              variant="outlined" 
              color="primary" 
              onClick={handleClick}
              disabled={!row?.id}
            >
              Received Items
            </Button>
          </Box>
        );
      },
    }
  ];
