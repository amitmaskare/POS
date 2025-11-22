import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import HistoryIcon from "@mui/icons-material/History";

import Aadhaar from "../components/HeaderComponents/Aadhaar";
import RationCardSelection from "../components/HeaderComponents/RationCard";
import CashierCheckoutModal from "../components/HeaderComponents/CheckOut";
import SalesHistoryModal from "../components/HeaderComponents/SalesHistory";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAadhaar, setOpenAadhaar] = useState(false);
  const [openRationCard, setOpenRationCard] = useState(false);
  const [openCheckOut, setopenCheckout] = useState(false);
  const [openSalesHistory, setopenSalesHistory] = useState(false);

  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenAadhaar = () => setOpenAadhaar(true); // open modal
  const handleCloseAadhaar = () => setOpenAadhaar(false); // close modal

  
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
          }}
        >
          Admin User{" "}
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 1,
              background: "red",
              color: "#fff",
              borderRadius: "5px",
              fontSize: "12px",
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
        <Button variant="outlined" size="small" onClick={() => setopenCheckout(true)} startIcon={<ShoppingCartCheckoutIcon />}>
          Check Out
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


        <Button variant="outlined"  size="small" startIcon={<LocalOfferIcon />}>
          Offers
        </Button>

        <Button variant="outlined"  size="small" onClick={() => setopenSalesHistory(true)} startIcon={<HistoryIcon />}>
          Sales History
        </Button>
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

     <SalesHistoryModal open={openSalesHistory} onClose={setopenSalesHistory} />
    </Box>
  );
}
