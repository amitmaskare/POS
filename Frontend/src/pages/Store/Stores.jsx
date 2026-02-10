import {useState,useEffect} from 'react';
import {Box} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import Title from '../../components/MainContentComponents/Title';
import Stats from '../../components/MainContentComponents/Stats';
import { FaRegSquarePlus } from 'react-icons/fa6';
import TableLayout from '../../components/MainContentComponents/Table';
import { stats } from './StatsData';
import { columns } from './columns';
import {storeList,getById,deleteItem} from "../../services/storeService"
import ModalLayout from "./Modal";

export default function Stores() {
  const [open, setOpen] = useState(false);
 const[data,setData]=useState([])
  const[success,setSuccess]=useState('')
  const[error,setError]=useState('')
  const[loading,setLoading]=useState(false)
  const [editData, setEditData] = useState(null);
  
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
         const deleteData=window.confirm('Are you sure you want to delete this item?')
  if(deleteData)
  {
        const result=await deleteItem(id)
        if(result.status===true)
        {
          setSuccess(result.message)
          fetchStoreList()
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
            onClick: () => {
      setEditData(null);   // ← RESET edit data
      setOpen(true);       // ← OPEN modal
    },

          },
        ]}
      />

     <ModalLayout open={open} onClose={() => setOpen(false)} onSaved={fetchStoreList} editData={editData}/>
      {/* Stats */}
      <Box mt={2}>
        <Stats stats={stats} />
      </Box>
      
      {/* Customer List Table */}
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
          ]}/>
    </Box>
  );
}
