
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {
     Typography, Chip,  Stack
  } from '@mui/material';
  export const customerColumns = [
    {
      id: "name",
      label: "Name",
      render: (value) => <Typography fontWeight={600}>{value}</Typography>,
    },
    {
      id: "contact",
      label: "Contact",
      render: (value, row) => (
        <Stack spacing={0.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MailOutlineIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{row.email}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PhoneIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{row.phone}</Typography>
          </Stack>
        </Stack>
      )
    },
    {
      id: "address",
      label: "Address",
      render: (value) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <LocationOnIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">{value}</Typography>
        </Stack>
      ),
    },
    {
      id: "purchases",
      label: "Total Purchases",
      render: (value) => (
        <Typography fontWeight={600}>₹{value}</Typography>
      ),
    },
    {
      id: "lastVisit",
      label: "Last Visit",
      render: (value) => value,
    },
    {
      id: "status",
      label: "Status",
      render: (value) => (
        <Chip
          label={value}
          sx={{
            bgcolor: value === "active" ? "#94baff" : "#2f384d",
            color: value === "active" ? "#1c2128" : "#fff",
            textTransform: "lowercase",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      render: (value) => value,
    },
  ];
  