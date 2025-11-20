import { Box, Typography } from "@mui/material";

export const columns = [
  {
    id: "carddetails",
    label: "Card Details",
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {value.icon}
        </Box>

        <Box>
          <Typography fontWeight={600}>{value.type}</Typography>
          <Typography variant="body2" color="text.secondary">
            {value.number}
          </Typography>
        </Box>
      </Box>
    ),
  },

  {
    id: "holderinfo",
    label: "Holder Info",
    render: (value) => (
      <Box>
        <Typography fontWeight={600}>{value.name}</Typography>
        <Typography fontSize="0.875rem">{value.phone}</Typography>
        <Typography fontSize="0.875rem">
          {value.members} members
        </Typography>
      </Box>
    ),
  },

  {
    id: "limits",
    label: "Limits",
    render: (value) => {
      if (!value) {
        return <Typography fontSize="0.875rem">N/A</Typography>;
      }
  
      // If it's already an array
      if (Array.isArray(value)) {
        return (
          <Box>
            {value.map((item, i) => (
              <Typography key={i} fontSize="0.875rem">
                {item}
              </Typography>
            ))}
          </Box>
        );
      }
  
      // If it's a string → split normally
      if (typeof value === "string") {
        return (
          <Box>
            {value.split(",").map((item, i) => (
              <Typography key={i} fontSize="0.875rem">
                {item.trim()}
              </Typography>
            ))}
          </Box>
        );
      }
  
      // If object → convert safely
      return (
        <Typography fontSize="0.875rem">
          {JSON.stringify(value)}
        </Typography>
      );
    },
  },
  

  {
    id: "status",
    label: "Status",
    render: (value) => (
      <Typography
        fontWeight={600}
        color={value === "Active" ? "green" : "red"}
      >
        {value}
      </Typography>
    ),
  },

  {
    id: "actions",
    label: "Actions",
    render: (value) => <Box display="flex" gap={1}>{value}</Box>,
  },
];
