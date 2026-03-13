import { Button, Box, Chip, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

export const columns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "roleName", label: "Role" },
    {
      id: "store_info",
      label: "Store / Counter Limit",
      render: (row) => {
        // Show for Store Admins (role = 1)
        if (row.role === 1 && row.store_id) {
          const usage = row.counter_count || 0;
          const limit = row.counter_limit || 0;
          const percentage = limit > 0 ? (usage / limit) * 100 : 0;

          let chipColor = 'success';
          if (percentage >= 90) chipColor = 'error';
          else if (percentage >= 70) chipColor = 'warning';

          return (
            <Box>
              <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {row.store_name || row.store_id}
              </Box>
              <Chip
                label={`${usage} / ${limit} counters`}
                color={chipColor}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          );
        }

        // Show for Counter Users (role = 2)
        if (row.role === 2 && row.store_id) {
          return (
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {row.store_name || row.store_id}
            </Box>
          );
        }

        // Super Admin or no store
        return <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>-</Box>;
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
      render: (row,extra) => (
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button size="small" variant="outlined" color="primary"  onClick={() => extra?.edit(row?.userId)}>
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