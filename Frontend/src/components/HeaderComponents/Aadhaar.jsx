import React from "react";
import { Modal, Box, Typography, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";

const Aadhaar = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-container": {
          mt: 6,

        },
        "& .MuiPaper-root": {
          borderRadius: "1.2rem",
        }
      }}
    >
      {/* Close Icon */}


      <DialogTitle
        sx={{
          fontSize: 20,
          fontWeight: 600,
          borderBottom: "1px solid #e0e0e0",
          color: "#fff",
          backgroundColor: "#415a77",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >  Enter Aadhaar Number
        <Button
          onClick={onClose}
          sx={{
            minWidth: "auto",
            color: "#fff",
            "&:hover": { background: "transparent", color: "#1e293b" },
          }}
        >
          ✕
        </Button>
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 3 }}>
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

        <Button variant="contained" onClick={onClose} sx={{ mt: 3, backgroundColor: "#415a77" }}>
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default Aadhaar;
