import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LuStore } from "react-icons/lu";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NightlightIcon from "@mui/icons-material/Nightlight";
import MenuIcon from "@mui/icons-material/Menu";

const menuItems = [
  { title: "POS System", icon: <ShoppingCartIcon />, path: "/dashboard" },
  { title: "Products", icon: <CategoryIcon />, path: "/products" },
  { title: "Purchases", icon: <ShoppingBagIcon />, path: "/purchases" },
  { title: "Transactions", icon: <ReceiptLongIcon />, path: "/transactions" },
  { title: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
  { title: "Reports", icon: <AssessmentIcon />, path: "/reports" },
  { title: "Customers", icon: <PeopleIcon />, path: "/customers" },
  { title: "Users", icon: <PersonIcon />, path: "/users" },
  { title: "Ration Cards", icon: <InventoryIcon />, path: "/rationcards" },
];

export default function Sidebar({ sidebarState, setSidebarState }) {
  const location = useLocation();

  const toggleSidebar = () => {
    if (sidebarState === "expanded") setSidebarState("collapsed");
    else if (sidebarState === "collapsed") setSidebarState("hidden");
    else setSidebarState("expanded");
  };

  return (
    <>
      {sidebarState === "hidden" && (
        <MenuIcon
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 18,
            left: 18,
            cursor: "pointer",
            zIndex: 2000,
            color: "#5A8DEE",
          }}
        />
      )}

      <Box
        sx={{
          width:
            sidebarState === "expanded"
              ? 265
              : sidebarState === "collapsed"
              ? 80
              : 0,
          height: "100vh",
          backgroundColor: "#fff",
          borderRight:
            sidebarState === "hidden" ? "none" : "1px solid #e6e8ef",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "0.3s ease",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1500,
        }}
      >
        {sidebarState !== "hidden" && (
  <Box
    sx={{
      p: sidebarState === "collapsed" ? 1.5 : 2,
      pb: 1,
      borderBottom: "1px solid #eef1f7",
    }}
  >
    <Box
      display="flex"
      alignItems="center"
      flexDirection={sidebarState === "collapsed" ? "column" : "row"}
      justifyContent={
        sidebarState === "collapsed" ? "center" : "flex-start"
      }
      textAlign={sidebarState === "collapsed" ? "center" : "left"}
      gap={sidebarState === "collapsed" ? 1.2 : 0}
    >
      {sidebarState === "collapsed" && (
        <MenuIcon
          sx={{ cursor: "pointer", color: "#5A8DEE" }}
          onClick={toggleSidebar}
        />
      )}

      <LuStore size={32} color="#5A8DEE" />

      {sidebarState === "expanded" && (
        <Box ml={2}>
          <Typography variant="h6" fontWeight="bold" color="#5A8DEE">
            My Store
          </Typography>
          <Typography fontSize="14px" color="black">
            Admin • Admin User
          </Typography>
        </Box>
      )}

      {sidebarState === "expanded" && (
        <MenuIcon
          sx={{
            marginLeft: "auto",
            cursor: "pointer",
            color: "#5A8DEE",
          }}
          onClick={toggleSidebar}
        />
      )}
    </Box>
  </Box>
)}

        {/* Menu Items */}
        {sidebarState !== "hidden" && (
          <Box sx={{ flexGrow: 1, p: 2 }}>
            <List>
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={index}
                    component={Link}
                    to={item.path}
                    sx={{
                      mb: 1,
                      borderRadius: "10px",
                      backgroundColor: isActive ? "#5A8DEE" : "transparent",
                      color: isActive ? "#fff" : "black",
                      justifyContent:
                        sidebarState === "collapsed"
                          ? "center"
                          : "flex-start",
                      px: sidebarState === "collapsed" ? 1.5 : 2,
                      "&:hover": {
                        backgroundColor: isActive
                          ? "#5A8DEE"
                          : "#e9efff",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "#fff" : "#5A8DEE",
                        minWidth: sidebarState === "collapsed" ? "0px" : "40px",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {sidebarState === "expanded" && (
                      <ListItemText primary={item.title} />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        )}

        {/* Bottom section */}
        {/* Bottom section */}
{sidebarState !== "hidden" && (
  <Box sx={{ p: 2 }}>
    <Divider sx={{ mb: 1 }} />

    {/* Dark Mode */}
    <ListItemButton sx={{ borderRadius: "10px", mb: 1 }}>
      <ListItemIcon
        sx={{
          minWidth: sidebarState === "collapsed" ? "0px" : "40px",
          color: "#556070",
        }}
      >
        <NightlightIcon />
      </ListItemIcon>

      {sidebarState === "expanded" && (
        <>
          <ListItemText primary="Dark Mode" />
          <Switch size="small" />
        </>
      )}
    </ListItemButton>

    {/* Logout Button */}
    <ListItemButton
      sx={{
        borderRadius: "10px",
        backgroundColor: "transparent",
        color: "red",
        "&:hover": {
          backgroundColor: "#ffe5e5",
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: sidebarState === "collapsed" ? "0px" : "40px",
          color: "red",
        }}
      >
        <ExitToAppIcon />
      </ListItemIcon>

      {sidebarState === "expanded" && (
        <ListItemText primary="Logout" sx={{ color: "red", fontWeight: "bold" }} />
      )}
    </ListItemButton>
  </Box>
)}

      </Box>
    </>
  );
}
