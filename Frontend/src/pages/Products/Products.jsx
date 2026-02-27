import React, { useState,useEffect } from "react";
import { Box,Typography,Button,TextField,DialogContent,Dialog,DialogTitle} from "@mui/material";
import { FaRegSquarePlus } from "react-icons/fa6";
import { AiOutlineCloudDownload, AiOutlineCloudUpload } from "react-icons/ai";
import { CiFilter } from "react-icons/ci";

/*linked components*/
import Title from "../../components/MainContentComponents/Title";
import ModalLayout from "./Modal";
import TableLayout from "../../components/MainContentComponents/Table";
import Stats from "../../components/MainContentComponents/Stats";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { statsData } from "./StatsData";
import { columns } from "./columns";
import {productList,inventoryList,getById,deleteProduct,addStock} from "../../services/productService"
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/Toast/Toast";
import { getUser } from "../../utils/Auth.js";

const Products = () => {
  const [open, setOpen] = useState(false);
  const[data,setData]=useState([])
  const[success,setSuccess]=useState('')
  const[error,setError]=useState('')
  const { showToast, toastMessage, toastType, showToastNotification } = useToast();
  const[loading,setLoading]=useState(false)
  const [editData, setEditData] = useState(null);
  const [openStock, setOpenStock] = useState(false);
  const [stock, setStock] = useState('');
  const [productId, setProductId] = useState('');
    const user = getUser();

   useEffect(()=>{
fetchProductList()
},[])

  const fetchProductList =async()=>{
    setSuccess(null)
    setError(null)
    try{
      const result=await inventoryList()
      if(result.status===true)
      {
        setData(result.data)
      }else{
        showToastNotification(result.message, "error")
      }
    }catch(error)
    {
        showToastNotification(error.response?.data?.message || error.message, "error");
    }
  }
  const rows = data

    const handleDelete = async(id) => {
      
      setSuccess('')
      setError('')
    try{
       const deleteData=window.confirm('Are you sure you want to delete this item?')
          if(deleteData)
          {
      const result=await deleteProduct(id)
      if(result.status===true)
      {
        showToastNotification(result.message, "success")
        fetchProductList()
      }else{
        showToastNotification(result.message, "error")
      }
    }
    }catch(error)
    {
      showToastNotification(error.response?.data?.message || error.message, "error")
    }
  };

  const handleEdit =async(id) => {
                     setSuccess('')
                      setError('')
                    try{
                      
                      const result=await getById(id)
                      
                      if(result.status===true)
                      {
                        showToastNotification(result.message, "info")
                      setEditData(result.data);
                       setOpen(true);
                      }else{
                        showToastNotification(result.message, "error")
                      }
                    }
                  catch(error)
                    {
                      showToastNotification(error.response?.data?.message || error.message, "error")
                    }
              };
      const handleStock =async(id) => {
              setOpenStock(true);
               setProductId(id);
           };
const handleClose = () => {
   setOpenStock(false);
   setProductId("")
   setStock("")
};
const SaveStock=async()=>{
                setSuccess('')
                 setError('')
              try{ 
                       const data={
                  product_id:productId,
                       stock
                     }
                      const result=await addStock(data) 
                      if(result.status===true)
                      {
                        showToastNotification(result.message, "success")
                         setOpenStock(false);
                         setProductId("")
                          setStock("")
                      }else{
                        showToastNotification(result.message, "error")
                      }
                    }
                  catch(error)
                    {
                      showToastNotification(error.response?.data?.message || error.message, "error")
                    }
}
  return (
    <>
    <Box sx={{ minHeight: "100vh" }}>
     {(user.role === "admin" ||
  user.permissions.includes("add-product")) && (
   <Title
        title="Products"
        subtitle="Manage your product inventory"
        actions={[
          {
            label: "Add Product",
            icon: <FaRegSquarePlus />,
            variant: "contained",
            bgcolor: "#5A8DEE",
             onClick: () => {
      setEditData(null);   // ← RESET edit data
      setOpen(true);       // ← OPEN modal
    },
          },
        ]}
      />
)}
     
   <ModalLayout open={open} onClose={() => setOpen(false)} onSaved={fetchProductList}  editData={editData}/>
      <Box sx={{ width: "100%", px: 3, py: 2 }}>
        <Stats stats={statsData} />
      </Box>
        
      <TableLayout columns={columns} rows={rows}  extra={{ stock:handleStock,deleteItem: handleDelete, edit: handleEdit }} actionButtons={
      [
        {
          label: "Filter",
          icon: <CiFilter />,
          variant: "outlined",
        },
        {
          label: "Export",
          icon: <AiOutlineCloudDownload />,
          variant: "outlined",

        },
        {
          label: "Import",
          icon: <AiOutlineCloudUpload />,
          variant: "outlined",

        },
      ]
      }/>
    </Box>

    <Dialog open={openStock}>
      <DialogTitle  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",color:"#415A77", fontWeight:"600" }}>Add Stock
           <IconButton onClick={handleClose}>
        <CloseIcon />
      </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Stock"
          fullWidth
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          margin="normal"
         
        />
    
        <Button
          variant="contained"
          fullWidth
          onClick={SaveStock}
          sx={{
            backgroundColor: "#415A77",
            "&:hover": {
              backgroundColor: "#344E64"   // slightly darker for hover
            }
          }}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
    <Toast show={showToast} message={toastMessage} type={toastType} />
    </>
  );
};


export default Products;
