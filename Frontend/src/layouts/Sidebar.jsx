import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  useMediaQuery,
  useTheme,
  Drawer,
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
import CloseIcon from "@mui/icons-material/Close";
import { getUser } from "../utils/Auth.js";

const menuItems = [
  { title: "POS System", icon: <ShoppingCartIcon />, path: "/dashboard", permission: "view-dashboard" },
  { title: "Products", icon: <CategoryIcon />, path: "/products", permission: "view-product" },
  { title: "Purchases", icon: <ShoppingBagIcon />, path: "/purchases", permission: "view-purchase" },
  { title: "Receiving", icon: <ShoppingBagIcon />, path: "/receiving", permission: "view-receiving" },
  { title: "Sales", icon: <ShoppingBagIcon />, path: "/sales", permission: "view-sale" },
  { title: "Return Product", icon: <ShoppingBagIcon />, path: "/return-product", permission: "view-return" },
  { title: "Transactions", icon: <ReceiptLongIcon />, path: "/transactions", permission: "view-transaction" },
  { title: "Inventory", icon: <InventoryIcon />, path: "/inventory", permission: "view-inventory" },
  { title: "Reports", icon: <AssessmentIcon />, path: "/reports", permission: "view-reports" },
  { title: "Customers", icon: <PeopleIcon />, path: "/customers", permission: "view-customer" },
  { title: "Users", icon: <PersonIcon />, path: "/users", permission: "view-user" },
  { title: "Ration Cards", icon: <InventoryIcon />, path: "/rationcards", permission: "view-rationcard" },
  { title: "Offers", icon: <InventoryIcon />, path: "/offers", permission: "view-offer" },
  { title: "Role", icon: <InventoryIcon />, path: "/role", permission: "view-role" },
  { title: "Permission", icon: <InventoryIcon />, path: "/permission", permission: "view-permission" },
  { title: "Role Permission", icon: <InventoryIcon />, path: "/rolepermission", permission: "view-rolepermission" },
];

