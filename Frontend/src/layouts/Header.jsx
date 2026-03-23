import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme, useMediaQuery, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Divider } from "@mui/material";
import {
  ShoppingCart,
  PriceCheck,
  Badge,
  Replay,
  History
} from "@mui/icons-material";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import HistoryIcon from "@mui/icons-material/History";

import Aadhaar from "../components/HeaderComponents/Aadhaar";
import RationCardSelection from "../components/HeaderComponents/RationCard";
import CashierCheckoutModal from "../components/HeaderComponents/CheckOut";
import SalesHistoryModal from "../components/HeaderComponents/SalesHistory";
import CheckPriceModal from "../components/HeaderComponents/CheckPrice";
import SaleReturnModal from "../components/HeaderComponents/SaleReturn"
export default function Header({ sidebarState, setCartOpen }) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
  const [openAadhaar, setOpenAadhaar] = useState(false);
  const [openRationCard, setOpenRationCard] = useState(false);
  const [openCheckOut, setopenCheckout] = useState(false);
  const [openSalesHistory, setopenSalesHistory] = useState(false);
  const [openCheckPrice, setopenCheckPrice] = useState(false);
  const [openSaleReturn, setopenSaleReturn] = useState(false);

  const open = Boolean(anchorEl);
  const actionsOpen = Boolean(actionsAnchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenAadhaar = () => setOpenAadhaar(true); // open modal
  const handleCloseAadhaar = () => setOpenAadhaar(false); // close modal
  const handleActionsOpen = (event) => { setActionsAnchorEl(event.currentTarget); };
  const handleActionsClose = () => { setActionsAnchorEl(null); };
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery("(max-width:1300px)");

  return (
    <Box
      sx={{
        height: "70px",
        width: "100%",
        backgroundColor: (theme) => theme.palette.background.paper,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        pl: sidebarState === "hidden" ? "70px" : "16px",
        transition: "0.25s ease",
      }}
    >


      {/* LEFT SIDE - Admin Dropdown */}
      <Box>
        <Button
          variant="outlined"
          onClick={handleOpenMenu}
          endIcon={<ArrowDropDownIcon />}
          sx={{
            textTransform: "none",
            fontWeight: "600",
            backgroundColor: (theme) => theme.palette.primary.main,
            color: "#fff",
            minWidth: "auto",
            px: { xs: 1.5, sm: 2 }
          }}
        >
          {/* Desktop Text */}
          <Box
            sx={{
              display: { xs: "none", sm: "inline" }
            }}
          >
            Admin User
          </Box>

          {/* Mobile Icon */}
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              alignItems: "center"
            }}
          >
            <AccountCircleIcon />
          </Box>

          {/* Badge */}
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 1,
              background: "#E53935",
              color: "#fff",
              borderRadius: "5px",
              fontSize: "12px",
              lineHeight: 1.5
            }}
          >
            admin
          </Box>
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          <MenuItem onClick={handleCloseMenu}>👤 Profile</MenuItem>
          <MenuItem onClick={handleCloseMenu}>🔐 Change Password</MenuItem>
          <MenuItem onClick={handleCloseMenu}>⚙️ Settings</MenuItem>
          <MenuItem divider />
          <MenuItem onClick={handleCloseMenu} sx={{ color: "red" }}>
            🚪 Logout
          </MenuItem>
        </Menu>
      </Box>

      {/* RIGHT SIDE BUTTON GROUP */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {/* <Tooltip title="Check Out">
  <Button variant="outlined" size="small" onClick={() => setopenCheckout(true)}
    sx={{
      minWidth: isMobile ? 40 : "auto",
      px: isMobile ? 0 : 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <ShoppingCartCheckoutIcon />
        </Button>
</Tooltip>

 {/* <Tooltip title="Check Price">
    <Button variant="outlined" size="small" onClick={() => setopenCheckPrice(true)} 
      sx={{
        minWidth: isMobile ? 40 : "auto",
        px: isMobile ? 0 : 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
     <PriceCheckIcon />
    </Button>
  </Tooltip>

  <Tooltip title="Enter Aadhaar">
    <Button variant="outlined" size="small" onClick={handleOpenAadhaar}
      sx={{
        minWidth: isMobile ? 40 : "auto",
        px: isMobile ? 0 : 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FingerprintIcon />
    </Button>
  </Tooltip>

  <Tooltip title="Sale Return">
    <Button variant="outlined" size="small" onClick={() => navigate("/salereturn")}
      sx={{
        minWidth: isMobile ? 40 : "auto",
        px: isMobile ? 0 : 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
     <AssignmentReturnIcon />
    </Button>
  </Tooltip>

  <Tooltip title="Sales History">
    <Button  variant="outlined" size="small" onClick={() => setopenSalesHistory(true)}
      sx={{
        minWidth: isMobile ? 40 : "auto",
        px: isMobile ? 0 : 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <HistoryIcon />
    </Button>
  </Tooltip>

 
  {/* <Button
        variant="outlined"
        size="small"
        startIcon={<CreditCardIcon />}
        onClick={() => setOpenRationCard(true)}
      >
        Ration Card
      </Button>
 */}

        {/* <Button variant="outlined"  size="small" startIcon={<LocalOfferIcon />}>
          Offers
        </Button> */}
        {/* <Button variant="outlined" size="small" startIcon={<HistoryIcon />} onClick={() => navigate("/salereturn")}>
          Sale Return
        </Button>  */}
        {/* <ListItemButton to="/salereturn" variant="outlined" startIcon={<HistoryIcon />}>
          <ListItemText primary="Sale Return" />
        </ListItemButton> */}
        {/* <Button variant="outlined"  size="small" onClick={() => setopenSalesHistory(true)} startIcon={<HistoryIcon />}>
          Sales History
        </Button> */}
        {isMobile ? (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={handleActionsOpen}
              sx={{
                color: isDark ? "#fff" : "#415a77",
                borderColor: isDark ? "#fff" : "#415a77"

              }}
            >
              Actions
            </Button>

            <Menu
              anchorEl={actionsAnchorEl}
              open={actionsOpen}
              onClose={handleActionsClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1.5,
                  borderRadius: 3,
                  minWidth: 230,
                  backgroundColor: (theme) => theme.palette.background.paper,
                  borderColor: isDark ? "#fff" : "#415a77",
                  boxShadow: "0 12px 30px rgba(65, 90, 119, 0.12)",
                  overflow: "hidden",
                },
              }}
            >
              <Divider />

              {[
                { label: "Check Out", icon: <ShoppingCart fontSize="small" />, action: () => setopenCheckout(true) },
                { label: "Check Price", icon: <PriceCheck fontSize="small" />, action: () => setopenCheckPrice(true) },
                { label: "Enter Aadhaar", icon: <Badge fontSize="small" />, action: handleOpenAadhaar },
                { label: "Sale Return", icon: <Replay fontSize="small" />, action: () => navigate("/salereturn") },
                { label: "Sales History", icon: <History fontSize="small" />, action: () => setopenSalesHistory(true) },
              ].map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    item.action();
                    handleActionsClose();
                  }}
                  sx={{
                    mx: 1.5,
                    my: 1.5,
                    borderRadius: 2,
                    px: 2,
                    py: 1.2,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: isDark ? "#fff" : "#415a77",
                    border: isDark ? " 1px solid #fff" : "1px solid #415a77",
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    position: "relative",
                    transition: "all 0.2s ease",

                    "&:hover": {
                      backgroundColor: "#f4f7fb",
                    },

                    "&:hover::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 6,
                      bottom: 6,
                      width: "3px",
                      borderRadius: "4px",
                      backgroundColor: "#415A77",
                    },
                  }}
                >
                  {item.icon}
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
            {isMobile && (
              <IconButton onClick={() => setCartOpen(prev => !prev)}>
                <ShoppingCartIcon sx={{
                  color: isDark ? "#fff" : "#415a77",

                }} />
              </IconButton>

            )}
          </>
        ) : (

          <>
            {/* Desktop Buttons */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setopenCheckout(true)}
              startIcon={<ShoppingCartCheckoutIcon />}
              sx={{
                color: "#fff",
                backgroundColor: "#415a77",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#415a77",
                  color: "#fff",

                }
              }}
            >
              Check Out
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setopenCheckPrice(true)}
              startIcon={<HistoryIcon />}
              sx={{
                color: "#fff",
                backgroundColor: "#415a77",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#415a77",
                  color: "#fff",

                }
              }}
            >
              Check Price
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<FingerprintIcon />}
              onClick={handleOpenAadhaar}
              sx={{
                color: "#fff",
                backgroundColor: "#415a77",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#415a77",
                  color: "#fff",

                }
              }}
            >
              Enter Aadhaar
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon />}
              onClick={() => navigate("/salereturn")}
              sx={{
                color: "#fff",
                backgroundColor: "#415a77",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#415a77",
                  color: "#fff",

                }
              }}
            >
              Sale Return
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setopenSalesHistory(true)}
              startIcon={<HistoryIcon />}
              sx={{
                color: "#fff",
                backgroundColor: "#415a77",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#415a77",
                  color: "#fff",

                }
              }}

            >
              Sales History
            </Button>
          </>
        )}

      </Box>
      <Aadhaar open={openAadhaar} onClose={handleCloseAadhaar} />

      <RationCardSelection
        open={openRationCard}
        onClose={() => setOpenRationCard(false)}
      />
      <CashierCheckoutModal
        open={openCheckOut}
        onClose={() => setopenCheckout(false)}
      />

      <SalesHistoryModal
        open={openSalesHistory}
        onClose={() => setopenSalesHistory(false)}
      />
      <CheckPriceModal
        open={openCheckPrice}
        onClose={() => setopenCheckPrice(false)}
      />
      <SaleReturnModal
        open={openSaleReturn}
        onClose={() => setopenSaleReturn(false)}
      />

    </Box>
  );
}
