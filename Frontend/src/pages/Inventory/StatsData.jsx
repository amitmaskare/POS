import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';

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
      icon: <WarningAmberIcon sx={{ fontSize: 40, color: "#ff9800" }} />,
    },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      color: "#f44336",
      icon: <DoDisturbIcon sx={{ fontSize: 40, color: "#f44336" }} />,
    },
     {
      title: "Total Purchases",
      value: totalPurchaseCount,
      color: "#4caf50",
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: "#4caf50" }} />,
    },
    {
      title: "Total Sales",
      value: totalSaleCount,
      color: "#4caf50",
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: "#4caf50" }} />,
    },
  ];
  