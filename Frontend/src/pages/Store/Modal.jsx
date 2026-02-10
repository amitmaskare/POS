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

import {addStore,updateStore } from "../../services/storeService";

const ModalLayout = ({ open, onClose,onSaved,editData  }) => {
  const [tab, setTab] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    store_name: "",
    email: "",
    phone: "",
    address: "",
    type: "",
    id:"",
  });

  useEffect(() => {
      if (editData) {
      
        setForm({
          store_name: editData.store_name || "",
          email: editData.email || "",
          phone: editData.phone || "",
          address: editData.address || "",
          type: editData.type || "",
          id: editData.id || "",
        });
      } else {
        setForm({
         store_name: "",
    email: "",
    phone: "",
    address: "",
    type: "",
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
           
            result = await updateStore(form);
          } else {
          
            result = await addStore(form);
          }
      if (result.status === true) {
        setSuccess(result.message);
        setForm({
          id:"",
          store_name: "",
          email: "",
          phone: "",
          address: "",
          type: "",
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
  <Modal open={open} onClose={onClose}>
    <Paper
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "50%",
        p: 4,
        borderRadius: 3,
        outline: "none",
      }}
    >
      <Typography variant="h6" mb={2} color="#5A8DEE" fontWeight="bold">
        Add Store
      </Typography>

      {success && <Typography color="green">{success}</Typography>}
      {error && <Typography color="red">{error}</Typography>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          {/* CUSTOMER NAME col-12 full width */}
          <Grid item xs={12} sm={12} md={12}>
            <TextField
              label="Store Name"
              name="store_name"
              fullWidth
              required
              value={form.store_name}
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
           <Grid item xs={12}>
                        <TextField
                        label="Type"
                                           name="type"
                                           select
                                           fullWidth
                                           required
                                           value={form.type}
                                          onChange={handleChange}
                                         >
                                           <MenuItem value="">Select</MenuItem>
                                           <MenuItem value="Retailer">Retailer</MenuItem>
                                           <MenuItem value="Store">Store</MenuItem>
                                         </TextField>
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
          <Button variant="contained" type="submit">Submit</Button>
        </Box>
      </Box>
    </Paper>
  </Modal>
);

};

export default ModalLayout;
