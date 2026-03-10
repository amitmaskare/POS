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
import {addCustomer,updateCustomer } from "../../services/customerService";

const ModalLayout = ({ open, onClose,onSaved,editData  }) => {
  const [tab, setTab] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    id:"",
  });

  useEffect(() => {
      if (editData) {
      
        setForm({
          name: editData.name || "",
          email: editData.email || "",
          phone: editData.phone || "",
          address: editData.address || "",
          id: editData.id || "",
        });
      } else {
        setForm({
         name: "",
    email: "",
    phone: "",
    address: "",
    id:"",
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
      
          if (form.id) {
           
            result = await updateCustomer(form);
          } else {
          
            result = await addCustomer(form);
          }
      if (result.status === true) {
        setSuccess(result.message);
        setForm({
          id:"",
          name: "",
          email: "",
          phone: "",
          address: "",
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
    
    <DialogTitle
  sx={{
    fontSize: 20,
    fontWeight: 600,
    borderBottom: "1px solid #e0e0e0",
    color:"#fff",
    backgroundColor:"#415a77",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
> 
        Add New Customer
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
          <Grid item xs={12} sm={12} md={12}>
            <TextField
              label="Customer Name"
              name="name"
              fullWidth
              required
              value={form.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="email"
              name="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="phone"
              name="phone"
              fullWidth
              value={form.phone}
              onChange={handleChange}
            />
          </Grid>

            <TextField
              label="address"
              name="address"
              fullWidth
              value={form.address}
              onChange={handleChange}
            />
          
        </Grid>
        <input type="hidden" name="id" value={form.id || ''} />
        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="contained" type="submit" sx={{backgroundColor:"#415a77"}}>Submit</Button>
        </Box>
      </DialogContent>
   <DialogContent/>
  </Dialog>
);

};

export default ModalLayout;
