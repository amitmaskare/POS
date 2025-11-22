import React from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";

export default function Transactions() {
  return (
    <Box
      sx={{
        
        minHeight: "100vh",
        p: 4,
        color: "#f1f5f9",
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#5A8DEE">
            Transactions
          </Typography>
          <Typography variant="body2" color="#94a3b8">
            Manage store transactions
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<CalendarTodayIcon />}
            sx={{ }}
          >
            Date Range
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{  }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: "#3b82f6" }}
          >
            New Transaction
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box display="flex" gap={1} mb={3}>
        <TextField
          variant="outlined"
          placeholder="Search transactions..."
          fullWidth
          size="small"
          InputProps={{
            sx: { },
            endAdornment: (
              <IconButton>
                <SearchIcon sx={{ color: "#5A8DEE" }} />
              </IconButton>
            ),
          }}
        />
        <IconButton sx={{ bgcolor: "#1e293b", color: "#f1f5f9" }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* All Transactions Box */}
      <Paper
        sx={{
          p: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          All Transactions
        </Typography>
      </Paper>
    </Box>
  );
}
