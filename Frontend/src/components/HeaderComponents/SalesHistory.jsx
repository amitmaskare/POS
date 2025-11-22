import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HistoryIcon from "@mui/icons-material/History";


export default function SalesHistoryModal({ open, onClose }) {
  const sales = [
    { id: "TXN001", amount: "$6.35", type: "Cash", items: "2 items", time: "2 hours ago" },
    { id: "TXN002", amount: "$6.50", type: "Credit", items: "2 items", time: "5 hours ago" },
    { id: "TXN003", amount: "$4.35", type: "Cash", items: "2 items", time: "1 day ago" },
  ];

  return (
<Dialog
  open={open}
  onClose={onClose}
  maxWidth="md"
  fullWidth
  sx={{ 
    background: "#f8fafc",
    borderRadius: 3,
    border: "1px solid #e2e8f0",
    mt: 8,
    "& .MuiDialog-container": { ml:20 },
  }}
>
      {/* Header */}
      <DialogTitle
    sx={{
      fontWeight: 600,
      fontSize: 20,
      borderBottom: "1px solid #e2e8f0",
      color: "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1,
    }}
  >
    <Box display="flex" alignItems="center" color="#5A8DEE"  gap={1}>
      <HistoryIcon sx={{ color: "#5A8DEE" }} />
      Sales History
    </Box>

    <IconButton
      onClick={onClose}
      sx={{
        color: "#475569",
        "&:hover": { background: "transparent", color: "#1e293b" },
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

      <DialogContent sx={{ p: 3 ,mt:5}}>
        {sales.map((txn, idx) => (
          <Paper
            key={txn.id}
            sx={{
              p: 2,
              mb: 2,
              background: "#ffffff",
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            {/* Top Row */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={600} color="#5A8DEE">
                # {txn.id}
              </Typography>

              <Box display="flex" alignItems="center" gap={0.5} color="#64748b">
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                <Typography fontSize={14}>{txn.time}</Typography>
              </Box>
            </Box>

            {/* Amount */}
            <Typography fontSize={26} fontWeight={700} mt={1} color="#0f172a">
              {txn.amount}
            </Typography>

            {/* Tags */}
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Chip
                label={txn.type}
                size="small"
                sx={{
                  background: "#5A8DEE",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
              <Chip
                label={txn.items}
                size="small"
                sx={{
                  background: "#5A8DEE",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
            </Box>

            {/* Dropdown Icon */}
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <IconButton size="small">
              </IconButton>
            </Box>
          </Paper>
        ))}
      </DialogContent>
    </Dialog>
  );
}
