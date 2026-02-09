import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Cart from "../pages/PosSystem/Cart";
import SaleReturnCart from "../pages/SaleReturn/Cart";
import { Box, useMediaQuery, useTheme } from "@mui/material";

const Manage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isSaleReturnDashboard = location.pathname === "/salereturn";

  // receives: "expanded", "collapsed", "hidden"
  const [sidebarState, setSidebarState] = useState(isMobile ? "hidden" : "expanded");
  
  // Separate cart states for PosSystem and SaleReturn
  const [posSystemCart, setPosSystemCart] = useState([]);
  const [saleReturnCart, setSaleReturnCart] = useState([]);

  // Generic cart addition function factory
  const createAddToCart = (setCartFunc) => (product) => {
    setCartFunc((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      // ✅ product already in cart → qty++
      if (exists) {
        return prev.map((item) => {
          if (item.id !== product.id) return item;

          const newQty = item.qty + 1;
          const basePrice = item.selling_price ?? item.price;

          return {
            ...item,
            qty: newQty,
            price: newQty * basePrice,
            total: newQty * basePrice,
          };
        });
      }

      // ✅ new product → add first time
      const basePrice = product.selling_price ?? product.price;

      return [
        ...prev,
        {
          ...product,
          qty: 1,
          price: basePrice,
          total: basePrice,
        },
      ];
    });
  };

  // Module-specific addToCart functions
  const addToPosSystemCart = createAddToCart(setPosSystemCart);
  const addToSaleReturnCart = createAddToCart(setSaleReturnCart);

  // Determine which module is active and use appropriate cart
  const currentCart = isSaleReturnDashboard ? saleReturnCart : posSystemCart;
  const currentSetCart = isSaleReturnDashboard ? setSaleReturnCart : setPosSystemCart;
  const addToCart = isSaleReturnDashboard ? addToSaleReturnCart : addToPosSystemCart;

  const getSidebarWidth = () => {
    // On mobile, sidebar is a drawer overlay, so width is always 0
    if (isMobile) return 0;

    if (sidebarState === "expanded") return 265;
    if (sidebarState === "collapsed") return 80;
    return 0; // hidden
  };

  const SIDEBAR_WIDTH = getSidebarWidth();
  const HEADER_HEIGHT = isMobile ? 60 : 70;

  return (
    <Box sx={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>

      {/* Sidebar */}
      <Sidebar sidebarState={sidebarState} setSidebarState={setSidebarState} />

      {/* Right Content */}
      <Box
        sx={{
          marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
          width: isMobile ? "100%" : `calc(100% - ${SIDEBAR_WIDTH}px)`,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "0.3s ease",
        }}
      >

        {/* Header */}
        <Box
          sx={{
            height: `${HEADER_HEIGHT}px`,
            position: "fixed",
            left: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
            top: 0,
            width: isMobile ? "100%" : `calc(100% - ${SIDEBAR_WIDTH}px)`,
            bgcolor: "#fff",
            zIndex: 1500,
            borderBottom: "1px solid #eee",
            transition: "0.3s ease",
          }}
        >
          <Header sidebarState={sidebarState}/>
        </Box>

        {/* Page Content */}
        <Box
          sx={{
            marginTop: `${HEADER_HEIGHT}px`,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            overflowY: "auto",
            p: { xs: 1.5, sm: 2, md: 3 },
            // Custom Scrollbar Styling
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#5A8DEE",
              borderRadius: "10px",
              "&:hover": {
                background: "#4a7dd9",
              },
            },
            // Firefox Scrollbar
            scrollbarWidth: "thin",
            scrollbarColor: "#5A8DEE #f1f1f1",
          }}
        >
         <Outlet context={{ addToCart }} />
        </Box>

        {isDashboard && <Cart cart={posSystemCart} setCart={setPosSystemCart} />}
        {isSaleReturnDashboard && <SaleReturnCart cart={saleReturnCart} setCart={setSaleReturnCart} />}
      </Box>
    </Box>
  );
};

export default Manage;
