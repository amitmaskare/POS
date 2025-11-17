import React from "react";
import { Modal, Box, Typography, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import CloseIcon from "@mui/icons-material/Close";

const Aadhaar = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "60%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "relative",
        }}
      >
        {/* Close Icon */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            
            right: 10,
            color: "#475569",
            "&:hover": { background: "transparent", color: "#1e293b" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" color="#5A8DEE" fontWeight="bold" sx={{ textAlign: "left", mt: 1 }}>
          Enter Aadhaar Number
        </Typography>

        <TextField
          label="XXXX XXXX XXXX"
          variant="outlined"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end">
                  <DocumentScannerIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" color="primary" onClick={onClose}>
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default Aadhaar;
