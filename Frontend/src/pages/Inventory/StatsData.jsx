
import { Box } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartCheckoutOutlinedIcon from "@mui/icons-material/ShoppingCartCheckoutOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";

 export const statsData =({
  lowStockCount,
  outOfStockCount,
  totalSaleCount,
  totalPurchaseCount,
})=> [
    {
      title: "Low Stock",
      value:lowStockCount,
      color: "#ff9800",
      icon: (
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
           
            backgroundColor: "#ed6c0230",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningAmberOutlinedIcon sx={{ fontSize: 25, color: "#ed6c02" }} />
        </Box>
      ), },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      color: "#f44336",
      icon: (
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#fdecea",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CancelOutlinedIcon sx={{ fontSize: 26, color: "#d32f2f" }} />
        </Box>
      ),
    },
     {
      title: "Total Purchases",
      value: totalPurchaseCount,
      color: "#4caf50",
      icon: (
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#e8f5e9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingCartCheckoutOutlinedIcon
            sx={{ fontSize: 26, color: "#2e7d32" }}
          />
        </Box>
      ),
    },
    {
      title: "Total Sales",
      value: totalSaleCount,
      color: "#1565c0",
      icon: (
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#e3f2fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PointOfSaleOutlinedIcon
            sx={{ fontSize: 26, color: "#1565c0" }}
          />
        </Box>
      ),
    }
  ];
  