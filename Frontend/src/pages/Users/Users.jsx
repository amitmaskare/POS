import React from "react";
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
import { rows } from "./rows";


export default function Users() {

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

          },
        ]}
      />

      {/* TOP STATS + ADD USER */}
      <Box mt={2}>
        <Stats stats={stats} />
      </Box>
    
      
      {/* USERS TABLE */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} mt={3}>
        <Typography variant="h6" fontWeight={700}>
          System Users
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
          ]} />
    </Box>
  );
}
