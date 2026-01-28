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
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { categoryList,addCategory } from "../../services/categoryService";
import { addProduct,updateProduct,supplierList,addSupplier } from "../../services/productService";

const ModalLayout = ({ open, onClose,onSaved,editData  }) => {
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState("");
 const [openAddCategory, setOpenAddCategory] = useState(false);
 const [openAddSupplier, setOpenAddSupplier] = useState(false);
const [newCategory, setNewCategory] = useState("");
const [newSupplier, setNewSupplier] = useState("");

  const [form, setForm] = useState({
    product_name: "",
    sku: "",
    barcode: "",
    brand: "",
    description: "",
    category_id: "",
    favourite: "",
    cost_price: "",
    selling_price: "",
    tax_rate: "",
    initial_stock : "",
    supplier_id: "",
    image: "",
    id: "",
  });

   useEffect(() => {
        if (editData) {
        
          setForm({
            product_name: editData.product_name || "",
            sku: editData.sku || "",
            barcode: editData.barcode || "",
            brand: editData.brand || "",
            description: editData.description || "",
            category_id: editData.category_id || "",
            favourite: editData.favourite || "",
            cost_price: editData.cost_price || "",
            selling_price: editData.selling_price || "",
            tax_rate: editData.tax_rate || "",
            initial_stock : editData.initial_stock  || "",
            supplier_id: editData.supplier_id || "",
            image: editData.image || "",
            id: editData.id || "",
          });
        } else {
          setForm({
           product_name: "",
    sku: "",
    barcode: "",
    brand: "",
    description: "",
    category_id: "",
    favourite: "",
    cost_price: "",
    selling_price: "",
    tax_rate: "",
    initial_stock : "",
    supplier_id: "",
    image: "",
    id: "",
          });
        }
      }, [editData, open]);
  const handleTabChange = (_, newValue) => setTab(newValue);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
       let result;
                if (form.id) {
                 
                  result = await updateProduct(form);
                } else {
                
                  result = await addProduct(form);
                }
     
      if (result.status === true) {
        setSuccess(result.message);
        setForm({
          product_name: "",
          sku: "",
          barcode: "",
          brand: "",
          description: "",
          category_id: "",
          favourite: "",
          cost_price: "",
          selling_price: "",
          tax_rate: "",
          initial_stock : "",
          supplier_id: "",
          image: "",
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
    getCategories();
    getSupplier();
  }, []);

  const getCategories = async () => {
    try {
      const result = await categoryList();
      if (result.status === true) {
        setCategories(result.data);
      } 
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (categoryId) {
      setForm((prev) => ({ ...prev, category_id: categoryId, subcategory_id: "" }));  
    }
  }, [categoryId]);

 
  const getSupplier = async () => {
    try {
      const result = await supplierList();
      if (result.status === true) {
        setSupplier(result.data);
      } 
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const handleAddCategory = async () => {
  if (!newCategory.trim()) return;
 const data = { category_name: newCategory };
  const result = await addCategory(data);
  if (result.status ===true) {
      getCategories(); 
     setNewCategory(""); 
   setOpenAddCategory(false);
  }
};

const handleAddSupplier = async () => {
  if (!newSupplier.trim()) return;
 const data = { name: newSupplier };
  const result = await addSupplier(data);
  if (result.status ===true) {
      getSupplier(); 
     setNewSupplier(""); 
   setOpenAddSupplier(false);
  }
};
  const handleClose = () => {
  setOpenAddCategory(false);
   setOpenAddSupplier(false);
};
  return (
    <>
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

        <Tabs value={tab} onChange={handleTabChange} mb={2} variant="fullWidth">
          <Tab label="Basic Info" />
          <Tab label="Pricing" />
          {/* <Tab label="Inventory" /> */}
          <Tab label="Supplier" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
          {tab === 0 && (
            <>
              <Grid container spacing={4}>

                <Grid item xs={12}>
                  <TextField
                    label="Product Name"
                    name="product_name"
                    fullWidth
                    required
                    value={form.product_name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="SKU"
                    name="sku"
                    fullWidth
                    required
                    value={form.sku}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Barcode"
                    name="barcode"
                    fullWidth
                    value={form.barcode}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Brand"
                    name="brand"
                    fullWidth
                    value={form.brand}
                    onChange={handleChange}
                  />
                </Grid>

                 <Grid item xs={6}>
                   <TextField
      label="Favourite"
      name="favourite"
      select
      fullWidth
      required
      value={form.favourite}
       onChange={handleChange}
      sx={{ width: "230px" }}
    >
      <MenuItem value="no">No</MenuItem>
      <MenuItem value="yes">Yes</MenuItem>
      <MenuItem value="loose">Loose Item</MenuItem>
    </TextField>
                </Grid>

                <Grid item xs={10}>
    <TextField
      label="Category"
      name="category_id"
      select
      fullWidth
      required
      value={categoryId}
      onChange={(e) => setCategoryId(e.target.value)}
      sx={{ width: "230px" }}
    >
      <MenuItem value="">Select</MenuItem>
      {categories.map((cat, i) => (
        <MenuItem key={i} value={cat.id}>
          {cat.category_name}
        </MenuItem>
      ))}
    </TextField>
  </Grid>

  {/* Plus Button */}
  <Grid item xs={2}>
    <Button
      variant="contained"
      color="primary"
      fullWidth
      sx={{ height: "46px" }} // match TextField height
      onClick={() => setOpenAddCategory(true)}
    >
      +
    </Button>
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
              />
            </>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Cost Price"
                  name="cost_price"
                  type="number"
                  fullWidth
                  required
                  value={form.cost_price}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  label="Selling Price"
                  name="selling_price"
                  type="number"
                  fullWidth
                  required
                  value={form.selling_price}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Tax Rate"
                  name="tax_rate"
                  type="number"
                  fullWidth
                  required
                  value={form.tax_rate}
                  onChange={handleChange}
                />
              </Grid>
               <Grid item xs={6}>
                <TextField
                  label="Stocks"
                  name="initial_stock"
                  type="text"
                  fullWidth
                  required
                  value={form.initial_stock }
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}

          {tab === 2 && (
            <Grid container spacing={2} alignItems="center">
  {/* Dropdown */}
  <Grid>
    <TextField  sx={{ width: "95%" }}
      label="Supplier"
      name="supplier_id"
      select
      fullWidth
      value={form.supplier_id}
      onChange={handleChange}
    >
      <MenuItem value="">Select</MenuItem>
      {supplier.map((item) => (
        <MenuItem key={item.id} value={item.id}>
          {item.name}
        </MenuItem>
      ))}
    </TextField>
   
  </Grid>

  {/* Add Button */}
  <Grid item xs={2}>
    <Button
      variant="contained"
      color="primary"
      fullWidth
      sx={{ height: "56px" }} // TextField default height
      onClick={() => setOpenAddSupplier(true)}
    >
      +
    </Button>
  </Grid>
    <TextField
                  label="Image"
                  name="image"
                  type="file"
                  fullWidth
                  onChange={handleChange}
                />
          <br/>
        <img src={form.image} alt="IMG"  width={45} height={45}
        style={{
          objectFit: "cover",
          borderRadius: 6,
        }}/>
</Grid>
      
          )}
          <input type="hidden" name="id" value={form.id || ''}/>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            {tab > 0 && (
              <Button variant="outlined" onClick={() => setTab(tab - 1)}>Previous</Button>
            )}

            {tab < 2 && (
              <Button variant="contained" onClick={() => setTab(tab + 1)}>Next</Button>
            )}

            {tab === 2 && (
              <Button variant="contained" type="submit">Save Product</Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Modal>
      
      <Dialog open={openAddCategory}>
  <DialogTitle  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>Add Category
       <IconButton onClick={handleClose}>
    <CloseIcon />
  </IconButton>
  </DialogTitle>
  <DialogContent>
    <TextField
      label="Category Name"
      fullWidth
      value={newCategory}
      onChange={(e) => setNewCategory(e.target.value)}
      margin="normal"
    />

    <Button
      variant="contained"
      fullWidth
      onClick={handleAddCategory}
    >
      Save
    </Button>
  </DialogContent>
</Dialog>

<Dialog open={openAddSupplier}>
  <DialogTitle  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>Add Supplier
       <IconButton onClick={handleClose}>
    <CloseIcon />
  </IconButton>
  </DialogTitle>
  <DialogContent>
    <TextField
      label="Supplier Name"
      fullWidth
      value={newSupplier}
      onChange={(e) => setNewSupplier(e.target.value)}
      margin="normal"
    />

    <Button
      variant="contained"
      fullWidth
      onClick={handleAddSupplier}
    >
      Save
    </Button>
  </DialogContent>
</Dialog>
    </>
  );
};

export default ModalLayout;
