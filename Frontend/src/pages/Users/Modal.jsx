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
import { roleList,addUser,updateUser } from "../../services/userService";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";
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
  });

   useEffect(() => {
    if (editData) {
    
      setForm({
        name: editData.name || "",
        email: editData.email || "",
        role: editData.role || "",
        userId: editData.userId || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        role: "",
        userId:"",
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
          color: "#fff",
          backgroundColor: "#415a77",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      > 
        Add New user
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
            <TextField
              label="Email"
             name="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
            />
    
            <TextField
                                label="Role"
                                name="role"
                                select
                                fullWidth
                                required
                                value={form.role}
                               onChange={handleChange}
                              >
                                <MenuItem value="">Select</MenuItem>
                                {role.map((item, i) => (
                                  <MenuItem key={i} value={item.roleId}>{item.name}</MenuItem>
                                ))}
                              </TextField>

                              
                               
        </Grid>
        <input type="hidden" name="userId" value={form.userId || ''} />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="contained" sx={{backgroundColor:"#415A77"}} type="submit">Submit</Button>
        </Box>
      </DialogContent>
  </Dialog>
);

};

export default ModalLayout;
