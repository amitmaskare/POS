import {Box} from '@mui/material';
    
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
export const rows = [
    {
      carddetails: {
        icon:<AdminPanelSettingsIcon color='success' />,
        type: "BPL",
        number: "987654321098",
      },
      holderinfo: {
        name: "Rajesh Kumar",
        phone: "+91 9876543214",
        members: 4
      },
      limits: "Rice: 15 Kg, Wheat: 15 Kg, Sugar: 3 Kg, Kerosene: 8 L",
      status: "Active",
      actions: [<Box display="flex" alignItems="center" gap={1.5}><DeleteIcon sx={{ fontSize: 18, color: "red" }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>]
    },
    {
      carddetails: {
        icon: <PersonOutlineIcon color='primary' />,
        type: "AAY",
        number: "987654321098",
      },
      holderinfo: {
        name: "Sunita Sharma",
        phone: "+91 8765432109",
        members: 6
      },
      limits: "Rice: 35 Kg, Wheat: 35 Kg, Sugar: 5 Kg, Kerosene: 10 L",
      status: "Active",
      actions: [<Box display="flex" alignItems="center" gap={1.5}><DeleteIcon sx={{ fontSize: 18, color: "red" }} /> <EditIcon sx={{ fontSize: 18, color: "green" }} />  </Box>]
    }
  ];