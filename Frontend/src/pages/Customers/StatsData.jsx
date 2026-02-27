import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import { Box } from "@mui/material";
export const stats = [
    {
      title: "Total Customers",
      value: "3",
      color: "#00838f",
      icon: (
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#e0f7fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PeopleOutlinedIcon
            sx={{ fontSize: 26, color: "#00838f" }}
          />
        </Box>
      ),
    },
    {
      title: "Active Customers",
      value: "2",
      color: "#2e7d32",
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
          <GroupsOutlinedIcon
            sx={{ fontSize: 26, color: "#2e7d32" }}
          />
        </Box>
      ),
    },
    {
      title: "Avg Purchase",
      value: "$1070",
      color: "#6a1b9a",
      icon: (
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#f3e5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingUpOutlinedIcon
            sx={{ fontSize: 26, color: "#6a1b9a" }}
          />
        </Box>
      ),
    },
    {
      title: "Total Revenue",
      value: "$2141",
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
          <AttachMoneyOutlinedIcon
            sx={{ fontSize: 26, color: "#1565c0" }}
          />
        </Box>
      ),
    },
  ];