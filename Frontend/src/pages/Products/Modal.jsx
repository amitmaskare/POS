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
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";

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
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files && files.length ? files[0] : value,
    }));
  };

  const { showToast, toastMessage, toastType, showToastNotification } = useToast();
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (form.image instanceof File) {
      const url = URL.createObjectURL(form.image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagePreview(form.image || "");
  }, [form.image]);

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
        showToastNotification(result.message, "success");
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
        showToastNotification(result.message, "error");
      }
    } catch (err) {
      showToastNotification("Failed to save product", "error");
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
    <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
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
    color:"#fff",
    backgroundColor:"#415a77",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
          Add New Product
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
        <DialogContent sx={{ p: 3, mt:3 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth"
  sx={{
    mb: 2,
    "& .MuiTabs-indicator": {
      backgroundColor: "#415A77", // indicator color
      height: 3,
      borderRadius: 2,
    },
  }}
>
        <Tab
  label="Basic Info"
  sx={{
    textTransform: "none",
    fontWeight: 500,
    color: "#6c757d",
    "&.Mui-selected": {
      color: "#415A77",
      fontWeight: 600,
    },
  }}
/>

<Tab
  label="Pricing"
  sx={{
    textTransform: "none",
    fontWeight: 500,
    color: "#6c757d",
    "&.Mui-selected": {
      color: "#415A77",
      fontWeight: 600,
    },
  }}
/>

<Tab
  label="Supplier"
  sx={{
    textTransform: "none",
    fontWeight: 500,
    color: "#6c757d",
    "&.Mui-selected": {
      color: "#415A77",
      fontWeight: 600,
    },
  }}
/>
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} display="grid" gap={2} mt={3}>
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
      fullWidth
      sx={{ height: "46px",backgroundColor:"#415A77"}} // match TextField height
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
    <TextField 
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
      sx={{ height: "56px",backgroundColor:"#415A77"}} // TextField default height
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
        <img src={imagePreview} alt="IMG"  width={45} height={45}
        style={{
          objectFit: "cover",
          borderRadius: 6,
        }}/>
</Grid>
      
          )}
          <input type="hidden" name="id" value={form.id || ''}/>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            {tab > 0 && (
              <Button variant="contained" sx={{backgroundColor:"#415A77",color:"#fff"}} onClick={() => setTab(tab - 1)}>Previous</Button>
            )}

            {tab < 2 && (
              <Button variant="contained" sx={{backgroundColor:"#415A77"}} onClick={() => setTab(tab + 1)}>Next</Button>
            )}

            {tab === 2 && (
              <Button variant="contained" sx={{backgroundColor:"#415A77"}} type="submit">Save Product</Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
    <Toast show={showToast} message={toastMessage} type={toastType} />
      
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
