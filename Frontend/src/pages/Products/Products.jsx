import React, { useState,useEffect } from "react";
import { Box } from "@mui/material";
import { FaRegSquarePlus } from "react-icons/fa6";
import { AiOutlineCloudDownload, AiOutlineCloudUpload } from "react-icons/ai";
import { CiFilter } from "react-icons/ci";

/*linked components*/
import Title from "../../components/MainContentComponents/Title";
import ModalLayout from "./Modal";
import TableLayout from "../../components/MainContentComponents/Table";
import Stats from "../../components/MainContentComponents/Stats";
import { statsData } from "./StatsData";
import { columns } from "./columns";
//import { rows } from "./rows";
import {productList,getById,deleteProduct} from "../../services/productService"



const Products = () => {
  const [open, setOpen] = useState(false);
  const[data,setData]=useState([])
  const[success,setSuccess]=useState('')
  const[error,setError]=useState('')
  const[loading,setLoading]=useState(false)
  const [editData, setEditData] = useState(null);

   useEffect(()=>{
fetchProductList()
},[])

  const fetchProductList =async()=>{
    setSuccess(null)
    setError(null)
    try{
      const result=await productList()
      if(result.status===true)
      {
        setSuccess(result.message)
        setData(result.data)
      }else{
        setError(result.message)
      }
    }catch(error)
    {
        setError(error.response?.data?.message || error.message);
    }
  }
  const rows = data

    const handleDelete = async(id) => {
      
      setSuccess('')
      setError('')
    try{
      const result=await deleteProduct(id)
      if(result.status===true)
      {
        setSuccess(result.message)
        fetchProductList()
      }else{
        setError(result.message)
      }
    }catch(error)
    {
      setError(error.response?.data?.message || error.message)
    }
  };

  const handleEdit =async(id) => {
                     setSuccess('')
                      setError('')
                    try{
                      
                      const result=await getById(id)
                      
                      if(result.status===true)
                      {
                        setSuccess(result.message)
                      setEditData(result.data);
                       setOpen(true);
                      }else{
                        setError(result.message)
                      }
                    }
                  catch(error)
                    {
                      setError(error.response?.data?.message || error.message)
                    }
              };
  return (
    <Box sx={{ minHeight: "100vh" }}>
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

      <ModalLayout open={open} onClose={() => setOpen(false)} onSaved={fetchProductList}  editData={editData}/>
      <Box sx={{ width: "100%", px: 3, py: 2 }}>
        <Stats stats={statsData} />
      </Box>
     
      <TableLayout columns={columns} rows={rows}  extra={{ deleteItem: handleDelete, edit: handleEdit }} actionButtons={
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
  );
};


export default Products;
