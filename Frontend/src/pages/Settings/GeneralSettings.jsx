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
  Avatar,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";

export default function GeneralSettings({ settings, onSave, loading }) {
  const [formData, setFormData] = useState({
    project_name: "",
    contact_number: "",
    address: "",
    gst_number: "",
    logo_url: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData({
        project_name: settings.project_name || "",
        contact_number: settings.contact_number || "",
        address: settings.address || "",
        gst_number: settings.gst_number || "",
        logo_url: settings.logo_url || "",
      });
      setLogoPreview(settings.logo_url || "");
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo size should be less than 2MB");
        setTimeout(() => setError(""), 3000);
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      // If logo file is selected, upload it first
      if (logoFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('logo', logoFile);

        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL;

        const uploadResponse = await fetch(`${apiUrl}/settings/uploadLogo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.status) {
          // Update logo_url with the uploaded file path
          formData.logo_url = uploadResult.data.logo_url;
        } else {
          throw new Error(uploadResult.message || "Logo upload failed");
        }
      }

      await onSave(formData);
      setSuccess("General settings updated successfully!");
      setLogoFile(null);
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
            General Settings
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
                <TextField
                  fullWidth
                  label="Project Name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  placeholder="My POS System"
                  helperText="This will appear on thermal receipts"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  helperText="Contact number for receipts"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="123 Main Street, City, State, PIN"
                  helperText="Business address for receipts"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="GST Number"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                  helperText="GST registration number"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Empty grid for layout balance */}
              </Grid>

              {/* Logo Upload Section with Divider */}
              <Grid item xs={12}>
                <Box sx={{ borderTop: "1px solid #e0e0e0", pt: 3, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                    Business Logo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Upload your business logo (will appear on thermal receipts)
                  </Typography>

                  <Box sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 3,
                    flexDirection: { xs: "column", sm: "row" }
                  }}>
                    {/* Logo Preview */}
                    <Box sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1
                    }}>
                      <Avatar
                        src={logoPreview}
                        alt="Business Logo"
                        sx={{
                          width: 120,
                          height: 120,
                          border: "2px dashed #ccc",
                          backgroundColor: "#f5f5f5"
                        }}
                        variant="rounded"
                      />
                      {logoPreview && (
                        <Typography variant="caption" color="success.main">
                          Logo loaded
                        </Typography>
                      )}
                    </Box>

                    {/* Upload Button and Info */}
                    <Box sx={{ flex: 1 }}>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="logo-upload"
                        type="file"
                        onChange={handleLogoChange}
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          size="large"
                        >
                          Choose Logo
                        </Button>
                      </label>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          • Accepted formats: JPG, PNG, GIF
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          • Maximum file size: 2MB
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Recommended size: 300x300 pixels
                        </Typography>
                      </Box>

                      {logoFile && (
                        <Box sx={{
                          mt: 2,
                          p: 1.5,
                          backgroundColor: "#e8f5e9",
                          borderRadius: 1,
                          border: "1px solid #4caf50"
                        }}>
                          <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                            ✓ File selected: {logoFile.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Click "Save Changes" to upload
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Save Button at Bottom - Outside Grid */}
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
