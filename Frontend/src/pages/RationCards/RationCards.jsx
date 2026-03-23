import {useState,useEffect} from 'react';
import {
  Box,  Typography,
  MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { FaRegSquarePlus } from 'react-icons/fa6';
import Title from '../../components/MainContentComponents/Title';
import SearchFilter from '../../components/MainContentComponents/SearchFilter';
import TableLayout from '../../components/MainContentComponents/Table';
import { columns } from './columns';
import { useTheme } from "@mui/material/styles";
import {rationcardList,getById,deleteItem} from "../../services/rationcardService"
import ModalLayout from "./Modal";

export default function RationCards() {
  const [open, setOpen] = useState(false);

  const [typeFilter, setTypeFilter] = useState('All Types');
  const [search, setSearch] =useState('');
  const[data,setData]=useState([])
    const[success,setSuccess]=useState('')
    const[error,setError]=useState('')
    const[loading,setLoading]=useState(false)
    const [editData, setEditData] = useState(null);

    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
  
    
     useEffect(()=>{
  fetchrationcardList()
  },[])
  
    const fetchrationcardList =async()=>{
      setSuccess(null)
      setError(null)
      try{
        const result=await rationcardList()
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
           const deleteData=window.confirm('Are you sure you want to delete this item?')
    if(deleteData)
    {
          const result=await deleteItem(id)
          if(result.status===true)
          {
            setSuccess(result.message)
            fetchrationcardList()
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
/*header*/
    <Box sx={{ minHeight: "100vh" }}>
      <Title
        title="Ration Card Management"
        subtitle="Manage system users and permissions"
        actions={[
          {
            label: "Add Ration Card",
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
     <ModalLayout open={open} onClose={() => setOpen(false)} onSaved={fetchrationcardList}  editData={editData}/>

      <Box sx={{ mt: 3 }}>
        <SearchFilter
          placeholder="Search by card number, name, or mobile..."
          onSearchChange={(e) => setSearch(e.target.value)}
          extraFields={[
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={typeFilter}
                label="Filter by Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="All Types">All Types</MenuItem>
                <MenuItem value="BPL">BPL</MenuItem>
                <MenuItem value="AAY">AAY</MenuItem>
              </Select>
            </FormControl>
          ]}
        />

      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} mt={3}>
        <Typography variant="h6" fontWeight={700} sx={{color: isDark ? "#fff" : "#415a77"}}>
          Registered Ration Cards (2)
        </Typography>
      </Box>
      <TableLayout columns={columns} rows={rows}  extra={{ deleteItem: handleDelete, edit: handleEdit }}/>
    </Box>
  );
}
