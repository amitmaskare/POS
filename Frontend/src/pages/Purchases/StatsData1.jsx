import { TfiPackage } from "react-icons/tfi";
import WarehouseIcon from "@mui/icons-material/Inventory2";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Box } from "@mui/material";
export const statsData1 = [
  {
    icon: (
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "rgba(33, 150, 243, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WarehouseIcon sx={{ fontSize: 28, color: "#2196f3" }} />
      </Box>
    ),
    title: "Receive Inventory",
    color: "#2196f3",
  },
  {
    icon: (
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "rgba(76, 175, 80, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TrendingUpIcon sx={{ fontSize: 28, color: "#4caf50" }} />
      </Box>
    ),
    title: "Supplier Performance",
    color: "#4caf50",
  },

  {
    icon: (
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 152, 0, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AccountBalanceWalletIcon sx={{ fontSize: 28, color: "#ff9800" }} />
      </Box>
    ),
    title: "Cost Analysis",
    color: "#ff9800",
  }
];