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
import {inventoryList} from "../../services/productService"
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
        const result=await inventoryList()
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
 const lowStock = data.filter(
  item => Number(item.stock) > 0 && Number(item.stock) <= 2
);

const outOfStock = data.filter(
  item => Number(item.stock) === 0
);

  const totalSale = sale.filter(item => item.status === 'COMPLETED');
  const totalPurchase = purchase.filter(item => item.status === 'completed');

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
            variant: "contained",
          },
          {
            label: "Export",
            icon: <FileDownloadIcon />,
            variant: "contained",
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
              sx: { borderColor: "#415a77", px: 2 ,color:"#415a77"},
              onClick: () => console.log("Filter clicked"),
            },
            {
              label: "Export",
              icon: <DownloadIcon />,
              variant: "outlined",
              sx: { borderColor: "#415a77", px: 2,color:"#415a77" },
              onClick: () => console.log("Export clicked"),
            },
          ]}
        />
      </Box>
      
      {/* Inventory Items */}
      <Typography variant="h6" color="#415a77" mt={3}>Inventory Items</Typography>
      <Divider sx={{ mb: 2, bgcolor: '#333' }} />

      <Grid container spacing={1}>
        {data.map((item, index) => (
          <Grid
          item
          key={index}
          xs={12}     // 1 per row on mobile
          sm={6}      // 2 per row on tablet
          md={4}      // 3 per row on medium
          lg={12}      // 4 per row on desktop
        >
          <Box
            sx={{
              borderRadius: "12px",
              p: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* LEFT CONTENT */}
            <Box display="flex" gap={2} alignItems="center">
              {/* Icon Box */}
              <Box
                sx={{
                  width: 45,
                  height: 45,
                  borderRadius: "10px",
                  backgroundColor: "#f4f6f8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InventoryIcon sx={{ color: "#415a77", fontSize: 26 }} />
              </Box>

              {/* Text Info */}
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                <Typography
  sx={{
    fontWeight: 600,
    fontSize: "16px",
    color: "#415a77",
  }}
>
  {item.product_name
    ? item.product_name.charAt(0).toUpperCase() +
      item.product_name.slice(1)
    : ""}
</Typography>

                  <Chip
                    label={
                      Number(item.stock) === 0
                        ? "Out of Stock"
                        : Number(item.stock) <= 2
                          ? "Low Stock"
                          : "In Stock"
                    }
                    size="small"
        sx={{
          fontSize: "11px",
          height: 22,
          backgroundColor:
            Number(item.stock) === 0
              ? "#fdecea"
              : Number(item.stock) <= 2
              ? "#fff4e5"
              : "#edf7ed",
                    color:
                      Number(item.stock) === 0
                        ? "#d32f2f"
                        : Number(item.stock) <= 2
                          ? "#ed6c02"
              : "#2e7d32",
          fontWeight: 500,
        }}
                  />
                </Box>

                  <Typography variant="body2" sx={{ color: "#415a77", mt: 0.5 }}>
                    Category: {item.category_name}
                  </Typography>
    <Box display="flex" gap={3} mt={0.5}>
      <Typography variant="body2" sx={{ color: "#495057" }}>
        Stock: <strong>{item.stock}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#495057" }}>
                    Price: <strong>${item.cost_price}</strong>
                  </Typography>
              </Box>
            </Box>
          </Box>
            {/* RIGHT SIDE ACTION */}
            {/* RIGHT SIDE — replace your existing right box with this */}
           

          </Box>
          
          </Grid>
  ))}
</Grid>


      {/* Bottom Panels */}
      <Grid
  container
  spacing={3}
  mt={4}
  justifyContent="center"
>
  {/* LOW STOCK */}
  <Grid item xs={12} md={6} lg={4}>
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#415A77",
            mb: 2,
          }}
        >
          Low in Stock
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={1}>
          {lowStock.map((item, i) => (
            <Chip
              key={i}
              label={item.product_name}
              size="small"
              sx={{
                bgcolor: "#fff7ed",
                color: "#c2410c",
                fontWeight: 500,
                borderRadius: "8px",
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  </Grid>

  {/* OUT OF STOCK */}
  <Grid item xs={12} md={6} lg={4}>
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#415A77",
            mb: 2,
          }}
        >
          Out of Stock
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={1}>
          {outOfStock.map((item, i) => (
            <Chip
              key={i}
              label={item.product_name}
              size="small"
              sx={{
                bgcolor: "#fee2e2",
                color: "#b91c1c",
                fontWeight: 500,
                borderRadius: "8px",
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  </Grid>

  {/* RECENT ACTIVITY */}
 <Grid item xs={12} md={6} lg={4}>
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#415A77",
            mb: 2,
          }}
        >
          Recent Activity
        </Typography>

        {data.slice(0, 5).map((item, i) => (
          <Box
            key={i}
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: 2,
              background: "#f8fafc",
            }}
          >
            <Typography variant="body2" sx={{ color: "#475569" }}>
              2 days ago
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#0f172a" }}
            >
              {item.product_name} updated
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  </Grid>
</Grid>

    </Box>
  );
};

export default Inventory;
