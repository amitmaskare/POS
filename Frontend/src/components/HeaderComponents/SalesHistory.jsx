import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
      maxWidth="sm"
      fullWidth
      sx={{
        background: "#f8fafc",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        mt: 8,
        "& .MuiDialog-container": {
          ml:20
      },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: 20,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} color="#5A8DEE">
          <HistoryIcon />
          Sales History
        </Box>

        <IconButton
          onClick={onClose}
          sx={{ "&:hover": { background: "transparent" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent sx={{ p: 3, mt: 2 }}>
        {sales.map((txn) => (
          <Paper
            key={txn.id}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              background: "#fff",
            }}
          >
            {/* Row 1 */}
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight={600} color="#5A8DEE">
                # {txn.id}
              </Typography>

              <Box display="flex" alignItems="center" gap={0.5} color="#64748b">
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                <Typography fontSize={14}>{txn.time}</Typography>
              </Box>
            </Box>

            {/* Amount */}
            <Typography fontSize={26} fontWeight={700} mt={1}>
              {txn.amount}
            </Typography>

            {/* Tags */}
            <Box display="flex" gap={1} mt={1}>
              <Chip
                label={txn.type}
                size="small"
                sx={{ background: "#5A8DEE", color: "#fff" }}
              />
              <Chip
                label={txn.items}
                size="small"
                sx={{ background: "#5A8DEE", color: "#fff" }}
              />
            </Box>
          </Paper>
        ))}
      </DialogContent>
    </Dialog>
  );
}
