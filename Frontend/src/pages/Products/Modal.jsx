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
import { categoryList,addCategory,addSubcategory } from "../../services/categoryService";
import { categoryWiseSubcategoryData, addProduct,updateProduct,supplierList } from "../../services/productService";

const ModalLayout = ({ open, onClose,onSaved,editData  }) => {
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState("");
 const [openAddCategory, setOpenAddCategory] = useState(false);
const [newCategory, setNewCategory] = useState("");
const [openAddSubcategory, setOpenAddSubcategory] = useState(false);
const [newSubcategory, setNewSubcategory] = useState("");
  const [form, setForm] = useState({
    product_name: "",
    sku: "",
    barcode: "",
    brand: "",
    description: "",
    category_id: "",
    subcategory_id: "",
    cost_price: "",
    unit_price: "",
    selling_price: "",
    tax_rate: "",
    initial_stock: "",
    reorder_level: "",
    min_stock: "",
    max_stock: "",
    unit: "",
    unit_per_package: "",
    supplier_id: "",
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
            subcategory_id: editData.subcategory_id || "",
            cost_price: editData.cost_price || "",
            unit_price: editData.unit_price || "",
            selling_price: editData.selling_price || "",
            tax_rate: editData.tax_rate || "",
            initial_stock: editData.initial_stock || "",
            reorder_level: editData.reorder_level || "",
            min_stock: editData.min_stock || "",
            max_stock: editData.max_stock || "",
            unit: editData.unit || "",
            unit_per_package: editData.unit_per_package || "",
            supplier_id: editData.supplier_id || "",
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
    subcategory_id: "",
    cost_price: "",
    unit_price: "",
    selling_price: "",
    tax_rate: "",
    initial_stock: "",
    reorder_level: "",
    min_stock: "",
    max_stock: "",
    unit: "",
    unit_per_package: "",
    supplier_id: "",
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
          subcategory_id: "",
          cost_price: "",
          unit_price: "",
          selling_price: "",
          tax_rate: "",
          initial_stock: "",
          reorder_level: "",
          min_stock: "",
          max_stock: "",
          unit: "",
          unit_per_package: "",
          supplier_id: "",
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
  }, []);

  const getCategories = async () => {
    setSuccess("");
    setError("");
    try {
      const result = await categoryList();
      if (result.status === true) {
        setCategories(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const getSubcategory = async (categoryId) => {
    setSuccess("");
    setError("");
    try {
      const result = await categoryWiseSubcategoryData(categoryId);
      if (result.status === true) {
        setSubcategories(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (categoryId) {
      setForm((prev) => ({ ...prev, category_id: categoryId, subcategory_id: "" }));
      getSubcategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    getSupplier();
  }, []);

  const getSupplier = async () => {
    setSuccess("");
    setError("");
    try {
      const result = await supplierList();
      if (result.status === true) {
        setSupplier(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
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

const handleAddSubcategory = async () => {
  if (!newSubcategory.trim()) return;

  const data = { 
    categoryId: categoryId,
    subcategory_name: newSubcategory 
  };

  const result = await addSubcategory(data);

  if (result.status === true) {
   // await getSubcategory(categoryId); 
    setNewSubcategory("");
    setOpenAddSubcategory(false);
  }
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

        {success && <Typography color="green">{success}</Typography>}
        {error && <Typography color="red">{error}</Typography>}

        <Tabs value={tab} onChange={handleTabChange} mb={2} variant="fullWidth">
          <Tab label="Basic Info" />
          <Tab label="Pricing" />
          <Tab label="Inventory" />
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

                <Grid item xs={12}>
                  <TextField
                    label="Subcategory"
                    name="subcategory_id"
                    select
                    fullWidth
                    value={form.subcategory_id}
                    onChange={handleChange}
                    sx={{ width: "200px" }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {subcategories.map((item, i) => (
                      <MenuItem key={i} value={item.id}>{item.subcategory_name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                 <Grid item xs={2}>
    <Button
      variant="contained"
      color="primary"
      fullWidth
      sx={{ height: "46px" }} // match TextField height
      onClick={() => setOpenAddSubcategory(true)}
      
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
                  label="Unit Price"
                  name="unit_price"
                  type="number"
                  fullWidth
                  required
                  value={form.unit_price}
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
            </Grid>
          )}

          {tab === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Initial Stock"
                  name="initial_stock"
                  type="number"
                  fullWidth
                  required
                  value={form.initial_stock}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Reorder Level"
                  name="reorder_level"
                  type="number"
                  fullWidth
                  required
                  value={form.reorder_level}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Minimum Stock"
                  name="min_stock"
                  type="number"
                  fullWidth
                  required
                  value={form.min_stock}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Maximum Stock"
                  name="max_stock"
                  type="number"
                  fullWidth
                  required
                  value={form.max_stock}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Unit"
                  name="unit"
                  fullWidth
                  required
                  value={form.unit}
                  onChange={handleChange}
                >
                  <MenuItem value="kg">KG</MenuItem>
                  <MenuItem value="pcs">PCS</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Unit per Package"
                  name="unit_per_package"
                  fullWidth
                  required
                  value={form.unit_per_package}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}

          {tab === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                    label="Supplier ID"
                    name="supplier_id"
                    select
                    fullWidth
                    value={form.supplier_id}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {supplier.map((item, i) => (
                      <MenuItem key={i} value={item.id}>{item.name}</MenuItem>
                    ))}
                  </TextField>
                
              </Grid>
            </Grid>
          )}
          <input type="hidden" name="id" value={form.id || ''}/>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            {tab > 0 && (
              <Button variant="outlined" onClick={() => setTab(tab - 1)}>Previous</Button>
            )}

            {tab < 3 && (
              <Button variant="contained" onClick={() => setTab(tab + 1)}>Next</Button>
            )}

            {tab === 3 && (
              
              <Button variant="contained" type="submit">Save Product</Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Modal>
      
      <Dialog open={openAddCategory}>
  <DialogTitle>Add Category</DialogTitle>

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

{/* Subcategory dailog */}
 <Dialog open={openAddSubcategory} onClose={() => setOpenAddSubcategory(false)}>
  <DialogTitle>Add Subcategory</DialogTitle>

  <DialogContent>
    {/* Show parent category */}
     <TextField
      select
      label="Category"
      fullWidth
      margin="normal"
      value={categoryId}
      onChange={(e) => setCategoryId(e.target.value)}
    >
      <MenuItem value="">Select Category</MenuItem>
      {categories.map((cat) => (
        <MenuItem key={cat.id} value={cat.id}>
          {cat.category_name}
        </MenuItem>
      ))}
    </TextField>

    {/* Subcategory field */}
    <TextField
      label="Subcategory Name"
      fullWidth
      value={newSubcategory}
      onChange={(e) => setNewSubcategory(e.target.value)}
      margin="normal"
    />

    <Button variant="contained" fullWidth onClick={handleAddSubcategory}>
      Save
    </Button>
  </DialogContent>
</Dialog>


    </>
  );
};

export default ModalLayout;
