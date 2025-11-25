import React from "react";
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
import NewPurchaseOrderModal from "./Modal";
import { FaRegSquarePlus } from "react-icons/fa6";
import { rows } from "./rows";
import { columns } from "./columns";




export default function Purchases() {
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Title
        title="Purchases"
        subtitle="Manage Purchase oders and suppliers "
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
        sx={{ p: 3, borderRadius: 2, mt: 4, }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight={700} color="#5A8DEE">
            Purchase Orders
          </Typography>
        </Box>
        <TableLayout columns={columns} rows={rows} actionButtons={[
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
      <NewPurchaseOrderModal open={openModal} onClose={() => setOpenModal(false)} />

    </Box>
  );
}
