import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton
} from '@mui/material';

import Title from '../../components/MainContentComponents/Title';
import Stats from '../../components/MainContentComponents/Stats';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import SearchFilter from '../../components/MainContentComponents/SearchFilter';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { statsData } from './StatsData';
import { inventory } from './Inventoryitems';



const Inventory = () => {
  const lowStock = inventory.filter(item => item.stock > 0 && item.stock <= 2);
  const outOfStock = inventory.filter(item => item.stock === 0);


  return (
    <Box sx={{ minHeight: "100vh" }}>

      {/* Header */}
      <Title
        title="Inventory Management"
        subtitle="Monitor stock levels, analyze inventory trends, and manage updates"
        actions={[
          {
            label: "Import",
            icon: <FileUploadIcon />,
            variant: "outlined",
          },
          {
            label: "Export",
            icon: <FileDownloadIcon />,
            variant: "outlined",
          },
          {
            label: "Add Item",
            icon: <AddIcon />,
            variant: "contained",
            bgcolor: "#5A8DEE"
          },
        ]} />

      {/* Stats */}
      <Box mt={3}>
        <Stats stats={statsData} />
      </Box>

      <Box mt={3}>
        <SearchFilter
          placeholder="Search by supplier name or PO number..."
          buttons={[
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
          ]}
        />
      </Box>
      
      {/* Inventory Items */}
      <Typography variant="h5" color="#5A8DEE" mt={3}>Inventory Items</Typography>
      <Divider sx={{ mb: 2, bgcolor: '#333' }} />

      <Box>
        {inventory.map((item, index) => (
          <Box
            key={index}
            sx={{

              border: "1px solid #333",
              borderRadius: "10px",
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            {/* LEFT CONTENT */}
            <Box display="flex" gap={2}>
              {/* Icon Box */}
              <Box
                sx={{
                  width: 45,
                  height: 45,

                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <InventoryIcon sx={{ color: "#9ca3af" }} />
              </Box>

              {/* Text Info */}
              <Box>
                {/* Name + Stock-Level Badge */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                    {item.name}
                  </Typography>

                  <Chip
                    label={
                      item.stock === 0
                        ? "Out of Stock"
                        : item.stock <= 2
                          ? "Low Stock"
                          : "In Stock"
                    }
                    size="small"
                    color={
                      item.stock === 0
                        ? "error"
                        : item.stock <= 2
                          ? "warning"
                          : "success"
                    }
                  />
                </Box>

                {/* Category + Price in one row */}
                <Box display="flex" gap={2} mt={0.5}>
                  <Typography variant="body2" >
                    Category: {item.category}
                  </Typography>
                  <Typography variant="body2" >
                    Price: ${item.price}
                  </Typography>
                </Box>

                {/* Stock + Updated in one row */}
                <Box display="flex" gap={2} mt={0.5}>
                  <Typography variant="body2" >
                    Stock: {item.stock}
                  </Typography>
                  <Typography variant="body2" >
                    Last updated: {item.updated}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* RIGHT SIDE ACTION */}
            {/* RIGHT SIDE — replace your existing right box with this */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                minWidth: 160,
                gap: 0.5,
              }}
            >
              {/* First line: Stock (label + value)  + Price */}
              <Box display="flex" alignItems="center" gap={2}>
                <Box textAlign="right">
                  <Typography sx={{ fontSize: 15 }}>Stock:{item.stock}</Typography>

                </Box>

                {/* Price block */}
                <Box textAlign="right">

                  <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                    ₹{item.price}
                  </Typography>
                </Box>
              </Box>

              {/* Second line: min / max and per unit */}
              <Box display="flex" alignItems="center" gap={2} sx={{ width: "100%", justifyContent: "flex-end" }}>
                <Typography sx={{ fontSize: 15 }}>
                  Min: {item.min ?? 10} | Max: {item.max ?? 100}
                </Typography>

                <Typography sx={{ fontSize: 1 }}>
                  per unit
                </Typography>
              </Box>

              {/* Action buttons */}
              <Box display="flex" gap={1} mt={1}>
                <IconButton
                  size="small"
                  sx={{

                    border: "1px solid #1f2937",
                    width: 36,
                    height: 36,
                    "&:hover": { bgcolor: "#0f1724" }
                  }}
                >
                  <EditIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                </IconButton>

                <IconButton
                  size="small"
                  sx={{

                    border: "1px solid #1f2937",
                    width: 36,
                    height: 36,
                    "&:hover": { bgcolor: "#0f1724" }
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18, color: "#ef4444" }} />
                </IconButton>
              </Box>
            </Box>

          </Box>
        ))}
      </Box>


      {/* Bottom Panels */}
      <Grid container spacing={2} mt={4} alignItems="stretch" justifyContent={'space-around'}>

        <Grid item xs={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" color="#5A8DEE">Low in Stock</Typography>
              {lowStock.map((item, i) => (
                <Chip key={i} label={item.name} sx={{ m: 0.5, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" color="#5A8DEE">Out of Stock</Typography>
              {outOfStock.map((item, i) => (
                <Chip key={i} label={item.name} color="error" sx={{ m: 0.5 }} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" color="#5A8DEE">Recent Activity</Typography>
              {inventory.map((item, i) => (
                <Typography key={i} variant="body2" sx={{ mt: 1 }}>
                  2 days ago: {item.name} updated
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

      </Grid>

    </Box>
  );
};

export default Inventory;
