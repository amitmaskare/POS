import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Modal,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
} from "@mui/material";
import {addStore,updateStore } from "../../services/storeService";

const ModalLayout = ({ open, onClose,onSaved,editData  }) => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    store_name: "",
    email: "",
    phone: "",
    address: "",
    type: "",
    location: "",
    logo:"",
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
          location: editData.location || "",
          logo: editData.logo || "",
          id: editData.id || "",
        });
      } else {
        setForm({
         store_name: "",
    email: "",
    phone: "",
    address: "",
    type: "",
    location: "",
    logo: "",
    id:"",
        });
      }
    }, [editData, open]);

 const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files && files.length ? files[0] : value,
    }));
  };
   const [imagePreview, setImagePreview] = useState("");
    useEffect(() => {
        if (form.logo instanceof File) {
          const url = URL.createObjectURL(form.logo);
          setImagePreview(url);
          return () => URL.revokeObjectURL(url);
        } else if (typeof form.logo === 'string' && form.logo.startsWith('http')) {
          setImagePreview(form.logo);
        } else {
          setImagePreview("");
        }
      }, [form.logo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Validation
    if (!form.store_name || String(form.store_name).trim() === "") {
      setError("Store Name is required");
      return;
    }
    if (!form.email || String(form.email).trim() === "") {
      setError("Email is required");
      return;
    }
    if (!form.phone || String(form.phone).trim() === "") {
      setError("Phone is required");
      return;
    }
    if (!form.address || String(form.address).trim() === "") {
      setError("Address is required");
      return;
    }
    if (!form.type) {
      setError("Type is required");
      return;
    }

    try {
      setLoading(true);
      let result;
      
      if (form.id) {
        result = await updateStore(form);
      } else {
        result = await addStore(form);
      }
      if (result.status === true) {
        setSuccess(result.message);
        setTimeout(() => {
          setForm({
            id:"",
            store_name: "",
            email: "",
            phone: "",
            address: "",
            type: "",
            location: "",
            logo: "",
          });
          onClose();
          onSaved();
        }, 1500);
      } else {
        setError(result.message || "Failed to save store");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save store");
    } finally {
      setLoading(false);
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
        maxHeight: "90vh",
        overflow: "auto",
        p: 4,
        borderRadius: 3,
        outline: "none",
      }}
    >
      <Typography variant="h6" mb={2} color="#5A8DEE" fontWeight="bold">
        {form.id ? "Edit Store" : "Add Store"}
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          {/* Store Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Store Name"
              name="store_name"
              fullWidth
              required
              value={form.store_name}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone"
              name="phone"
              fullWidth
              required
              value={form.phone}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          {/* Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Type"
              name="type"
              select
              fullWidth
              required
              value={form.type}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value="">
                <em>Select Type</em>
              </MenuItem>
              <MenuItem value="Retailer">Retailer</MenuItem>
              <MenuItem value="Store">Store</MenuItem>
              <MenuItem value="Wholesale">Wholesale</MenuItem>
            </TextField>
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              fullWidth
              required
              value={form.address}
              onChange={handleChange}
              multiline
              rows={2}
              size="small"
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <TextField
              label="Location (City/Region)"
              name="location"
              fullWidth
              value={form.location}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          {/* Logo */}
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Store Logo</Typography>
            <TextField
              label="Upload Logo"
              name="logo"
              type="file"
              fullWidth
              onChange={handleChange}
              inputProps={{ accept: "image/*" }}
              size="small"
            />
          </Grid>

          {/* Logo Preview */}
          {imagePreview && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Preview:</Typography>
              <Box sx={{ p: 1, border: "1px solid #ddd", borderRadius: 1, width: "fit-content" }}>
                <img 
                  src={imagePreview} 
                  alt="Store Logo"  
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              </Box>
            </Grid>
          )}

          <input type="hidden" name="id" value={form.id || ''} />

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button 
                variant="outlined" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={loading}
                sx={{ bgcolor: "#5A8DEE" }}
              >
                {loading ? "Saving..." : (form.id ? "Update" : "Add")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  </Modal>
);
};

export default ModalLayout;
