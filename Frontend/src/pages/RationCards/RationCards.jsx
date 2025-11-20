import React from 'react';
import {
  Box,  Typography,
  MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { FaRegSquarePlus } from 'react-icons/fa6';
import Title from '../../components/MainContentComponents/Title';
import SearchFilter from '../../components/MainContentComponents/SearchFilter';
import TableLayout from '../../components/MainContentComponents/Table';
import { columns } from './columns';
import { rows } from './rows';




export default function RationCards() {
  const [typeFilter, setTypeFilter] = React.useState('All Types');
  const [search, setSearch] = React.useState('');

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

          },
        ]}
      />
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
        <Typography variant="h6" fontWeight={700} color='#5A8DEE'>
          Registered Ration Cards (2)
        </Typography>
      </Box>
      <TableLayout columns={columns} rows={rows} />
    </Box>
  );
}
