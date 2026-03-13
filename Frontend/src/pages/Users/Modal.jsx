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
  Alert,
} from "@mui/material";
import { roleList,addUser,updateUser } from "../../services/userService";

const ModalLayout = ({ open, onClose,onSaved,editData   }) => {
  const [tab, setTab] = useState(0);
const [role, setRole] = useState([]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    userId: "",
    store_name: "",
    phone: "",
    address: "",
    counter_limit: 5,
  });

   useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        email: editData.email || "",
        role: editData.role || "",
        userId: editData.userId || "",
        store_name: editData.store_name || "",
        phone: editData.phone || "",
        address: editData.address || "",
        counter_limit: editData.counter_limit || 5,
      });
    } else {
      setForm({
        name: "",
        email: "",
        role: "",
        userId: "",
        store_name: "",
        phone: "",
        address: "",
        counter_limit: 5,
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

    if (form.userId) {
      // UPDATE USER
      result = await updateUser(form);
    } else {
      // ADD USER
      result = await addUser(form);
    }
      if (result.status === true) {
        setSuccess(result.message);
        setForm({
          userId: "",
          name: "",
          email: "",
          role: "",
          store_name: "",
          phone: "",
          address: "",
          counter_limit: 5,
        });
        onClose();
        onSaved();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || err.message || "Failed to save user");
    }
  };

  useEffect(() => {
      getRole();
    }, []);
  
    const getRole = async () => {
      setSuccess("");
      setError("");
      try {
        const result = await roleList();
        if (result.status === true) {
          setRole(result.data);
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError(error.response?.data?.message || error.message);
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
        width: { xs: "90%", sm: "70%", md: "50%", lg: "35%" },
        maxWidth: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        p: 4,
        borderRadius: 3,
        outline: "none",
        boxShadow: "0 8px 32px rgba(90, 141, 238, 0.2)",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#5A8DEE",
          borderRadius: "10px",
          "&:hover": {
            background: "#4a7dd9",
          },
        },
      }}
    >
      <Box sx={{
        position: "sticky",
        top: 0,
        bgcolor: "background.paper",
        zIndex: 1,
        pb: 2,
        borderBottom: "2px solid #5A8DEE"
      }}>
        <Typography variant="h5" color="#5A8DEE" fontWeight="bold">
          {form.userId ? "Edit User" : "Add New User"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {form.role === 1 ? "Create a store administrator with counter user limits" : "Fill in the user details below"}
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {/* USER INFORMATION SECTION */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: "#5A8DEE",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <Box sx={{
              width: 6,
              height: 24,
              bgcolor: "#5A8DEE",
              borderRadius: 1
            }} />
            User Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={handleChange}
                placeholder="e.g., john@example.com"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="User Role"
                name="role"
                select
                fullWidth
                required
                value={form.role}
                onChange={handleChange}
                variant="outlined"
                helperText="Select the user's role in the system"
              >
                <MenuItem value="">Select Role</MenuItem>
                {role.map((item, i) => (
                  <MenuItem key={i} value={item.roleId}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* STORE ADMIN FIELDS - Show only when role is 1 (Store Admin) */}
        {form.role === 1 && (
          <>
            {/* STORE INFORMATION SECTION */}
            <Box sx={{ mb: 3, mt: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: "#5A8DEE",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box sx={{
                  width: 6,
                  height: 24,
                  bgcolor: "#5A8DEE",
                  borderRadius: 1
                }} />
                Store Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Store Name"
                    name="store_name"
                    fullWidth
                    required={form.role === 1}
                    value={form.store_name}
                    onChange={handleChange}
                    placeholder="e.g., Downtown Store"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Phone Number"
                    name="phone"
                    fullWidth
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g., +1 234 567 8900"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Store Address"
                    name="address"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter complete store address"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* COUNTER LIMIT SECTION */}
            <Box sx={{ mb: 3, mt: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: "#5A8DEE",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box sx={{
                  width: 6,
                  height: 24,
                  bgcolor: "#5A8DEE",
                  borderRadius: 1
                }} />
                Counter User Configuration
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Maximum Counter Users"
                    name="counter_limit"
                    type="number"
                    fullWidth
                    required={form.role === 1}
                    value={form.counter_limit}
                    onChange={handleChange}
                    inputProps={{ min: 1, max: 100 }}
                    helperText="Set the maximum number of cashier/counter users this store admin can create (Range: 1-100)"
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Box sx={{
                mt: 2,
                p: 2,
                bgcolor: "#E8F0FE",
                borderRadius: 2,
                border: "1px solid #5A8DEE20"
              }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Note:</strong> This limit determines how many cashier accounts the store admin can create for their store. You can update this limit later if needed.
                </Typography>
              </Box>
            </Box>
          </>
        )}

        <input type="hidden" name="userId" value={form.userId || ''} />
        <input type="hidden" name="userId" value={form.userId || ''} />

        {/* ACTION BUTTONS */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            position: "sticky",
            bottom: 0,
            bgcolor: "background.paper",
            zIndex: 1
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: "#5A8DEE",
              color: "#5A8DEE",
              "&:hover": {
                borderColor: "#4a7dd9",
                bgcolor: "#f0f4ff"
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: "#5A8DEE",
              "&:hover": {
                bgcolor: "#4a7dd9"
              }
            }}
          >
            {form.userId ? "Update User" : "Create User"}
          </Button>
        </Box>
      </Box>
    </Paper>
  </Modal>
);

};

export default ModalLayout;
