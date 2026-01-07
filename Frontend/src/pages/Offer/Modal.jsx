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
import { productList} from "../../services/productService";
import { add,update} from "../../services/offerService";

const ModalLayout = ({ open, onClose,onSaved,editData   }) => {
  const [tab, setTab] = useState(0);
const [product, setProduct] = useState([]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    offer_name: "",
    product_id: "",
    min_qty: "",
    offer_price: "",
    offer_qty_price: "",
    start_date: "",
    end_date: "",
    status: "",
    id:"",
  });

   useEffect(() => {
    if (editData) {
    
      setForm({
        offer_name: editData.offer_name || "",
        product_id: editData.product_id || "",
        min_qty: editData.min_qty || "",
        offer_price: editData.offer_price || "",
        offer_qty_price: editData.offer_qty_price || "",
        start_date: editData.start_date || "",
        end_date: editData.end_date || "",
        status: editData.status || "",
        id: editData.id || "",
      });
    } else {
      setForm({
         offer_name: "",
    product_id: "",
    min_qty: "",
    offer_price: "",
    offer_qty_price: "",
    start_date: "",
    end_date: "",
    status: "",
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
      // UPDATE USER
      result = await update(form);
    } else {
      // ADD USER
      result = await add(form);
    }
      if (result.status === true) {
        setSuccess(result.message);
        setForm({
           id: "",
           offer_name: "",
    product_id: "",
    min_qty: "",
    offer_price: "",
    offer_qty_price: "",
    start_date: "",
    end_date: "",
    status: "",
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
      getProduct();
    }, []);
  
    const getProduct = async () => {
      setSuccess("");
      setError("");
      try {
        const result = await productList();
        if (result.status === true) {
          setProduct(result.data);
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
        width: "25%",
        p: 4,
        borderRadius: 3,
        outline: "none",
      }}
    >
      <Typography variant="h6" mb={2} color="#5A8DEE" fontWeight="bold">
        Add New offer
      </Typography>

      {success && <Typography color="green">{success}</Typography>}
      {error && <Typography color="red">{error}</Typography>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          {/* CUSTOMER NAME col-12 full width */}
           
            <TextField
              label="Offer Name"
             name="offer_name"
              fullWidth
              required
              value={form.offer_name}
              onChange={handleChange}
            />
             <TextField
                                label="Product"
                                name="product_id"
                                select
                                fullWidth
                                required
                                value={form.product_id}
                               onChange={handleChange}
                              >
                                <MenuItem value="">Select</MenuItem>
                                {product.map((item, i) => (
                                  <MenuItem key={i} value={item.id}>{item.product_name}</MenuItem>
                                ))}
                              </TextField>
            <TextField
              label="Min Qty"
             name="min_qty"
              fullWidth
              required
              value={form.min_qty}
              onChange={handleChange}
            />
             <TextField
              label="Offer Price"
             name="offer_price"
              fullWidth
              required
              value={form.offer_price}
              onChange={handleChange}
            />
             <TextField
             label="Offer Qty Price"
                                name="offer_qty_price"
                                select
                                fullWidth
                                required
                                value={form.offer_qty_price}
                               onChange={handleChange}
                              >
                                <MenuItem value="">Select</MenuItem>
                                <MenuItem value="regular">Regular</MenuItem>
                                <MenuItem value="offer_price">Offer Price</MenuItem>
                              </TextField>
             <TextField
             name="start_date"
              type="date"
              fullWidth
              required
               value={form.start_date}
              onChange={handleChange}
            />
             <TextField
             name="end_date"
             type="date"
              fullWidth
              required
               value={form.end_date}
              onChange={handleChange}
            />
              <TextField
                                label="Status"
                                name="status"
                                select
                                fullWidth
                                required
                                value={form.status}
                               onChange={handleChange}
                              >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                              </TextField>
                       
        </Grid>
        <input type="hidden" name="id" value={form.id || ''} />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="contained" type="submit">Submit</Button>
        </Box>
      </Box>
    </Paper>
  </Modal>
);

};

export default ModalLayout;
