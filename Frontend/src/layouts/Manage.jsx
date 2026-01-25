import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Cart from "../pages/PosSystem/Cart";
import SaleReturnCart from "../pages/SaleReturn/Cart";
import { Box } from "@mui/material";

const HEADER_HEIGHT = 70;

const Manage = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isSaleReturnDashboard = location.pathname === "/salereturn";

  // receives: "expanded", "collapsed", "hidden"
  const [sidebarState, setSidebarState] = useState("expanded");
  const [cart, setCart] = useState([]);
//   const addToCart = (product) => {
//   setCart((prev) => {
//     const exists = prev.find((item) => item.id === product.id);

//     if (exists) {
//       return prev.map((item) => {
//         if (item.id !== product.id) return item;

//         const newQty = item.qty + 1;
//         const basePrice = item.selling_price ?? item.price;

//         return {
//           ...item,
//           qty: newQty,
//           price: basePrice,
//         };
//       });
//     }

//     return [
//       ...prev,
//       {
//         ...product,
//         price: product.selling_price ?? product.price,
//       },
//     ];
//   });
// };

const addToCart = (product) => {
  setCart((prev) => {
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
          total: newQty * basePrice, // 🔥 important
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

  const getSidebarWidth = () => {
    if (sidebarState === "expanded") return 265;
    if (sidebarState === "collapsed") return 80;
    return 0; // hidden
  };

  const SIDEBAR_WIDTH = getSidebarWidth();

  return (
    <Box sx={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>

      {/* Sidebar */}
      <Sidebar sidebarState={sidebarState} setSidebarState={setSidebarState} />

      {/* Right Content */}
      <Box
        sx={{
          marginLeft: `${SIDEBAR_WIDTH}px`,
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
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
            left: `${SIDEBAR_WIDTH}px`,
            top: 0,
            width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
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
            p: 3,
          }}
        >
         <Outlet context={{ addToCart }} />
        </Box>

        {isDashboard && <Cart cart={cart} setCart={setCart} />}
        {isSaleReturnDashboard && <SaleReturnCart cart={cart} setCart={setCart} />}
      </Box>
    </Box>
  );
};

export default Manage;
