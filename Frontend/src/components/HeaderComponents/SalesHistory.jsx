import React ,{useState,useEffect}from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import {saleList} from "../../services/saleService"

export default function SalesHistoryModal({ open, onClose }) {
  const[sales,setSales]=useState([])
  // const sales = [
  //   { id: "TXN001", amount: "$6.35", type: "Cash", items: "2 items", time: "2 hours ago" },
  //   { id: "TXN002", amount: "$6.50", type: "Credit", items: "2 items", time: "5 hours ago" },
  //   { id: "TXN003", amount: "$4.35", type: "Cash", items: "2 items", time: "1 day ago" },
  // ];

    useEffect(()=>{
      fetchSaleList()
    },[])

    const fetchSaleList =async()=>{
      try{
        const result=await saleList()
        if(result.status===true)
        {
        setSales(result.data)
        }
      }catch(error){
      console.log(error.response?.data?.message || error.message);
      }
    }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        background: "#f8fafc",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        mt: 8,
        
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: 20,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          color:"#fff",
          backgroundColor:"#415a77",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <HistoryIcon />
          Sales History
        </Box>

        <IconButton
          onClick={onClose}
          sx={{ color:"#fff" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent sx={{ p: 3, mt: 2 }}>
       {sales && sales.length > 0 ? (
  sales.slice(0, 5).map((txn) => (
    <Paper
      key={txn.id}
      sx={{
        p: 2,
        mb: 2,
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        background: "#fff",
      }}
    >
      {/* Row 1 */}
      <Box display="flex" justifyContent="space-between">
        <Typography fontWeight={600} color="#415a77" sx={{ fontSize: 15 }}>
          # {txn.invoice_no}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5} color="#64748b">
          <AccessTimeIcon sx={{ fontSize: 18 }} />
          <Typography color="#415a77" fontSize={14}>{txn.sale_time}</Typography>
        </Box>
      </Box>

      {/* Amount */}
      <Typography fontSize={16} fontWeight={700} mt={1}>
        {txn.amount}
      </Typography>

      {/* Tags */}
      <Box display="flex" gap={1} mt={1}>
        <Chip
          label={txn.paymentMethod ? txn.paymentMethod:'Cash'}
          size="small"
          sx={{ background: "#415a77", color: "#fff" }}
        />
        <Chip
          label={txn.total_items}
          size="small"
          sx={{ background: "#415a77", color: "#fff" }}
        />
      </Box>
    </Paper>
  ))
) : (
  <Box
    sx={{
      textAlign: "center",
      py: 4,
      color: "#94a3b8",
      fontSize: 14,
    }}
  >
    No data found
  </Box>
)}

      </DialogContent>
    </Dialog>
  );
}
