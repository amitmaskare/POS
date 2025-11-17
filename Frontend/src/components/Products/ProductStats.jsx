import React from "react";
import { Grid, Card, CardContent, Box, Typography } from "@mui/material";
import { TfiPackage } from "react-icons/tfi";
import { FaCheckCircle, FaExclamationTriangle, FaTags } from "react-icons/fa";

const ProductStats = () => {
  const stats = [
    { title: "Total Products", value: 9, color: "#2196f3", icon: <TfiPackage size={50} /> },
    { title: "Active Products", value: 6, color: "#4caf50", icon: <FaCheckCircle size={50} /> },
    { title: "Low Stock", value: 3, color: "#ff9800", icon: <FaExclamationTriangle size={50} /> },
    { title: "Categories", value: 3, color: "#9c27b0", icon: <FaTags size={50} /> },
  ];

  return (
    <Grid container spacing={3} justifyContent="space-between" alignItems="stretch">
      {stats.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", transition: "0.3s ease", "&:hover": { transform: "translateY(-5px)" } }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
              <Box sx={{ color: card.color, fontSize: 50, display: "flex", alignItems: "center", justifyContent: "center", width: 100, height: 50 }}>
                {card.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">{card.title}</Typography>
                <Typography variant="h5" fontWeight="bold" color={card.color}>{card.value}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductStats;
