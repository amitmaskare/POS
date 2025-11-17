import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Cart from "./Cart";
import { Box } from "@mui/material";

const HEADER_HEIGHT = 70;

const Manage = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const SIDEBAR_WIDTH = isCollapsed ? 80 : 260;

  return (
    <Box sx={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>

      {/* FIXED SIDEBAR */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          bgcolor: "#fff",
          zIndex: 2000,
          borderRight: "1px solid #eee",
          transition: "0.25s ease",
        }}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </Box>
      <Box
        sx={{
          marginLeft: `${SIDEBAR_WIDTH}px`,
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "0.25s ease",
        }}
      >

        {/* FIXED HEADER */}
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
            transition: "0.25s ease",
          }}
        >
          <Header />
        </Box>


        {/* SCROLLABLE CONTENT */}
        <Box
          sx={{
            marginTop: `${HEADER_HEIGHT}px`,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            overflowY: "auto",
            p: 3,
            
          }}
        >
          <Outlet />
        </Box>

        {isDashboard && <Cart />}
      </Box>
    </Box>
  );
};

export default Manage;
