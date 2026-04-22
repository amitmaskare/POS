import React,{useState,useEffect} from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import Title from "../../components/MainContentComponents/Title";
import Stats from "../../components/MainContentComponents/Stats";
import { statsData } from "./StatsData";
import { statsData1 } from "./StatsData1";
import TableLayout from "../../components/MainContentComponents/Table";
import ViewSaleModal from "./Modal";
import ReturnRefundModal from "./ReturnRefundModal";
import { columns } from "./columns";
import {returnList,getReturnById,scanInvoice} from "../../services/ReturnService"


export default function Return() {

  const [openModal, setOpenModal] = React.useState(false);
  const [openReturnModal, setOpenReturnModal] = useState(false);
  const [data,setData]=useState([])
  const [viewData, setviewData] = useState(null);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(()=>{
    fetchReturnList()
  },[])

  const fetchReturnList =async()=>{
    try{
      const result=await returnList()
      if(result.status===true)
      {
        setData(result.data)
      }else{
        setData([])
      }
    }catch(error)
    {
      console.log(error.response?.data?.message || error.message);
    }
  }

  const handleView =async(id) => {
    try{
      const result=await getReturnById(id)
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

  const handleInvoiceSearch = async () => {
    if (!invoiceSearch.trim()) return;
    try {
      const result = await scanInvoice({ invoice_no: invoiceSearch.trim() });
      if (result.status === true) {
        setInvoiceData(result.data);
        setOpenReturnModal(true);
      } else {
        alert(result.message || "Invoice not found");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invoice not found");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Title
        title="Return Item"
        subtitle="Manage Return Item & Process Refunds"
      />
      {/* TOP CARDS */}
      <Box mb={3} mt={3}>
        <Stats stats={statsData} />
      </Box>

      {/* SEARCH BY INVOICE */}
      <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Typography variant="h6" fontWeight={700} color="#415a77" mb={2}>
          Process Return / Refund
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Enter Invoice Number"
            placeholder="e.g. TXN-17-04-2026-0001"
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvoiceSearch()}
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleInvoiceSearch}
            sx={{ backgroundColor: '#5A8DEE', '&:hover': { backgroundColor: '#4a7dd8' } }}
          >
            Search Order
          </Button>
        </Box>
      </Paper>

      {/* RETURN LIST TABLE */}
      <Paper
        sx={{ p: 3, borderRadius: 2, mt: 4, }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight={700} color="#415a77">
            Return History
          </Typography>
        </Box>
        <TableLayout columns={columns} rows={data} extra={{ view: handleView}} actionButtons={[
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

        <Typography variant="h6" color="#415a77" fontWeight={700} mb={2} mt={3}>
          Quick Actions
        </Typography>
        <Box mb={3} mt={3} >
          <Stats stats={statsData1} />
        </Box>

      </Paper>

      <ViewSaleModal open={openModal} onClose={() => setOpenModal(false)} onSaved={fetchReturnList} viewData={viewData}/>

      <ReturnRefundModal
        open={openReturnModal}
        onClose={() => { setOpenReturnModal(false); setInvoiceData(null); setInvoiceSearch(''); }}
        onSaved={fetchReturnList}
        invoiceData={invoiceData}
      />
    </Box>
  );
}
