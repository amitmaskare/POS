import React from 'react';
import {Box} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import Title from '../../components/MainContentComponents/Title';
import Stats from '../../components/MainContentComponents/Stats';
import { FaRegSquarePlus } from 'react-icons/fa6';
import TableLayout from '../../components/MainContentComponents/Table';
import { stats } from './StatsData';
import { customerColumns } from './columns';
import { customerRows } from './rows';


export default function Customers() {
  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* Header */}
      <Title
        title="Customers"
        subtitle="Manage your customer database"
        actions={[
          {
            label: "Add Customer",
            icon: <FaRegSquarePlus />,
            variant: "contained",
            bgcolor: "#5A8DEE",

          },
        ]}
      />

      {/* Stats */}
      <Box mt={2}>
        <Stats stats={stats} />
      </Box>
      
      {/* Customer List Table */}
      <TableLayout columns={customerColumns} rows={customerRows} s actionButtons={[
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
