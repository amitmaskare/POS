import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

export default function MenuSettings({ settings, onSave, loading }) {
  const [formData, setFormData] = useState({
    enable_sales_return: false,
    enable_discounts: false,
    enable_multiple_payment: false,
    enable_stock_alerts: false,
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData({
        enable_sales_return: settings.enable_sales_return === "true" || settings.enable_sales_return === true,
        enable_discounts: settings.enable_discounts === "true" || settings.enable_discounts === true,
        enable_multiple_payment: settings.enable_multiple_payment === "true" || settings.enable_multiple_payment === true,
        enable_stock_alerts: settings.enable_stock_alerts === "true" || settings.enable_stock_alerts === true,
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      // Convert booleans to strings for storage
      const dataToSave = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = value.toString();
        return acc;
      }, {});

      await onSave(dataToSave);
      setSuccess("Menu settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update settings");
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Menu Settings
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enable or disable various features in your POS system
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enable_sales_return}
                      onChange={handleChange}
                      name="enable_sales_return"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Enable Sales Return
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Allow customers to return products and process refunds
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enable_discounts}
                      onChange={handleChange}
                      name="enable_discounts"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Enable Discounts
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Allow applying discounts to products and sales
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enable_multiple_payment}
                      onChange={handleChange}
                      name="enable_multiple_payment"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Enable Multiple Payment Methods
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Allow split payments using multiple payment methods
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enable_stock_alerts}
                      onChange={handleChange}
                      name="enable_stock_alerts"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Enable Stock Alerts
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Get notifications when product stock is low
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

            </Grid>

            {/* Save Button at Bottom */}
            <Box sx={{
              borderTop: "1px solid #e0e0e0",
              pt: 3,
              mt: 4,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2
            }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  minWidth: 160,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
