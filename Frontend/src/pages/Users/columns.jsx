import { Button, Box, Chip } from "@mui/material";

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
    { id: "created_at", label: "Created At" },
    {
      id: "actions",
      label: "Actions",
      render: (row,extra) => (
        <Box display="flex" gap={1}>
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
        </Box>
      ),
    }
  ];