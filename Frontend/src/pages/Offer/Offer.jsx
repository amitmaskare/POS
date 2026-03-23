import React, { useState,useEffect } from "react";
import {
  Box,
  Typography,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import { FaRegSquarePlus } from "react-icons/fa6";
import Title from "../../components/MainContentComponents/Title";
import Stats from "../../components/MainContentComponents/Stats";
import TableLayout from "../../components/MainContentComponents/Table";
import { stats } from "./StatsData";
import { columns } from "./columns";
import {offerList,getById,deleteItem} from "../../services/offerService"
import ModalLayout from "./Modal";
import { useTheme } from "@mui/material/styles";

export default function Users() {
    const [open, setOpen] = useState(false);
    const[data,setData]=useState([])
    const[success,setSuccess]=useState('')
    const[error,setError]=useState('')
    const[loading,setLoading]=useState(false)
  const [editData, setEditData] = useState(null);
     useEffect(()=>{
    fetchOfferList()
    },[])
    
      const fetchOfferList =async()=>{
        setSuccess(null)
        setError(null)
        try{
          const result=await offerList()
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
      const theme = useTheme();
      const isDark = theme.palette.mode === "dark";
    
      const handleDelete = async(id) => {
                setSuccess('')
                setError('')
              try{
                 const deleteData=window.confirm('Are you sure you want to delete this item?')
          if(deleteData)
          {
                const result=await deleteItem(id)
                
                if(result.status===true)
                {
                  setSuccess(result.message)
                  fetchOfferList()
                }else{
                  setError(result.message)
                }
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
        title="Offers"
        subtitle="Manage Offer"
        actions={[
          {
            label: "Add Offer",
            icon: <FaRegSquarePlus />,
            variant: "contained",
            bgcolor: "#415A77",
             onClick: () => {
      setEditData(null);   // ← RESET edit data
      setOpen(true);       // ← OPEN modal
    },
          },
        ]}
      />

      {/* TOP STATS + ADD USER */}
     <ModalLayout open={open} onClose={() => setOpen(false)} onSaved={fetchOfferList} editData={editData}/>

      <Box mt={2}>
        <Stats stats={stats} />
      </Box>
    
      
      {/* USERS TABLE */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} mt={3}>
        <Typography variant="h6" sx={{color: isDark ? "#fff" : "#415a77"}} fontWeight={700}>
          System Offer
        </Typography>
      </Box>
      {success && <Typography color="green" className="text-center">{success}</Typography>}
      {error && <Typography color="red" className="text-center">{error}</Typography>}
      <TableLayout columns={columns} rows={data}  extra={{ deleteItem: handleDelete, edit: handleEdit }}  actionButtons={[
            {
              label: "Filter",
              icon: <FilterListIcon />,
              variant: "outlined",
              sx: { borderColor: "#5A8DEE", px: 2 },
              onClick: () => console.log("Filter clicked"),
            },
            {
              label: "Export",
              icon: <DownloadIcon />,
              variant: "outlined",
              sx: { borderColor: "#5A8DEE", px: 2 },
              onClick: () => console.log("Export clicked"),
            },
          ]} />
    </Box>
  );
}
