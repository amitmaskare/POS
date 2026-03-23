import PeopleIcon from "@mui/icons-material/People";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Box } from "@mui/material";
export  const stats = [
    {
      title: "Total Users",
      value: "3",
      color: "#6ca0fe",
      icon:(
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
        > <PeopleIcon sx={{ fontSize: 28, color: "#6ca0fe", }} />
        </Box>
    ),
    },
    {
      title: "Active Users",
      value: "2",
      color: "green",
      icon: (<Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%", 
          display: "flex",
          backgroundColor: "rgba(0,128,0,0.15)",
          alignItems: "center",
          justifyContent: "center",
        }}
      ><PersonOutlineIcon sx={{ fontSize: 28, color: "green" }} />
      </Box>
    ),
    },
    {
      title: "Managers",
      value: "$1070",
      color: "#ffc44d",
      icon: (<Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%", 
          display: "flex",
          backgroundColor: "#ed6c0230",
          alignItems: "center",
          justifyContent: "center",
        }}
      > <PersonOutlineIcon sx={{ fontSize: 28,color: "#ffc44d" }} />
      </Box>
    ),
    },
    {
      title: "Admins",
      value: "$2141",
      color: "#6ca0fe",
      icon: (<Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: "50%", 
          display: "flex",
          backgroundColor: "#6a4c9330",
          alignItems: "center",
          justifyContent: "center",
        }}
      ><AdminPanelSettingsIcon sx={{ fontSize: 28,color: "#6ca0fe" }} />
      </Box>
    ),
    },
  ];