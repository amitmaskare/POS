import {Box,Chip} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
  
  export  const rows = [
    {
      ponumber: "PO-001",
      supplier: "ABC Beverages Ltd",
      date: "2024-08-30",
      items: "5 items",
      amount: "$1250.00",
      status: (
        <Chip
          label="Received"
          size="small"
          sx={{
            bgcolor: "#D4F8D4",
            color: "#1B5E20",
            fontWeight: 600,
            textTransform: "capitalize",
            borderRadius: "6px"
          }}
        />
      ),

      actions: [<Box display="flex" alignItems="center" gap={1.5}><VisibilityIcon sx={{ fontSize: 18 }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>]

    },
    {
      ponumber: "PO-002",
      supplier: "Snack Distributors Inc",
      date: "2024-08-29",
      items: "8 items",
      amount: "$850.50",
      status: (
        <Chip
          label="Partials"
          size="small"
          sx={{
            bgcolor: "#FFF4CC",
            color: "#B8860B",
            fontWeight: 600,
            textTransform: "capitalize",
            borderRadius: "6px"
          }}
        />
      ),

      actions: [<Box display="flex" alignItems="center" gap={1.5}><VisibilityIcon sx={{ fontSize: 18 }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>]
    },
    {
      ponumber: "PO-003",
      supplier: "Office Supplies Co",
      date: "2024-08-28",
      items: "3 items",
      amount: "$320.75",
      status: (
        <Chip
          label="Pending"
          size="small"
          sx={{
            bgcolor: "#FFF4CC",
            color: "#B8860B",
            fontWeight: 600,
            textTransform: "capitalize",
            borderRadius: "6px"
          }}
        />
      ),

      actions: [<Box display="flex" alignItems="center" gap={1.5}><VisibilityIcon sx={{ fontSize: 18 }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>]
    },
    {
      ponumber: "PO-004",
      supplier: "Fresh Foods Market",
      date: "2024-08-27",
      items: "12 items",
      amount: "$675.25",
      status: (
        <Chip
          label="Received"
          size="small"
          sx={{
            bgcolor: "#D4F8D4",
            color: "#1B5E20",
            fontWeight: 600,
            textTransform: "capitalize",
            borderRadius: "6px"
          }}
        />
      ),

      actions: [<Box display="flex" alignItems="center" gap={1.5}><VisibilityIcon sx={{ fontSize: 18 }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>]

    },
  ];