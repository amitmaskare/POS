import {useState,useEffect} from 'react';
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
import {productList} from "../../services/productService"
import {saleList} from "../../services/saleService"
import {purchaseList} from "../../services/purchaseService"

const Inventory = () => {
   const[data,setData]=useState([])
   const[sale,setSale]=useState([])
   const[purchase,setPurchase]=useState([])

   useEffect(()=>{
  fetchProductList()
  fetchSaleList()
  fetchPurchaseList()
  },[])
  
    const fetchProductList =async()=>{
      try{
        const result=await productList()
        if(result.status===true)
        {
          setData(result.data)
        }else{
          console.log(result.message)
        }
      }catch(error)
      {
          console.log(error.response?.data?.message || error.message);
      }
    }
    const fetchSaleList =async()=>{
      try{
        const result=await saleList()
        if(result.status===true)
        {
          setSale(result.data)
        }else{
          console.log(result.message)
        }
      }catch(error)
      {
          console.log(error.response?.data?.message || error.message);
      }
    }
    const fetchPurchaseList =async()=>{
      try{
        const result=await purchaseList()
        if(result.status===true)
        {
          setPurchase(result.data)
        }else{
          console.log(result.message)
        }
      }catch(error)
      {
          console.log(error.response?.data?.message || error.message);
      }
    }
  const lowStock = data.filter(item => item.stock > 0 && item.stock <= 2);
  const outOfStock = data.filter(item => item.stock === 0);
  const totalSale = sale.filter(item => item.status === 'COMPLETED');
  const totalPurchase = purchase.filter(item => item.type === 'SEND');

   const getstatsData = statsData({
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    totalSaleCount: totalSale.length,
    totalPurchaseCount: totalPurchase.length,
  });
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
        ]} />

      {/* Stats */}
      <Box mt={3}>
        <Stats stats={getstatsData} />
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
        {data.map((item, index) => (
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
                    {item.product_name}
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
                    Category: {item.category_name}
                  </Typography>
                  <Typography variant="body2" >
                    Price: ${item.cost_price}
                  </Typography>
                </Box>

                {/* Stock + Updated in one row */}
                <Box display="flex" gap={2} mt={0.5}>
                  <Typography variant="body2" >
                    Stock: {item.stock}
                  </Typography>
                  {/* <Typography variant="body2" >
                    Last updated: {item.updated}
                  </Typography> */}
                </Box>
              </Box>
            </Box>

            {/* RIGHT SIDE ACTION */}
            {/* RIGHT SIDE — replace your existing right box with this */}
           

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
                <Chip key={i} label={item.product_name} sx={{ m: 0.5, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" color="#5A8DEE">Out of Stock</Typography>
              {outOfStock.map((item, i) => (
                <Chip key={i} label={item.product_name} color="error" sx={{ m: 0.5 }} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" color="#5A8DEE">Recent Activity</Typography>
              {data.slice(0, 5).map((item, i) => (
                <Typography key={i} variant="body2" sx={{ mt: 1 }}>
                  2 days ago: {item.product_name} updated
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
