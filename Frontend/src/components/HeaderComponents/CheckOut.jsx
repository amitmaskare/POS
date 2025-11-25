import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Paper,
  Divider
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function CashierCheckoutModal({ open, onClose }) {
  const [amount, setAmount] = useState("");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-container": {
            mt: 5, 
            ml:20
           
           
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
  sx={{
    fontSize: 20,
    fontWeight: 600,
    borderBottom: "1px solid #e0e0e0",
    color:"#5A8DEE",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  Cashier Checkout Summary

  {/* Close Icon */}
  <Button
    onClick={onClose}
    sx={{
      minWidth: "auto",
      color: "#475569",
      "&:hover": { background: "transparent", color: "#1e293b" },
    }}
  >
    ✕
  </Button>
</DialogTitle>


      <DialogContent sx={{ p: 3 }}>
        
        {/* User Summary */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            mt:4,
            background: "#ffffff",   
            border: "1px solid #e0e0e0",
          }}
        >
          <Grid container spacing={2} justifyContent={"space-between"}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <PersonIcon sx={{ fontSize: 35, color: "#0284c7" }} />
                <Box>
                  <Typography fontWeight={600} color="#1e293b">
                    Admin User
                  </Typography>
                  <Typography fontSize={13} color="#64748b">
                    Cashier
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <AccessTimeIcon sx={{ fontSize: 35, color: "#16a34a" }} />
                <Box>
                  <Typography fontWeight={600} color="#1e293b">
                    193h 12m
                  </Typography>
                  <Typography fontSize={13} color="#64748b">
                    Session Duration
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Session Time Details */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            background: "#ffffff",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography fontWeight={600} mb={1} color="#1e293b">
            Session Time Details
          </Typography>

          <Box display="flex" justifyContent="space-between" color="#334155">
  <Typography>Login Time:</Typography>
  <Typography>11/7/2025, 9:00:43 AM</Typography>
</Box>

<Box mt={1} display="flex" justifyContent="space-between" color="#334155">
  <Typography>Checkout Time:</Typography>
  <Typography>11/15/2025, 10:13:07 AM</Typography>
</Box>
<Divider sx={{ my: 1, borderColor: "#5A8DEE" }} />
<Box mt={1} display="flex" justifyContent="space-between" color="#334155">
<Typography>Total CheckOut Session:</Typography>
          <Box
            mt={1}
            p={1}
            width="fit-content"
            sx={{
              background: "#e2e8f0",
              borderRadius: 1,
              fontSize: 13,
              color: "#1e293b",
              fontWeight: 600,
            }}
          >
            193h 12m
          </Box>
          </Box>
        </Paper>

        {/* Sales Summary */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            background: "#ffffff",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography fontWeight={600} mb={2} color="#1e293b">
            Sales Summary
          </Typography>

          <Grid container spacing={2} justifyContent={"space-between"}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <ShoppingCartIcon sx={{ color: "#f59e0b" }} />
                <Box>
                  <Typography fontSize={26} fontWeight={700} color="#1e293b">
                    0
                  </Typography>
                  <Typography fontSize={13} color="#64748b">
                    Total Transactions
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} >
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon sx={{ color: "#16a34a" }} />
                <Box>
                  <Typography fontSize={26} fontWeight={700} color="#1e293b">
                    $0.00
                  </Typography>
                  <Typography fontSize={13} color="#64748b">
                    Total Sales
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Cash Validation */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            background: "#ffffff",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography fontWeight={600} mb={2} color="#1e293b">
            Cash Validation
          </Typography>

          <Grid container spacing={2} justifyContent={"space-between"}>
            <Grid item xs={6}>
              <Typography fontSize={14} color="#64748b">
                Expected Cash Amount
              </Typography>
              <Typography fontSize={22} fontWeight={700} color="#1e293b">
                $0.00
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography fontSize={14} color="#64748b">
                Actual Cash Amount *
              </Typography>

              <TextField
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                placeholder="0.00"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    background: "#ffffff",
                    color: "#000",
                    border: "1px solid #cbd5e1",
                    "&:focus-within": {
                      borderColor: "#3b82f6",
                      boxShadow: "0 0 4px #3b82f6",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Buttons */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              mr: 2,
              textTransform: "none",
              borderColor: "#94a3b8",
              color: "#475569",
              borderRadius: 2,
              "&:hover": { borderColor: "#64748b" },
            }}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            fullWidth
            sx={{
              ml: 2,
              textTransform: "none",
              background: "#3b82f6",
              borderRadius: 2,
              "&:hover": { background: "#2563eb" },
            }}
          >
            Complete Checkout
          </Button>
        </Box>

        {/* Footer Note */}
        <Typography
          mt={3}
          fontSize={13}
          color="#dc2626"
          textAlign="center"
        >
          Important: You cannot logout without completing this checkout process.Please ensure all cash amounts are accurately counted and entered.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
