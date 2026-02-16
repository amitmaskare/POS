import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import {
  CreditCard,
  UsbOutlined,
  CheckCircle,
  Cancel,
  Refresh
} from '@mui/icons-material';
import {
  scanPorts,
  connectDevice,
  disconnectDevice,
  getDeviceStatus,
  getConfig
} from '../../services/posService';

const POSSettings = () => {
  const [loading, setLoading] = useState(false);
  const [ports, setPorts] = useState([]);
  const [deviceType, setDeviceType] = useState('generic');
  const [selectedPort, setSelectedPort] = useState('');
  const [baudRate, setBaudRate] = useState(9600);
  const [terminalId, setTerminalId] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Device type options
  const deviceTypes = [
    { value: 'generic', label: 'Generic Serial POS', baudRate: 9600 },
    { value: 'pinelabs', label: 'Pine Labs Plutus', baudRate: 9600 },
    { value: 'ingenico', label: 'Ingenico Terminal', baudRate: 19200 },
    { value: 'verifone', label: 'Verifone Terminal', baudRate: 115200 },
    { value: 'pax', label: 'PAX Terminal', baudRate: 115200 },
  ];

  // Load device status on mount
  useEffect(() => {
    checkDeviceStatus();
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const result = await getConfig();
      if (result.success && result.data) {
        setDeviceType(result.data.device_type);
        setSelectedPort(result.data.port);
        setBaudRate(result.data.baud_rate);
        setTerminalId(result.data.terminal_id || '');
        setMerchantId(result.data.merchant_id || '');
      }
    } catch (err) {
      // Config might not exist yet
    }
  };

  const checkDeviceStatus = async () => {
    try {
      const result = await getDeviceStatus();
      if (result.success && result.data.connected) {
        setConnected(true);
        setDeviceStatus(result.data);
      } else {
        setConnected(false);
        setDeviceStatus(null);
      }
    } catch (err) {
      setConnected(false);
    }
  };

  const handleScanPorts = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await scanPorts();
      if (result.success) {
        setPorts(result.data);
        if (result.data.length === 0) {
          setError('No serial ports found. Please connect your POS device and try again.');
        } else {
          setSuccess(`Found ${result.data.length} available port(s)`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan ports');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedPort) {
      setError('Please select a port');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await connectDevice({
        deviceType,
        port: selectedPort,
        baudRate,
        terminalId,
        merchantId
      });

      if (result.success) {
        setSuccess('POS device connected successfully!');
        setConnected(true);
        await checkDeviceStatus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to device');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await disconnectDevice();
      if (result.success) {
        setSuccess('POS device disconnected');
        setConnected(false);
        setDeviceStatus(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disconnect device');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceTypeChange = (e) => {
    const type = e.target.value;
    setDeviceType(type);

    // Set recommended baud rate for device type
    const device = deviceTypes.find(d => d.value === type);
    if (device) {
      setBaudRate(device.baudRate);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
        POS Device Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Connect your physical card payment terminal to accept card payments through your POS system
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Device Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {connected ? (
              <>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    Connected
                  </Typography>
                  {deviceStatus && (
                    <Typography variant="body2" color="text.secondary">
                      {deviceStatus.deviceInfo?.type} on {deviceStatus.deviceInfo?.port}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDisconnect}
                    disabled={loading}
                  >
                    Disconnect
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Cancel color="error" sx={{ fontSize: 40 }} />
                <Typography variant="body1" color="error">
                  Not Connected
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Connection Settings */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Configuration
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* Scan Ports - Prominent Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UsbOutlined />}
                onClick={handleScanPorts}
                disabled={loading || connected}
                fullWidth
                sx={{
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 5,
                  }
                }}
              >
                {loading ? 'Scanning...' : 'Scan for POS Devices'}
              </Button>
              {ports.length > 0 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="600">
                    Found {ports.length} available port(s)
                  </Typography>
                  <Typography variant="caption">
                    Select your device type and port below, then click "Connect Machine"
                  </Typography>
                </Alert>
              )}
            </Grid>

            {/* Device Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={connected}>
                <InputLabel>Device Type</InputLabel>
                <Select
                  value={deviceType}
                  label="Device Type"
                  onChange={handleDeviceTypeChange}
                >
                  {deviceTypes.map(device => (
                    <MenuItem key={device.value} value={device.value}>
                      {device.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Port Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={connected || ports.length === 0}>
                <InputLabel>Serial Port</InputLabel>
                <Select
                  value={selectedPort}
                  label="Serial Port"
                  onChange={(e) => setSelectedPort(e.target.value)}
                >
                  {ports.map((port, index) => (
                    <MenuItem key={index} value={port.path}>
                      {port.path}
                      {port.manufacturer && ` (${port.manufacturer})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Baud Rate */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Baud Rate"
                type="number"
                value={baudRate}
                onChange={(e) => setBaudRate(parseInt(e.target.value))}
                disabled={connected}
              />
            </Grid>

            {/* Terminal ID */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Terminal ID (Optional)"
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                disabled={connected}
              />
            </Grid>

            {/* Merchant ID */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Merchant ID (Optional)"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                disabled={connected}
              />
            </Grid>

            {/* Connect Machine Button - Prominent */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="success"
                onClick={handleConnect}
                disabled={loading || connected || !selectedPort}
                fullWidth
                size="large"
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CreditCard />}
                sx={{
                  py: 2.5,
                  fontSize: '18px',
                  fontWeight: 700,
                  boxShadow: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  '&:hover': {
                    boxShadow: 6,
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                  }
                }}
              >
                {loading ? 'Connecting...' : '🔌 Connect Machine'}
              </Button>
              {!selectedPort && ports.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Please scan for devices first
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Help Text */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="info.main" gutterBottom>
              💡 Quick Setup Guide
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Connect your POS terminal via USB/Serial cable<br />
              2. Click "Scan for POS Devices" to detect available ports<br />
              3. Select your device type and port<br />
              4. Click "Connect to POS Device"<br />
              5. Start accepting card payments!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default POSSettings;
