import { Button,Box, Typography, Chip } from "@mui/material";
import ScaleIcon from "@mui/icons-material/Scale";

export const columns = [
    { id: "product_name", label: "Product Name",
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ fontSize: '14px' }}>{row.product_name}</Typography>
          {(row.is_loose === 1 || row.is_loose === true || row.favourite === 'loose') && (
            <Chip
              icon={<ScaleIcon sx={{ fontSize: 14 }} />}
              label={`Rs.${Number(row.price_per_unit || row.selling_price).toFixed(2)}/${row.loose_unit || 'kg'}`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: '11px', height: '22px' }}
            />
          )}
        </Box>
      )
    },
    {
      id: "barcode",
      label: "Barcode",
      render: (row) => (
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          {row.barcode || 'N/A'}
        </Typography>
      )
    },
    { id: "sku", label: "SKU" },
    { id: "qty", label: "QTY" },
    { id: "price", label: "Price" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            color={(row.is_loose === 1 || row.is_loose === true || row.favourite === 'loose') ? "warning" : "success"}
            startIcon={(row.is_loose === 1 || row.is_loose === true || row.favourite === 'loose') ? <ScaleIcon /> : null}
            onClick={() => extra?.selectItem(row)}
          >
            {(row.is_loose === 1 || row.is_loose === true || row.favourite === 'loose') ? "Weigh" : "Select"}
          </Button>
        </Box>
      ),
    }
  ];