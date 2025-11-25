import React, { useState } from "react";
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

const ModalLayout = ({ open, onClose }) => {
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState({
    productName: "",
    sku: "",
    barcode: "",
    brand: "",
    description: "",
    category: "",
    subcategory: "",
    costprice: "",
    unitprice: "",
    sellingprice: "",
    price: "",
    status: "",
    initialStock: "",
    reorderLevel: "",
    minStock: "",
    maxStock: "",
    units1: "",
    units2: "",
    extraStock: "",
    supplier: "",
  });

  const handleTabChange = (_, newValue) => setTab(newValue);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add submit logic here
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "45%",
          p: 4,
          borderRadius: 3,
          outline: "none",
        }}
      >
        <Typography variant="h6" mb={2} color="#5A8DEE" fontWeight="bold">
          Add New Product
        </Typography>

        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }} variant="fullWidth">
          <Tab label="Basic Info" />
          <Tab label="Pricing" />
          <Tab label="Inventory" />
          <Tab label="Supplier" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
          {tab === 0 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Product Name"
                    name="productName"
                    fullWidth
                    rows={1}
                    required
                    value={form.productName}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="SKU"
                    name="sku"
                    fullWidth
                    required
                    value={form.sku}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Barcode"
                    name="barcode"
                    fullWidth
                    value={form.barcode}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Brand"
                    name="brand"
                    fullWidth
                    value={form.brand}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                rows={2}
                value={form.description}
                onChange={handleChange}
                sx={{ width: { xs: "100%", sm: 230, md: 571 } }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Category"
                    name="category"
                    select
                    required
                    value={form.category}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  >
                    <MenuItem value="Fruits">Fruits</MenuItem>
                    <MenuItem value="Dairy">Dairy</MenuItem>
                    <MenuItem value="Beverages">Beverages</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Subcategory"
                    name="subcategory"
                    select
                    value={form.subcategory}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  >
                    <MenuItem value="Organic">Organic</MenuItem>
                    <MenuItem value="Local">Local</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </>
          )}

          {tab === 1 && (
            <>
              <Grid container spacing={2} >
                <Grid item xs={12} sm={4} md={4} >
                  <TextField
                    fullWidth
                    label="Cost Price"
                    name="costprice"
                    required
                    type="number"
                    value={form.costprice}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 180 } }}
                    
                  />
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    name="unitprice"
                    required
                    type="number"
                    value={form.unitprice}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 180 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                  <TextField
                    fullWidth
                    label="Selling Price"
                    name="sellingprice"
                    required
                    type="number"
                    value={form.sellingprice}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 180 } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax Rate"
                    name="price"
                    required
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    required
                    value={form.status}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </>
          )}

          {tab === 2 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Initial Stock"
                    name="initialStock"
                    required
                    type="number"
                    value={form.initialStock}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Reorder Level"
                    name="reorderLevel"
                    required
                    type="number"
                    value={form.reorderLevel}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Minimum Stock"
                    name="minStock"
                    required
                    type="number"
                    value={form.minStock}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Stock"
                    name="maxStock"
                    required
                    type="number"
                    value={form.maxStock}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 278 } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Units"
                    name="units1"
                    required
                    value={form.units1}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 180 } }}
                  >
                    <MenuItem value="kg">Kg</MenuItem>
                    <MenuItem value="pcs">Pcs</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Units"
                    name="units2"
                    required
                    value={form.units2}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 180 } }}
                  >
                    <MenuItem value="kg">Kg</MenuItem>
                    <MenuItem value="pcs">Pcs</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Extra Stock"
                    name="extraStock"
                    required
                    type="number"
                    value={form.extraStock}
                    onChange={handleChange}
                    sx={{ width: { xs: "100%", sm: 230, md: 180 } }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {tab === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Units"
                  name="units2"
                  required
                  value={form.units2}
                  onChange={handleChange}
                  sx={{ width: { xs: "100%", sm: 230, md: 280 } }}
                >
                  <MenuItem value="kg">Kg</MenuItem>
                  <MenuItem value="pcs">Pcs</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Supplier"
                  name="supplier"
                  required
                  value={form.supplier}
                  onChange={handleChange}
                  sx={{ width: { xs: "100%", sm: 230, md: 280 } }}
                />
              </Grid>
            </Grid>
          )}

          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            {tab > 0 && (
              <Button
                variant="outlined"
                onClick={() => setTab((prev) => prev - 1)}
                color="primary"
              >
                Previous
              </Button>
            )}

            {tab < 3 && (
              <Button
                variant="contained"
                onClick={() => setTab((prev) => prev + 1)}
                color="primary"
              >
                Next
              </Button>
            )}

            {tab === 3 && (
              <>
                <Button variant="contained" color="primary" type="submit">
                  Add Product
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default ModalLayout;
