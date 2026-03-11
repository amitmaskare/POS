import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

export default function PrintSettings({ settings, onSave, loading }) {
  const [formData, setFormData] = useState({
    thermal_printer_width: "80",
    print_header: true,
    print_footer: true,
    header_message: "",
    footer_message: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData({
        thermal_printer_width: settings.thermal_printer_width || "80",
        print_header: settings.print_header === "true" || settings.print_header === true,
        print_footer: settings.print_footer === "true" || settings.print_footer === true,
        header_message: settings.header_message || "",
        footer_message: settings.footer_message || "Thank you for your business!",
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      // Convert booleans to strings for storage
      const dataToSave = {
        thermal_printer_width: formData.thermal_printer_width,
        print_header: formData.print_header.toString(),
        print_footer: formData.print_footer.toString(),
        header_message: formData.header_message,
        footer_message: formData.footer_message,
      };

      await onSave(dataToSave);
      setSuccess("Print settings updated successfully!");
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
            Print Settings
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure thermal printer settings for receipt printing
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Thermal Printer Width (mm)</InputLabel>
                  <Select
                    name="thermal_printer_width"
                    value={formData.thermal_printer_width}
                    onChange={handleChange}
                    label="Thermal Printer Width (mm)"
                  >
                    <MenuItem value="58">58mm</MenuItem>
                    <MenuItem value="80">80mm (Standard)</MenuItem>
                    <MenuItem value="110">110mm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.print_header}
                      onChange={handleChange}
                      name="print_header"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Print Header
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Include business name, logo, and contact info in receipts
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              {formData.print_header && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Header Message"
                    name="header_message"
                    value={formData.header_message}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    placeholder="Welcome to our store!"
                    helperText="Optional message to display at the top of receipts (below shop name)"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.print_footer}
                      onChange={handleChange}
                      name="print_footer"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Print Footer
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Include thank you message and terms in receipts
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              {formData.print_footer && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Footer Message"
                    name="footer_message"
                    value={formData.footer_message}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Thank you for your business! Visit again!"
                    helperText="Message to display at the bottom of receipts"
                  />
                </Grid>
              )}
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
