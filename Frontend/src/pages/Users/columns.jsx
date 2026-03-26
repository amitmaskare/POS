import { Button, Box } from "@mui/material";
import { Tooltip, Chip } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
export const getColumns = (isDark) => [
  {
    id: "name",
    label: "User Info",
    render: (row) => (
      <div style={{ display: "flex", flexDirection: "column", fontSize: "12.9px", gap: "2px" }}>
        {/* Name */}
        <span style={{ fontWeight: 600, textTransform: "capitalize", color: isDark ? "#fff" : "#415A77" }}>{row?.name}</span>

        {/* Email */}
        <span style={{ fontSize: "12px", fontWeight: 600 }}>{row?.email}</span>

        {/* Role */}
        <span style={{ fontSize: "12px", fontWeight: 600 }}>{row?.roleName}</span>
      </div>
    ),
  },
  {
    id: "created_at",
    label: "Created At",
    render: (row) => {
      if (!row?.created_at) return "";

      const dateObj = new Date(row.created_at);

      const formattedDate = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const formattedTime = dateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return (
        <span style={{ fontSize: "12px", fontWeight: 600 }}>
          {formattedDate} <br />
          {formattedTime}
        </span>
      );
    }
    },
    {
    id: "device_status",
    label: "Device Status",
    render: (row) => {
      // Only show for Cashiers (role = 2)
      if (row.role === 2) {
        const isLocked = row.device_locked === 1;
        const deviceId = row.device_id;

        return (
          <Box display="flex" alignItems="center" gap={1}>
            {isLocked ? (
              <Tooltip title={`Device ID: ${deviceId || 'N/A'}`}>
                <Chip
                  icon={<LockIcon />}
                  label="Device Locked"
                  color="success"
                  size="small"
                />
              </Tooltip>
            ) : (
              <Chip
                icon={<LockOpenIcon />}
                label="Not Bound"
                color="default"
                size="small"
              />
            )}
          </Box>
        );
      }

      // Not applicable for non-cashier roles
      return <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>-</Box>;
    }
  },
  { id: "created_at", label: "Created At" },
  {
    id: "actions",
    label: "Actions",
    render: (row, extra) => (
      <Box display="flex" gap={1} flexWrap="wrap">
        <Button size="small" variant="outlined" color="primary" onClick={() => extra?.edit(row?.userId)}>
          Edit
        </Button>

        <Button size="small" variant="outlined" color="error" onClick={() => extra?.deleteItem(row?.userId)}>
          Delete
        </Button>

        <Button
          size="small"
          variant="outlined"
          sx={{
            borderColor: "#5A8DEE",
            color: "#5A8DEE",
            "&:hover": {
              borderColor: "#4a7dd9",
              backgroundColor: "#f0f4ff"
            }
          }}
          onClick={() => extra?.managePermissions(row?.userId)}
        >
          Manage Permissions
        </Button>

        {/* Show Unbind Device button only for locked cashiers */}
        {row.role === 2 && row.device_locked === 1 && (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => extra?.unbindDevice(row?.userId)}
          >
            Unbind Device
          </Button>
        )}
      </Box>
    ),
  }
];