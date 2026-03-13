import React, { useState,useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import { FaRegSquarePlus } from "react-icons/fa6";
import Title from "../../components/MainContentComponents/Title";
import Stats from "../../components/MainContentComponents/Stats";
import TableLayout from "../../components/MainContentComponents/Table";
import { stats } from "./StatsData";
import { columns } from "./columns";
import {userList,getById,deleteItem,unbindDevice} from "../../services/userService"
import ModalLayout from "./Modal";


export default function Users() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const[data,setData]=useState([])
    const[success,setSuccess]=useState('')
    const[error,setError]=useState('')
    const[loading,setLoading]=useState(false)
  const [editData, setEditData] = useState(null);
     useEffect(()=>{
    fetchUserList()
    },[])
    
      const fetchUserList =async()=>{
        setSuccess(null)
        setError(null)
        setLoading(true)
        console.log('Fetching user list...')
        console.log('Token from localStorage:', localStorage.getItem('token') ? 'Token exists' : 'No token found')
        try{
          const result=await userList()
          console.log('User list result:', result)
          if(result.status===true)
          {
            setSuccess(result.message)
            setData(result.data)
            console.log('User data set:', result.data)
          }else{
            const errorMsg = result.message || 'Failed to fetch users'
            setError(errorMsg === 'Access denied. No token provided.'
              ? 'Please login first to view users'
              : errorMsg)
            console.log('API returned error:', result.message)
          }
        }catch(error)
        {
            console.error('Error fetching user list:', error)
            const errorMsg = error.response?.data?.message || error.message
            setError(errorMsg === 'Access denied. No token provided.'
              ? 'Please login first to view users'
              : errorMsg);
        }finally{
          setLoading(false)
        }
      }

      // Use data directly from API - roleName is already included
      const rows = data
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
                  fetchUserList()
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

        const handleManagePermissions = (userId) => {
          navigate(`/user-permissions/${userId}`);
        };

        const handleUnbindDevice = async (userId) => {
          setSuccess('');
          setError('');
          try {
            const confirmUnbind = window.confirm(
              'Are you sure you want to unbind this device? The user will be logged out and can login from a new device.'
            );
            if (confirmUnbind) {
              const result = await unbindDevice(userId);
              if (result.status === true) {
                setSuccess(result.message);
                fetchUserList();
              } else {
                setError(result.message);
              }
            }
          } catch (error) {
            setError(error.response?.data?.message || error.message);
          }
        };
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Title
        title="Users"
        subtitle="Manage system users and permissions"
        actions={[
          {
            label: "Add Users",
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

      {/* SUCCESS/ERROR MESSAGES */}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* TOP STATS + ADD USER */}
     <ModalLayout open={open} onClose={() => setOpen(false)} onSaved={fetchUserList} editData={editData}/>

      <Box mt={2}>
        <Stats stats={stats} />
      </Box>
    
      
      {/* USERS TABLE */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} mt={3}>
        <Typography variant="h6" fontWeight={700}>
          System Users
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {data.length === 0 && !error ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No users found. Please add a user or check if you are logged in.
            </Alert>
          ) : (
            <TableLayout columns={columns} rows={rows}  extra={{ deleteItem: handleDelete, edit: handleEdit, managePermissions: handleManagePermissions, unbindDevice: handleUnbindDevice }}  actionButtons={[
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
          )}
        </>
      )}
    </Box>
  );
}
