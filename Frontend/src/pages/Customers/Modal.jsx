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
        Add New Customer
      </Typography>

      {success && <Typography color="green">{success}</Typography>}
      {error && <Typography color="red">{error}</Typography>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>

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
          <Button variant="contained" type="submit">Submit</Button>
        </Box>
      </Box>
    </Paper>
  </Modal>
);

};

export default ModalLayout;
