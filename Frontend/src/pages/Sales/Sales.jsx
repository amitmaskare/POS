import React,{useState,useEffect} from "react";
import {
  Box,
  Typography,
  Paper
} from "@mui/material";


import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import Title from "../../components/MainContentComponents/Title";
import Stats from "../../components/MainContentComponents/Stats";
import { statsData } from "./StatsData";
import { statsData1 } from "./StatsData1";
import TableLayout from "../../components/MainContentComponents/Table";
import ViewSaleModal from "./Modal";
import ReturnModal from "./ReturnModal";
import { FaRegSquarePlus } from "react-icons/fa6";
import { rows } from "./rows";
import { columns } from "./columns";
import {saleList,getSaleById} from "../../services/saleService"


export default function Sales() {

  const [openModal, setOpenModal] = React.useState(false);
  const [openReturnModal, setOpenReturnModal] = React.useState(false);
   const[data,setData]=useState([])
    const[success,setSuccess]=useState('')
    const[error,setError]=useState('')
    const[loading,setLoading]=useState(false)
  const [viewData, setviewData] = useState(null);
     useEffect(()=>{
      fetchSaleList()
      },[])
      
        const fetchSaleList =async()=>{
          setSuccess(null)
          setError(null)
          try{
            const result=await saleList()
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

          const handleView =async(id) => {
                                
                                try{    
                                  const result=await getSaleById(id)
                                  if(result.status===true)
                                  {
                                   
                                   setviewData(result.data);
                                   setOpenModal(true);
                                  }else{
                                    console.log(result.message)
                                  }
                                }
                              catch(error)
                                {
                                   console.log(error.response?.data?.message || error.message)
                                }
                          };
         const handleReturn=async(id)=>{
             try{    
                                  const result=await getSaleById(id)
                                  if(result.status===true)
                                  {
                                   
                                   setviewData(result.data);
                                   setOpenReturnModal(true);
                                  }else{
                                    console.log(result.message)
                                  }
                                }
                              catch(error)
                                {
                                   console.log(error.response?.data?.message || error.message)
                                }
        }
     
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Title
        title="Sales"
        subtitle="Manage Sales "
       
      />
      {/* TOP CARDS */}
      <Box mb={3} mt={3}>
        <Stats stats={statsData} />
      </Box>

     
      {/* QUICK ACTIONS */}
      <Paper
        sx={{ p: 3, borderRadius: 2, mt: 4, }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight={700} color="#5A8DEE">
            Sales
          </Typography>
        </Box>
        <TableLayout columns={columns} rows={data} extra={{ view: handleView,return:handleReturn }} actionButtons={[
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

        <Typography variant="h6" fontWeight={700} mb={2} mt={3}>
          Quick Actions
        </Typography>
        <Box mb={3} mt={3} >
          <Stats stats={statsData1} />
        </Box>

      </Paper>
      <ViewSaleModal open={openModal} onClose={() => setOpenModal(false)} onSaved={fetchSaleList} viewData={viewData}/>
      <ReturnModal open={openReturnModal} onClose={() => setOpenReturnModal(false)} onSaved={fetchSaleList} viewData={viewData}/>

    </Box>
  );
}
