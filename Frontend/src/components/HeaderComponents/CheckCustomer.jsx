import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { customerList } from "../../services/customerService";
import { useCustomer } from "../../context/CustomerContext";

export default function CheckCustomerModal({ open, onClose }) {
  const { selectCustomer } = useCustomer();
  const [tabValue, setTabValue] = useState(0);
  const [mobileNo, setMobileNo] = useState("");
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setCustomerData(null);
    setError("");
    setMobileNo("");
    setAadhaarNo("");
  };

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setCustomerData(null);

    try {
      const result = await customerList();

      if (result.status === true && result.data) {
        let foundCustomer = null;

        if (tabValue === 0) {
          // Search by Mobile Number
          if (!mobileNo.trim()) {
            setError("Please enter a mobile number");
            setLoading(false);
            return;
          }
          // Convert both to string for comparison (phone is stored as bigint)
          foundCustomer = result.data.find(
            (customer) => String(customer.phone) === String(mobileNo.trim())
          );
        } else {
          // Search by Aadhaar Number
          if (!aadhaarNo.trim()) {
            setError("Please enter an Aadhaar number");
            setLoading(false);
            return;
          }
          // Aadhaar is stored as string, so direct comparison works
          foundCustomer = result.data.find(
            (customer) => customer.aadhaar_no === aadhaarNo.trim()
          );
        }

        if (foundCustomer) {
          setCustomerData(foundCustomer);
          // Select customer but keep modal open to show Create Order button
          selectCustomer(foundCustomer);
        } else {
          setError("Customer not found");
        }
      } else {
        setError("Failed to fetch customer data");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMobileNo("");
    setAadhaarNo("");
    setCustomerData(null);
    setError("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCreateOrder = () => {
    // Just close modal - customer is already selected
    // User can now add products to cart on dashboard
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        background: "#f8fafc",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        mt: 8,
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: 20,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} color="#415a77">
          <PersonSearchIcon />
          Check Customer
        </Box>

        <IconButton
          onClick={handleClose}
          sx={{ "&:hover": { background: "transparent" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent sx={{ p: 3 }}>
        {/* Tabs for Mobile/Aadhaar */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: 14,
              },
              "& .Mui-selected": {
                color: "#415a77",
              },
            }}
          >
            <Tab
              label="Search by Mobile"
              icon={<PhoneIcon />}
              iconPosition="start"
            />
            <Tab
              label="Search by Aadhaar"
              icon={<BadgeIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Search Input */}
        <Box sx={{ mb: 3 }}>
          {tabValue === 0 ? (
            <TextField
              fullWidth
              label="Mobile Number"
              variant="outlined"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              placeholder="Enter mobile number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: "#415a77" }} />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          ) : (
            <TextField
              fullWidth
              label="Aadhaar Number"
              variant="outlined"
              value={aadhaarNo}
              onChange={(e) => setAadhaarNo(e.target.value)}
              placeholder="Enter Aadhaar number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: "#415a77" }} />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSearch}
            disabled={loading}
            sx={{
              backgroundColor: "#415a77",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#334863",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleReset}
            sx={{
              color: "#415a77",
              borderColor: "#415a77",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                borderColor: "#334863",
                backgroundColor: "transparent",
              },
            }}
          >
            Reset
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: 2,
              color: "#c33",
              textAlign: "center",
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        {/* Customer Details */}
        {customerData && (
          <Paper
            sx={{
              p: 3,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              background: "#fff",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#415a77",
                fontWeight: 600,
                mb: 2,
                pb: 2,
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              Customer Details
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  Name:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {customerData.name || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  Mobile:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {customerData.phone || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  Email:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {customerData.email || "N/A"}
                </Typography>
              </Box>

              {customerData.aadhaar_no && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontWeight: 500 }}
                  >
                    Aadhaar:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {customerData.aadhaar_no}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  Address:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}
                >
                  {customerData.address || "N/A"}
                </Typography>
              </Box>
            </Box>

            {/* Create Order Button */}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCreateOrder}
                startIcon={<ShoppingCartIcon />}
                sx={{
                  backgroundColor: "#4caf50",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#45a049",
                  },
                }}
              >
                Create Order
              </Button>
            </Box>
          </Paper>
        )}

        {/* No Data Found - Initial State */}
        {!customerData && !error && !loading && (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            Enter {tabValue === 0 ? "mobile number" : "Aadhaar number"} and
            click search
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
