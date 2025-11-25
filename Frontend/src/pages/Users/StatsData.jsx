import PeopleIcon from "@mui/icons-material/People";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
export  const stats = [
    {
      title: "Total Users",
      value: "3",
      color: "#6ca0fe",
      icon: <PeopleIcon sx={{ fontSize: 40, color: "#6ca0fe", }} />,
    },
    {
      title: "Active Users",
      value: "2",
      color: "green",
      icon: <PersonOutlineIcon sx={{ fontSize: 40, color: "green" }} />,
    },
    {
      title: "Managers",
      value: "$1070",
      color: "#ffc44d",
      icon: <PersonOutlineIcon sx={{ fontSize: 40,color: "#ffc44d" }} />,
    },
    {
      title: "Admins",
      value: "$2141",
      color: "#6ca0fe",
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 40,color: "#6ca0fe" }} />,
    },
  ];