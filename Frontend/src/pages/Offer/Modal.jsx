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
import { productList} from "../../services/productService";
import { add,update} from "../../services/offerService";

const ModalLayout = ({ open, onClose, onSaved, editData }) => {
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
    id: "",
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
        id: "",
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
      >  Add New offer
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

      <DialogContent component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} mt={3}>

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
          <Button variant="contained" sx={{ backgroundColor: "#f44336" }} type="button" onClick={onClose}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: "#415A77" }} type="submit">Submit</Button>
        </Box>
      </DialogContent>

    </Dialog>
  );

};

export default ModalLayout;
