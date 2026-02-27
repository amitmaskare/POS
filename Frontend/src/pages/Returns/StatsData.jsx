
import { TfiPackage } from "react-icons/tfi";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { Box } from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
export  const statsData = [
    { title: "Total Products", value: 9, color: "#2196f3",  icon: (
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%", 
          display: "flex",
          backgroundColor:"#e3f2fd",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Inventory2OutlinedIcon sx={{ fontSize: 28, color: "#2196f3" }} />
      </Box>
    ),},
    { title: "Active Products", value: 6, color: "#4caf50",icon: (
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "rgba(0,128,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <VerifiedOutlinedIcon sx={{ fontSize: 28, color: "green" }} />
      </Box>
    ),},
    { title: "Low Stock", value: 3, color: "#ff9800",  icon: (
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
    { title: "Categories", value: 3, color: "#6a4c93", icon: (
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "#6a4c9330",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CategoryOutlinedIcon sx={{ fontSize: 28, color: "#6a4c93" }} />
      </Box>
    ), },

  ];