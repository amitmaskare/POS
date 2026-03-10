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
import { cardTypeList,addRationCard,updateRationCard } from "../../services/rationcardService";

const ModalLayout = ({ open, onClose,onSaved,editData  }) => {
  const [tab, setTab] = useState(0);
const [cardType, setCardType] = useState([]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    card_type_id: "",
    card_number: "",
    card_holder_name: "",
    mobile: "",
    address: "",
    family_member: "",
     id:"",
  });

  useEffect(() => {
        if (editData) {
        
          setForm({
            card_type_id: editData.card_type_id || "",
            card_number: editData.card_number || "",
            mobile: editData.mobile || "",
            address: editData.address || "",
            family_member: editData.family_member || "",
            id: editData.id || "",
          });
        } else {
          setForm({
            card_type_id: "",
    card_number: "",
    card_holder_name: "",
    mobile: "",
    address: "",
    family_member: "",
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
                 
                  result = await updateRationCard(form);
                } else {
                
                  result = await addRationCard(form);
                }
     
      if (result.status === true) {
        setSuccess(result.message);
        setForm({
          card_type_id: "",
    card_number: "",
    card_holder_name: "",
    mobile: "",
    address: "",
    family_member: "",
    id: "",
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
      getCardType();
    }, []);
  
    const getCardType = async () => {
      setSuccess("");
      setError("");
      try {
        const result = await cardTypeList();
        if (result.status === true) {
          setCardType(result.data);
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
        Add New Ration Card
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

      {success && (
  <Typography color="green" sx={{ mt: 2, ml: 3 }}>
    {success}
  </Typography>
)}

{error && (
  <Typography color="red" sx={{ mt: 2, ml: 3 }}>
    {error}
  </Typography>
)}

      <DialogContent component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          {/* CUSTOMER NAME col-12 full width */}
            <TextField
                                label="Card Type"
                                name="card_type_id"
                                select
                                fullWidth
                                required
                                value={form.card_type_id}
                               onChange={handleChange}
                              >
                                <MenuItem value="">Select</MenuItem>
                                {cardType.map((item, i) => (
                                  <MenuItem key={i} value={item.id}>{item.type}</MenuItem>
                                ))}
                              </TextField>
            <TextField
              label="Card Number"
             name="card_number"
              fullWidth
              required
              value={form.card_number}
              onChange={handleChange}
            />
            <TextField
              label="Card Holder Name"
             name="card_holder_name"
              fullWidth
              required
              value={form.card_holder_name}
              onChange={handleChange}
            />
    
            <TextField
              label="Mobile"
             name="mobile"
              fullWidth
              value={form.mobile}
              onChange={handleChange}
            />
         
            <TextField
              label="Address"
             name="address"
              fullWidth
              value={form.address}
              onChange={handleChange}
            />
             <TextField
              label="Family Member"
            name="family_member"
              fullWidth
              value={form.family_member}
              onChange={handleChange}
            />
          
        </Grid>
        <input type="hidden" name="id" value={form.id || ''} />
        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="contained" sx={{backgroundColor:"#415A77"}} type="submit">Submit</Button>
        </Box>
      </DialogContent>
   
  </Dialog>
);

};

export default ModalLayout;