export default function Sidebar({ sidebarState, setSidebarState }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900px - 1200px

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle between open and closed
      setSidebarState(sidebarState === "hidden" ? "expanded" : "hidden");
    } else {
      // On desktop, cycle through states
      if (sidebarState === "expanded") setSidebarState("collapsed");
      else if (sidebarState === "collapsed") setSidebarState("hidden");
      else setSidebarState("expanded");
    }
  };

  const logOut = async () => {
    localStorage.clear();
    navigate('/');
  };

  const user = getUser();
  const visibleMenus = menuItems.filter(menu =>
    user.role === "admin" || user.permissions.includes(menu.permission)
  );

  // Close sidebar on mobile when clicking a menu item
  const handleMenuClick = () => {
    if (isMobile) {
      setSidebarState("hidden");
    }
  };

  const sidebarContent = (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "#edf2fb",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: sidebarState === "collapsed" && !isMobile ? 1.5 : 2,
          pb: 1,
          borderBottom: "1px solid #eef1f7",
          flexShrink: 0,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          flexDirection={sidebarState === "collapsed" && !isMobile ? "column" : "row"}
          justifyContent={sidebarState === "collapsed" && !isMobile ? "center" : "space-between"}
          gap={sidebarState === "collapsed" && !isMobile ? 1.2 : 0}
        >
          {/* Menu Icon - Left side on mobile */}
          {(sidebarState === "collapsed" || isMobile) && (
            <Box
              sx={{ cursor: "pointer", color: "#1b263b", display: "flex", alignItems: "center" }}
              onClick={toggleSidebar}
            >
              {isMobile && sidebarState === "expanded" ? <CloseIcon /> : <MenuIcon />}
            </Box>
          )}

          {/* Store Logo */}
          <Box display="flex" alignItems="center" gap={2}>
            <LuStore size={32} color="#415a77" />
            {(sidebarState === "expanded" || isMobile) && (
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#415a77" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  My Store
                </Typography>
                <Typography fontSize="14px" color="#415a77" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                  Admin • Admin User
                </Typography>
              </Box>
            )}
          </Box>

          {/* Toggle icon on expanded desktop */}
          {sidebarState === "expanded" && !isMobile && (
            <MenuIcon
              sx={{ cursor: "pointer", color: "#415a77" }}
              onClick={toggleSidebar}
            />
          )}
        </Box>
      </Box>

      {/* Menu Items with Scrollbar */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: 2,
          // Custom Scrollbar Styling
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#415A77",
            borderRadius: "10px",
            "&:hover": {
              background: "#4a7dd9",
            },
          },
          // Firefox Scrollbar
          scrollbarWidth: "thin",
          scrollbarColor: "#415A77 #f1f1f1",
        }}
      >
        <List sx={{ padding: 0 }}>
          {visibleMenus.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={index}
                component={Link}
                to={item.path}
                onClick={handleMenuClick}
                sx={{
                  mb: 1,
                  borderRadius: "10px",
                  backgroundColor: isActive ? "#415A77" : "transparent",
                  color: isActive ? "#fff" : "black",
                  justifyContent: sidebarState === "collapsed" && !isMobile ? "center" : "flex-start",
                  px: sidebarState === "collapsed" && !isMobile ? 1.5 : 2,
                  py: isMobile ? 1.5 : 1, // Larger tap targets on mobile
                  minHeight: isMobile ? "48px" : "auto", // Touch-friendly height
                  "&:hover": {
                    backgroundColor: isActive ? "#415A77" : "#e9efff",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#fff" : "#415a77",
                    minWidth: sidebarState === "collapsed" && !isMobile ? "0px" : "40px",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {(sidebarState === "expanded" || isMobile) && (
                  <ListItemText
                    primary={item.title}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: isMobile ? '15px' : '14px',
                      }
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: "1px solid #eef1f7", flexShrink: 0 }}>
        {/* Dark Mode */}
        <ListItemButton
          sx={{
            borderRadius: "10px",
            mb: 1,
            minHeight: isMobile ? "48px" : "auto",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: sidebarState === "collapsed" && !isMobile ? "0px" : "40px",
              color: "#556070",
            }}
          >
            <NightlightIcon />
          </ListItemIcon>

          {(sidebarState === "expanded" || isMobile) && (
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
            minHeight: isMobile ? "48px" : "auto",
            "&:hover": {
              backgroundColor: "#ffe5e5",
            },
          }}
          onClick={logOut}
        >
          <ListItemIcon
            sx={{
              minWidth: sidebarState === "collapsed" && !isMobile ? "0px" : "40px",
              color: "red",
            }}
          >
            <ExitToAppIcon />
          </ListItemIcon>

          {(sidebarState === "expanded" || isMobile) && (
            <ListItemText primary="Logout" sx={{ color: "red", fontWeight: "bold" }} />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

  // Mobile: Render as Drawer
  if (isMobile) {
    return (
      <>
        {/* Hamburger Menu Icon when sidebar is hidden */}
        {sidebarState === "hidden" && (
          <MenuIcon
            onClick={toggleSidebar}
            sx={{
              position: "fixed",
              top: 18,
              left: 18,
              cursor: "pointer",
              zIndex: 2000,
              color: "#415a77",
              fontSize: "28px",
            }}
          />
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={sidebarState !== "hidden"}
          onClose={() => setSidebarState("hidden")}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  // Desktop/Tablet: Render as fixed sidebar
  return (
    <>
      {sidebarState === "hidden" && !isMobile && (
        <MenuIcon
          onClick={toggleSidebar}
          sx={{
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
            sidebarState === "expanded" ? 265 :
            sidebarState === "collapsed" ? 80 : 0,
          height: "100vh",
          backgroundColor: "#fff",
          borderRight: sidebarState === "hidden" ? "none" : "1px solid #e6e8ef",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.3s ease",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1500,
        }}
      >
        {sidebarState !== "hidden" && sidebarContent}
      </Box>
    </>
  );
}
