import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper
} from "@mui/material";


import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import { useTheme } from "@mui/material/styles";
import Title from "../../components/MainContentComponents/Title";
import Stats from "../../components/MainContentComponents/Stats";
import { statsData } from "./StatsData";
import { statsData1 } from "./StatsData1";
import TableLayout from "../../components/MainContentComponents/Table";
import NewPurchaseOrderModal from "./Modal";
import Toast from "../../components/Toast/Toast";
import { FaRegSquarePlus } from "react-icons/fa6";

import { getColumns } from "./columns";
import { purchaseList, getById } from "../../services/purchaseService"


export default function Purchases() {

  const [openModal, setOpenModal] = React.useState(false);
  const [data, setData] = useState([])
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [editData, setEditData] = useState(null);
  useEffect(() => {
    fetchPurchaseList()
  }, [])

  const fetchPurchaseList = async () => {
    setSuccess(null)
    setError(null)
    try {
      const result = await purchaseList()
      if (result.status === true) {
        setSuccess(result.message)
        setData(result.data)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  }
  const rows = data

  const handleEdit = async (id) => {
    setSuccess('')
    setError('')
    try {

      const result = await getById(id)
      //console.log(result.data.purchase); return false;
      if (result.status === true) {
        setSuccess(result.message)
        setEditData(result.data);
        setOpenModal(true);
      } else {
        setError(result.message)
      }
    }
    catch (error) {
      setError(error.response?.data?.message || error.message)
    }
  };
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const columnsConfig = getColumns(isDark);
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Title
        title="Purchases"
        subtitle="Manage Purchase orders and suppliers "
        actions={[
          {
            label: "New Purchase Order",
            icon: <FaRegSquarePlus />,
            variant: "contained",
            bgcolor: "#5A8DEE",
            onClick: () => setOpenModal(true),
          },
        ]}

      />
      {/* TOP CARDS */}
      <Box mb={3} mt={3}>
        <Stats stats={statsData} />
      </Box>


      {/* QUICK ACTIONS */}
      <Paper
        sx={{ borderRadius: 2, mt: 4, p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? "#fff" : "#415a77" }}>
            Purchase Orders
          </Typography>
          {success && <Typography color="green" className="text-center">{success}</Typography>}
        {error && <Typography color="red">{error}</Typography>}
        </Box>
        
        <Box
          sx={{
            width: "100%",
            "@media (max-width:500px)": {
              width: "100%",
              margin: "0 auto",
              "& .MuiTableCell-root": {
                padding: "6px",
                fontSize: "12px",
               
              }
            }
          }}
        >
          <TableLayout columns={columnsConfig} rows={rows} extra={{ edit: handleEdit }} actionButtons={[
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

        <Typography variant="h6" sx={{ color: isDark ? "#fff" : "#415a77" }} fontWeight={700} mb={2} mt={3}>
          Quick Actions
        </Typography>
        <Box mb={3} mt={3} >
          <Stats stats={statsData1} />
        </Box>

      </Paper>
      <NewPurchaseOrderModal open={openModal} onClose={() => setOpenModal(false)} onSaved={fetchPurchaseList} editData={editData} />
      <Toast show={!!success} message={success} type="success" />
      <Toast show={!!error} message={error} type="error" />
    </Box>
  );
}
