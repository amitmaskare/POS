import { Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const customerRows = [
  {
    name: "John Doe",
    email: "john@gmail.com",
    phone: "9876543210",   // ✅ changed contact → phone
    address: "Hyderabad",
    purchases: 4500,
    lastVisit: "12 Nov 2025",
    status: "active",
    actions: (
      <Box display="flex" alignItems="center" gap={1.5}>
        <DeleteIcon sx={{ fontSize: 18, color: "red" }} />
        <EditIcon sx={{ fontSize: 18, color: "green" }} />
      </Box>
    )
  },
  {
    name: "Aisha Khan",
    email: "aisha@mail.com",
    phone: "9785612345",   // ✅ changed contact → phone
    address: "Bangalore",
    purchases: 2500,
    lastVisit: "10 Nov 2025",
    status: "inactive",
    actions: (
      <Box display="flex" alignItems="center" gap={1.5}>
        <DeleteIcon sx={{ fontSize: 18, color: "red" }} />
        <EditIcon sx={{ fontSize: 18, color: "green" }} />
      </Box>
    )
  }
];
