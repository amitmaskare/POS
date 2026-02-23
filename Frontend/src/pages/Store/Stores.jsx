import {useState,useEffect} from 'react';
import {Box, Alert, Snackbar} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import Title from '../../components/MainContentComponents/Title';
import Stats from '../../components/MainContentComponents/Stats';
import { FaRegSquarePlus } from 'react-icons/fa6';
import TableLayout from '../../components/MainContentComponents/Table';
import { stats } from './StatsData';
import { columns } from './columns';
import {storeList,getById,deleteItem} from "../../services/storeService.jsx"
import ModalLayout from "./Modal";

export default function Stores() {
  const [open, setOpen] = useState(false);
  const[data,setData]=useState([])
  const[success,setSuccess]=useState('')
  const[error,setError]=useState('')
  const[loading,setLoading]=useState(false)
  const [editData, setEditData] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  useEffect(()=>{
    fetchStoreList()
  },[])

  const fetchStoreList =async()=>{
    setSuccess(null)
    setError(null)
    try{
      const result=await storeList()
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
  
  const handleDelete = async(id) => {
    setSuccess('')
    setError('')
    try{
      const deleteData=window.confirm('Are you sure you want to delete this store? This action cannot be undone.')
      if(deleteData)
      {
        const result=await deleteItem(id)
        if(result.status===true)
        {
          setSuccess(result.message)
          setSnackbarOpen(true)
          fetchStoreList()
        }else{
          setError(result.message)
          setSnackbarOpen(true)
        }
      }
    }catch(error)
    {
      setError(error.response?.data?.message || error.message)
      setSnackbarOpen(true)
    }
  };

  const handleEdit =async(id) => {
    setSuccess('')
    setError('')
    try{
      const result=await getById(id)
      if(result.status===true)
      {
        setEditData(result.data);
        setOpen(true);
      }else{
        setError(result.message)
        setSnackbarOpen(true)
      }
    }catch(error)
    {
      setError(error.response?.data?.message || error.message)
      setSnackbarOpen(true)
    }
  };

  const handleAddClick = () => {
    setEditData(null);
    setSuccess('');
    setError('');
    setOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* Header */}
      <Title
        title="Stores"
        subtitle="Manage your Store database"
        actions={[
          {
            label: "Add Store",
            icon: <FaRegSquarePlus />,
            variant: "contained",
            bgcolor: "#5A8DEE",
            onClick: handleAddClick,
          },
        ]}
      />

      <ModalLayout open={open} onClose={() => setOpen(false)} onSaved={fetchStoreList} editData={editData}/>
      
      {/* Stats */}
      <Box mt={2}>
        <Stats stats={stats} />
      </Box>
      
      {/* Store List Table */}
      <TableLayout 
        columns={columns} 
        rows={data}  
        extra={{ deleteItem: handleDelete, edit: handleEdit }}  
        actionButtons={[
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
        ]}
      />

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {success ? (
          <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
            {success}
          </Alert>
        ) : (
          <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
            {error}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
