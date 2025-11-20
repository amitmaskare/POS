import {Box} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
  export   const rows = [
    { name: "John", username: "Cashier", email: "John@gmail.com", role: [<PeopleIcon sx={{ color: "blue" }}  />,"Cashier"], status: "active",  lastlogin: "2024-08-11", actions: [<Box display="flex" alignItems="center" gap={1.5}><DeleteIcon sx={{ fontSize: 18, color: "red" }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>] },
    { name: "jane", username: "Manager", email: "jane@gmail.com", role: [<PersonOutlineIcon sx={{ color: "violet" }} />,"Manager"], status: "active",  lastlogin: "2024-08-11",  actions: [<Box display="flex" alignItems="center" gap={1.5}><DeleteIcon sx={{ fontSize: 18, color: "red" }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>] },
    { name: "june", username: "Admin", email: "june@gmail.com", role: [<AdminPanelSettingsIcon sx={{ color: "green" }} />,"Admin"], status: "active",  lastlogin: "2024-08-11 ",  actions: [<Box display="flex" alignItems="center" gap={1.5}><DeleteIcon sx={{ fontSize: 18, color: "red" }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>]},
  ];