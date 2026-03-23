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
  Switch,
  useMediaQuery,
  useTheme,
  Drawer,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AdminPanelSettingsIcon from "@mui/icons-material/Group";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NightlightIcon from "@mui/icons-material/Nightlight";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { getUser } from "../utils/Auth.js";

const menuItems = [
  { title: "POS System", icon: <ReceiptLongIcon />, path: "/dashboard", permission: "view-dashboard" },
  { title: "Products", icon: <Inventory2Icon />, path: "/products", permission: "view-product" },
  { title: "Purchases", icon: <ShoppingCartIcon />, path: "/purchases", permission: "view-purchase" },
  { title: "Receiving", icon: <MoveToInboxIcon />, path: "/receiving", permission: "view-receiving" },
  { title: "Sales", icon: <PointOfSaleIcon />, path: "/sales", permission: "view-sale" },
  { title: "Return Product", icon: <KeyboardReturnIcon />, path: "/return-product", permission: "view-return" },
  { title: "Transactions", icon: <ReceiptLongIcon />, path: "/transactions", permission: "view-transaction" },
  { title: "Inventory", icon: <WarehouseIcon />, path: "/inventory", permission: "view-inventory" },
  { title: "Reports", icon: <AssessmentIcon />, path: "/reports", permission: "view-reports" },
  { title: "Customers", icon: <PersonOutlineIcon />, path: "/customers", permission: "view-customer" },
  { title: "Users", icon: <SupervisorAccountIcon />, path: "/users", permission: "view-user" },
  { title: "Ration Cards", icon: <CreditCardIcon />, path: "/rationcards", permission: "view-rationcard" },
  { title: "Offers", icon: <LocalOfferIcon />, path: "/offers", permission: "view-offer" },
  { title: "Role", icon: <BadgeIcon />, path: "/role", permission: "view-role" },
  { title: "Permission", icon: <LockOpenIcon />, path: "/permission", permission: "view-permission" },
  { title: "Role Permission", icon: <AdminPanelSettingsIcon />, path: "/rolepermission", permission: "view-rolepermission" },
];

export default function Sidebar({
  sidebarState,
  setSidebarState,
  darkMode,
  toggleDarkMode
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px

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
        backgroundColor:isDark ? "#1b263b" : "#E6EDF7",
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
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
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
              sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={toggleSidebar}
            >
              {isMobile && sidebarState === "expanded" ? <CloseIcon /> : <MenuIcon />}
            </Box>
          )}

          {/* Store Logo */}
          <Box display="flex" alignItems="center" gap={2}>
            <LuStore size={32} style={{color: isDark ? "#fff" : "#415a77"}}/>
            {(sidebarState === "expanded" || isMobile) && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{color: isDark ? "#fff" : "#415a77", fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  My Store
                </Typography>
                <Typography fontSize="14px" color="#415a77" sx={{color: isDark ? "#fff" : "#415a77",fontSize: { xs: '12px', sm: '14px' } }}>
                  Admin • Admin User
                </Typography>
              </Box>
            )}
          </Box>

          {/* Toggle icon on expanded desktop */}
          {sidebarState === "expanded" && !isMobile && (
            <MenuIcon
              sx={{ cursor: "pointer",color: isDark ? "#fff" : "#415a77"}} 
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
                  backgroundColor: isActive
                    ? (theme) => theme.palette.primary.main
                    : "transparent",

                  color: isActive
                    ? "#fff"
                    : (theme) => theme.palette.text.primary,
                  justifyContent: sidebarState === "collapsed" && !isMobile ? "center" : "flex-start",
                  px: sidebarState === "collapsed" && !isMobile ? 1.5 : 2,
                  py: isMobile ? 1.5 : 1, // Larger tap targets on mobile
                  minHeight: isMobile ? "48px" : "auto", // Touch-friendly height
                  "&:hover": {
                    backgroundColor: isActive ? "#415A77" : "",
                    
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
                        fontWeight: 500, 
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
              <Switch
                size="small"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
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
