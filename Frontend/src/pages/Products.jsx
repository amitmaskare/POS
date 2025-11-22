import React, { useState,useEffect } from "react";
import { Box } from "@mui/material";

import Header from "../components/Products/ProductHeader";
import SearchFilter from "../components/Products/ProductFilter";
import AddProductModal from "../components/Products/ProductModal";
import ProductStats from "../components/Products/ProductStats";
import ProductTable from "../components/Products/ProductTable";

const Products = () => {
  const [open, setOpen] = useState(false);
 
  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Header onAddClick={() => setOpen(true)} />

      <AddProductModal open={open} onClose={() => setOpen(false)} />

      <Box sx={{ width: "100%", px: 3, py: 2 }}>
        <ProductStats />
      </Box>

      <SearchFilter />

      <ProductTable />
    </Box>
  );
};


export default Products;
