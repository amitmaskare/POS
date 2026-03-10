import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Modal,
  Tabs,
  Tab,
  Grid,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";

import {addPermission,updatePermission } from "../../services/PermissionService";

const ModalLayout = ({ open, onClose,onSaved,editData   }) => {
  const [tab, setTab] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    permissionId : "",
  });

   useEffect(() => {
    if (editData) {
    
      setForm({
        name: editData.name || "",
        permissionId : editData.permissionId  || "",
      });
    } else {
      setForm({
        name: "",
        permissionId :"",
      });
    }
  }, [editData, open]); 

  const handleTabChange = (_, newValue) => setTab(newValue);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      let result;

    if (form.permissionId ) {
      // UPDATE USER
      result = await updatePermission(form);
    } else {
      // ADD USER
      result = await addPermission(form);
    }
      if (result.status === true) {
        setSuccess(result.message);
        setForm({
           permissionId : "",
          name: "",
        });
        onClose();
         onSaved();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to save product");
    }
  };

 

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
    >
        Add Role
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

      {success && <Typography color="green">{success}</Typography>}
      {error && <Typography color="red">{error}</Typography>}

      <DialogContent component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} mt={3}>

          {/* CUSTOMER NAME col-12 full width */}
           
            <TextField
              label="Name"
             name="name"
              fullWidth
              required
              value={form.name}
              onChange={handleChange}
            />
                                
        </Grid>
        <input type="hidden" name="permissionId " value={form.permissionId  || ''} />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="contained" sx={{backgroundColor:"#415A77"}} type="submit">Submit</Button>
        </Box>
      </DialogContent>
  </Dialog>
);

};

export default ModalLayout;
