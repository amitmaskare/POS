import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
 export const statsData = [
    {
      title: "Items in Stock",
      value: "3",
      color: "#2196f3",
      icon: <InventoryIcon sx={{ fontSize: 40, color: "#2196f3" }} />,
    },
    {
      title: "Low Stock",
      value: "3",
      color: "#ff9800",
      icon: <WarningAmberIcon sx={{ fontSize: 40, color: "#ff9800" }} />,
    },
    {
      title: "Out of Stock",
      value: "3",
      color: "#f44336",
      icon: <DoDisturbIcon sx={{ fontSize: 40, color: "#f44336" }} />,
    },
    {
      title: "Total Sales",
      value: "3",
      color: "#4caf50",
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: "#4caf50" }} />,
    },
  ];
  