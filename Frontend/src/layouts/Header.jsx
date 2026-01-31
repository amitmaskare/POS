import React, { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import HistoryIcon from "@mui/icons-material/History";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Aadhaar from "../components/HeaderComponents/Aadhaar";
import RationCardSelection from "../components/HeaderComponents/RationCard";
import CashierCheckoutModal from "../components/HeaderComponents/CheckOut";
import SalesHistoryModal from "../components/HeaderComponents/SalesHistory";
import CheckPriceModal from "../components/HeaderComponents/CheckPrice";
import SaleReturnModal from "../components/HeaderComponents/SaleReturn"
export default function Header({ sidebarState }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [openAadhaar, setOpenAadhaar] = useState(false);
  const [openRationCard, setOpenRationCard] = useState(false);
  const [openCheckOut, setopenCheckout] = useState(false);
  const [openSalesHistory, setopenSalesHistory] = useState(false);
  const [openCheckPrice, setopenCheckPrice] = useState(false);
  const [openSaleReturn, setopenSaleReturn] = useState(false);

  const open = Boolean(anchorEl);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenMobileMenu = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleCloseMobileMenu = () => setMobileMenuAnchor(null);
  const handleOpenAadhaar = () => {
    setOpenAadhaar(true);
    handleCloseMobileMenu();
  };
  const handleCloseAadhaar = () => setOpenAadhaar(false);

 

  return (
    <Box
      sx={{
        height: { xs: "60px", sm: "70px" },
        width: "100%",
        backgroundColor: "#fff",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 1, sm: 2 },
        pl: sidebarState === "hidden" && !isMobile ? "70px" : { xs: 1, sm: 2 },
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
            backgroundColor: "#f8f9fa",
            fontSize: { xs: "12px", sm: "14px" },
            px: { xs: 1, sm: 2 },
            minWidth: { xs: "auto", sm: "auto" },
          }}
        >
          {isSmallMobile ? "Admin" : "Admin User"}
          <Box
            component="span"
            sx={{
              ml: { xs: 0.5, sm: 1 },
              px: { xs: 0.5, sm: 1 },
              background: "red",
              color: "#fff",
              borderRadius: "5px",
              fontSize: { xs: "10px", sm: "12px" },
            }}
          >
            admin
          </Box>
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          <MenuItem onClick={handleCloseMenu}>Profile</MenuItem>
          <MenuItem onClick={handleCloseMenu}>Change Password</MenuItem>
          <MenuItem onClick={handleCloseMenu}>Settings</MenuItem>
          <MenuItem onClick={handleCloseMenu} sx={{ color: "red" }}>
            Logout
          </MenuItem>
        </Menu>
      </Box>

      {/* RIGHT SIDE BUTTON GROUP */}
      {!isMobile ? (
        // Desktop: Show all buttons
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setopenCheckout(true)}
            startIcon={<ShoppingCartCheckoutIcon />}
          >
            Check Out
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => setopenCheckPrice(true)}
            startIcon={<HistoryIcon />}
          >
            Check Price
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<FingerprintIcon />}
            onClick={handleOpenAadhaar}
          >
            Enter Aadhaar
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<CreditCardIcon />}
            onClick={() => setOpenRationCard(true)}
          >
            Ration Card
          </Button>

          <Button variant="outlined" size="small" startIcon={<LocalOfferIcon />}>
            Offers
          </Button>
        </Box>
      ) : (
        // Mobile: Show menu button
        <Box>
          <IconButton
            onClick={handleOpenMobileMenu}
            sx={{
              color: "#5A8DEE",
              border: "1px solid rgba(90, 141, 238, 0.5)",
            }}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={mobileMenuAnchor}
            open={mobileMenuOpen}
            onClose={handleCloseMobileMenu}
            slotProps={{
              paper: {
                sx: {
                  minWidth: "200px",
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setopenCheckout(true);
                handleCloseMobileMenu();
              }}
            >
              <ListItemIcon>
                <ShoppingCartCheckoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Check Out</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => {
                setopenCheckPrice(true);
                handleCloseMobileMenu();
              }}
            >
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Check Price</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleOpenAadhaar}>
              <ListItemIcon>
                <FingerprintIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Enter Aadhaar</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => {
                setOpenRationCard(true);
                handleCloseMobileMenu();
              }}
            >
              <ListItemIcon>
                <CreditCardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ration Card</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleCloseMobileMenu}>
              <ListItemIcon>
                <LocalOfferIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Offers</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      )}
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
