import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import PrintIcon from "@mui/icons-material/Print";
import SystemIcon from "@mui/icons-material/Tune";
import Title from "../../components/MainContentComponents/Title";
import GeneralSettings from "./GeneralSettings";
import MenuSettings from "./MenuSettings";
import PrintSettings from "./PrintSettings";
import SystemSettings from "./SystemSettings";
import { getAllSettings, bulkUpdateSettings } from "../../services/settingsService";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setError("");
      const result = await getAllSettings();

      if (result.status === true) {
        setSettings(result.data);
      } else {
        setError(result.message || "Failed to fetch settings");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSave = async (updatedSettings) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await bulkUpdateSettings(updatedSettings);

      if (result.status === true) {
        setSuccess(result.message || "Settings updated successfully!");
        // Refresh settings
        await fetchSettings();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error(result.message || "Failed to update settings");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Title icon={<SettingsIcon />} title="Manage Settings" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="settings tabs"
          >
            <Tab
              icon={<SettingsIcon />}
              iconPosition="start"
              label="General"
              sx={{ textTransform: "none", fontSize: "1rem" }}
            />
            <Tab
              icon={<MenuIcon />}
              iconPosition="start"
              label="Menu"
              sx={{ textTransform: "none", fontSize: "1rem" }}
            />
            <Tab
              icon={<PrintIcon />}
              iconPosition="start"
              label="Print"
              sx={{ textTransform: "none", fontSize: "1rem" }}
            />
            <Tab
              icon={<SystemIcon />}
              iconPosition="start"
              label="System"
              sx={{ textTransform: "none", fontSize: "1rem" }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <GeneralSettings
            settings={settings}
            onSave={handleSave}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <MenuSettings
            settings={settings}
            onSave={handleSave}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <PrintSettings
            settings={settings}
            onSave={handleSave}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <SystemSettings
            settings={settings}
            onSave={handleSave}
            loading={loading}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
}
