import BarChartIcon from "@mui/icons-material/BarChart";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
export const statsData = [
    {
      title: "Total Sales",
      value: "$450.75",
      change: "+12.5%",
      color: "#6ca0fe",
      icon: <BarChartIcon sx={{ fontSize: 30, color: "#6ca0fe" }}/>,
    },
    {
      title: "Transactions",
      value: "23",
      change: "+4.2%",
      color: "green",
      icon: <ShoppingCartIcon sx={{ fontSize: 30, color: "green" }}/>,
    },
    {
      title: "Average Transaction",
      value: "$19.60",
      change: "+3.1%",
      color: "#ffc44d",
      icon: <TrendingUpIcon sx={{ fontSize: 30, color: "#ffc44d" }} />,
    },
    {
      title: "Top Product",
      value: "Coffee",
      sub: "15 sold",
      color: "#6ca0fe",
      icon: <LeaderboardIcon sx={{ fontSize: 30, color: "#6ca0fe" }}/>,
    },
  ];