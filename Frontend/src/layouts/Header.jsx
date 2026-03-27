import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme, useMediaQuery, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
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
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import HistoryIcon from "@mui/icons-material/History";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

import Aadhaar from "../components/HeaderComponents/Aadhaar";
import RationCardSelection from "../components/HeaderComponents/RationCard";
import CashierCheckoutModal from "../components/HeaderComponents/CheckOut";
import SalesHistoryModal from "../components/HeaderComponents/SalesHistory";
import CheckPriceModal from "../components/HeaderComponents/CheckPrice";
import SaleReturnModal from "../components/HeaderComponents/SaleReturn";
import CheckCustomerModal from "../components/HeaderComponents/CheckCustomer";
import { useCustomer } from "../context/CustomerContext";

export default function Header({ sidebarState, setCartOpen }) {
  const navigate = useNavigate();
  const { selectedCustomer, clearCustomer } = useCustomer();

  const [anchorEl, setAnchorEl] = useState(null);
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
  const [openAadhaar, setOpenAadhaar] = useState(false);
  const [openRationCard, setOpenRationCard] = useState(false);
  const [openCheckOut, setopenCheckout] = useState(false);
  const [openSalesHistory, setopenSalesHistory] = useState(false);
  const [openCheckPrice, setopenCheckPrice] = useState(false);
  const [openSaleReturn, setopenSaleReturn] = useState(false);
  const [openCheckCustomer, setOpenCheckCustomer] = useState(false);

  const open = Boolean(anchorEl);
  const actionsOpen = Boolean(actionsAnchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenAadhaar = () => setOpenAadhaar(true); // open modal
  const handleCloseAadhaar = () => setOpenAadhaar(false); // close modal
  const handleActionsOpen = (event) => { setActionsAnchorEl(event.currentTarget); };
  const handleActionsClose = () => { setActionsAnchorEl(null); };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
  sx={{
    height: "70px",
    width: "100%",
    backgroundColor: "#fff",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 2,
    pl: sidebarState === "hidden" ? "70px" : "16px", 
    transition: "0.25s ease",
  }}
>


      {/* LEFT SIDE - Admin Dropdown and Customer Info */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Button
          variant="outlined"
          onClick={handleOpenMenu}
          endIcon={<ArrowDropDownIcon />}
          sx={{
            textTransform: "none",
            fontWeight: "600",
            backgroundColor: "#415a77",
            color:"#fff"
          }}
        >
          Admin User{" "}
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 1,
              background: "#E53935",
              color: "#fff",
              borderRadius: "5px",
              fontSize: "12px",
            }}
          >
            admin
          </Box>
        </Button>

        {/* Selected Customer Display */}
        {selectedCustomer && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              backgroundColor: "#d4edda",
              border: "1px solid #28a745",
              borderRadius: "5px",
            }}
          >
            <AccountCircleIcon sx={{ color: "#28a745" }} />
            <Box>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#155724",
                }}
              >
                {selectedCustomer.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "#155724",
                }}
              >
                {selectedCustomer.phone}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={clearCustomer}
              sx={{
                ml: 1,
                color: "#155724",
                "&:hover": { backgroundColor: "#c3e6cb" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

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
                color:"#415a77",
                 border: "1px solid #415A77",
                
               }}
            >
              Actions
            </Button>

            <Menu
              anchorEl={actionsAnchorEl}
              open={actionsOpen}
              onClose={handleActionsClose}
              sx={{
                "& .MuiMenuItem-root": {
                  border: "1px solid #415A77",
                  borderRadius: "6px",
                  mx: 1,
                  my: 2,
                  transition: "all 0.2s ease",
            
                  "&:hover": {
                    backgroundColor: "#415A77",
                    color: "#ffffff"
                  }
                }
              }}
            >
              <MenuItem onClick={() => { setopenCheckout(true); handleActionsClose(); }} >
                Check Out
              </MenuItem>

              <MenuItem onClick={() => { setopenCheckPrice(true); handleActionsClose(); }}>
                Check Price
              </MenuItem>

              <MenuItem onClick={() => { handleOpenAadhaar(); handleActionsClose(); }}>
                Enter Aadhaar
              </MenuItem>

              <MenuItem onClick={() => { navigate("/salereturn"); handleActionsClose(); }}>
                Sale Return
              </MenuItem>

              <MenuItem onClick={() => { setopenSalesHistory(true); handleActionsClose(); }}>
                Sales History
              </MenuItem>

              <MenuItem onClick={() => { setOpenCheckCustomer(true); handleActionsClose(); }}>
                Check Customer
              </MenuItem>
            </Menu>
            {isMobile && (
              <IconButton onClick={() => setCartOpen(prev => !prev)}>
                <ShoppingCartIcon sx={{
       color:"#415a77"
       
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
                  borderColor: "#D32F2F"
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
                  borderColor: "#D32F2F"
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
              borderColor: "#D32F2F"
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
                  borderColor: "#D32F2F"
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
                  borderColor: "#D32F2F"
                }
              }}

            >
              Sales History
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenCheckCustomer(true)}
              startIcon={<PersonSearchIcon />}
              sx={{
                color: "#fff",
                backgroundColor: "#415a77",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#415a77",
                  color: "#fff",
                  borderColor: "#D32F2F"
                }
              }}
            >
              Check Customer
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
<CheckCustomerModal
  open={openCheckCustomer}
  onClose={() => setOpenCheckCustomer(false)}
/>

    </Box>
  );
}
