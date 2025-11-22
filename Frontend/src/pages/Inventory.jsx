import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Chip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const inventory = [
  {
    name: 'Coffee Beans - Medium Roast',
    category: 'Coffee',
    price: 12.99,
    stock: 2,
    updated: '2023-09-23'
  },
  {
    name: 'Sandwich - Ham & Cheese',
    category: 'Food',
    price: 5.49,
    stock: 0,
    updated: '2023-09-23'
  },
  {
    name: 'Muffin - Blueberry',
    category: 'Food',
    price: 3.99,
    stock: 1,
    updated: '2023-09-23'
  },
  {
    name: 'Sugar Cubes',
    category: 'Condiments',
    price: 2.49,
    stock: 2,
    updated: '2023-09-23'
  }
];

const Inventory = () => {
  const lowStock = inventory.filter(item => item.stock > 0 && item.stock <= 2);
  const outOfStock = inventory.filter(item => item.stock === 0);
  const totalSales = 117.2;

  return (
    <Box sx={{  p: 4, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" color="#5A8DEE" >Inventory Management</Typography>

      {/* Summary Stats */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={3}>
          <Card >
            <CardContent>
              <Typography variant="h6">Items in Stock</Typography>
              <Typography variant="h4">{inventory.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Low Stock</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningAmberIcon color="warning" />
                <Typography variant="h4">{lowStock.length}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Out of Stock</Typography>
              <Typography variant="h4">{outOfStock.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card >
            <CardContent>
              <Typography variant="h6">Total Sales</Typography>
              <Typography variant="h4">${totalSales.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Items */}
      <Typography variant="h5" color="#5A8DEE">Inventory Items</Typography>
      <Divider sx={{ mb: 2, bgcolor: '#333' }} />
      <List>
        {inventory.map((item, index) => (
          <ListItem
            key={index}
            sx={{  mb: 1, borderRadius: 1 }}
            secondaryAction={<Button variant="outlined" color="primary">Edit</Button>}
          >
            <ListItemText
              primary={item.name}
              secondary={
                <>
                  <Typography variant="body2">Category: {item.category}</Typography>
                  <Typography variant="body2">Price: ${item.price}</Typography>
                  <Typography variant="body2">Stock: {item.stock}</Typography>
                  <Typography variant="body2">Last updated: {item.updated}</Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Bottom Panels */}
      <Grid container spacing={2} mt={4}>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Low in Stock</Typography>
              {lowStock.map((item, i) => (
                <Chip key={i} label={item.name} sx={{ m: 0.5 }} />
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Out of Stock</Typography>
              {outOfStock.map((item, i) => (
                <Chip key={i} label={item.name} color="error" sx={{ m: 0.5 }} />
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Activity</Typography>
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
