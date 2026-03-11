/**
 * Device ID Test Component
 *
 * This component helps you test the cross-platform device ID retrieval
 * Use this to verify your Electron integration is working correctly
 *
 * Usage:
 * 1. Import this component into your app
 * 2. Add it to a test route or page
 * 3. Click "Get Device ID" to test retrieval
 * 4. Verify the device ID format matches your platform
 */

import React, { useState } from 'react';
import { getDeviceId, getPlatformDeviceId, DEVICE_ID_TYPES } from './utils/deviceUtils';

function DeviceIdTest() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testDeviceId = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get full device info
      const info = await getPlatformDeviceId();
      setDeviceInfo(info);
      console.log('Device Info:', info);
    } catch (err) {
      setError(err.message);
      console.error('Error getting device ID:', err);
    } finally {
      setLoading(false);
    }
  };

  const testSimpleDeviceId = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get simple device ID (just the ID string)
      const deviceId = await getDeviceId();
      setDeviceInfo({
        deviceId,
        deviceType: 'Unknown',
        platform: 'Using simple getDeviceId()'
      });
      console.log('Device ID:', deviceId);
    } catch (err) {
      setError(err.message);
      console.error('Error getting device ID:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceTypeDescription = (deviceType) => {
    switch (deviceType) {
      case DEVICE_ID_TYPES.WINDOWS_GUID:
        return 'Windows Machine GUID (from Registry)';
      case DEVICE_ID_TYPES.MAC_ADDRESS:
        return 'MAC Address (from Network Interface)';
      case DEVICE_ID_TYPES.LINUX_MACHINE_ID:
        return 'Linux Machine ID (from /etc/machine-id)';
      case DEVICE_ID_TYPES.BROWSER_FINGERPRINT:
        return 'Browser Fingerprint (SHA-256 hash)';
      default:
        return 'Unknown';
    }
  };

  const getExpectedFormat = (deviceType) => {
    switch (deviceType) {
      case DEVICE_ID_TYPES.WINDOWS_GUID:
        return 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (36 chars)';
      case DEVICE_ID_TYPES.MAC_ADDRESS:
        return 'XX:XX:XX:XX:XX:XX (17 chars)';
      case DEVICE_ID_TYPES.LINUX_MACHINE_ID:
        return '32 hexadecimal characters';
      case DEVICE_ID_TYPES.BROWSER_FINGERPRINT:
        return '64+ hexadecimal characters (SHA-256)';
      default:
        return 'Unknown';
    }
  };

  const copyToClipboard = () => {
    if (deviceInfo?.deviceId) {
      navigator.clipboard.writeText(deviceInfo.deviceId);
      alert('Device ID copied to clipboard!');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Device ID Test</h1>
      <p style={styles.description}>
        Test cross-platform device ID retrieval for your POS system
      </p>

      <div style={styles.buttonGroup}>
        <button
          onClick={testDeviceId}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Loading...' : 'Get Device ID (Full Info)'}
        </button>

        <button
          onClick={testSimpleDeviceId}
          disabled={loading}
          style={styles.buttonSecondary}
        >
          {loading ? 'Loading...' : 'Get Device ID (Simple)'}
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <h3>Error:</h3>
          <p>{error}</p>
          <p style={styles.errorHint}>
            Make sure Electron IPC handlers are registered in your main process.
            See DEVICE_ID_INTEGRATION_GUIDE.md for setup instructions.
          </p>
        </div>
      )}

      {deviceInfo && !error && (
        <div style={styles.result}>
          <h2 style={styles.resultTitle}>Device Information</h2>

          <div style={styles.infoSection}>
            <div style={styles.infoRow}>
              <strong>Platform:</strong>
              <span>{deviceInfo.platform || 'Web Browser'}</span>
            </div>

            <div style={styles.infoRow}>
              <strong>Device ID Type:</strong>
              <span>{deviceInfo.deviceType}</span>
            </div>

            <div style={styles.infoRow}>
              <strong>Description:</strong>
              <span>{getDeviceTypeDescription(deviceInfo.deviceType)}</span>
            </div>

            <div style={styles.infoRow}>
              <strong>Expected Format:</strong>
              <span>{getExpectedFormat(deviceInfo.deviceType)}</span>
            </div>
          </div>

          <div style={styles.deviceIdSection}>
            <h3 style={styles.deviceIdTitle}>Device ID:</h3>
            <div style={styles.deviceIdBox}>
              <code style={styles.deviceIdCode}>{deviceInfo.deviceId}</code>
              <button onClick={copyToClipboard} style={styles.copyButton}>
                Copy
              </button>
            </div>
            <p style={styles.deviceIdLength}>
              Length: {deviceInfo.deviceId?.length || 0} characters
            </p>
          </div>

          <div style={styles.validationSection}>
            <h3 style={styles.validationTitle}>Validation:</h3>
            <ul style={styles.validationList}>
              <li style={styles.validationItem}>
                {deviceInfo.deviceId ? '✅' : '❌'} Device ID retrieved
              </li>
              <li style={styles.validationItem}>
                {deviceInfo.deviceType !== 'Unknown' ? '✅' : '❌'} Device type detected
              </li>
              <li style={styles.validationItem}>
                {deviceInfo.platform ? '✅' : '⚠️'} Platform identified
                {!deviceInfo.platform && ' (Fallback to browser)'}
              </li>
              <li style={styles.validationItem}>
                {deviceInfo.deviceType === DEVICE_ID_TYPES.BROWSER_FINGERPRINT
                  ? '⚠️ Using browser fingerprint (Electron not detected)'
                  : '✅ Using hardware-based device ID'}
              </li>
            </ul>
          </div>

          {deviceInfo.deviceType === DEVICE_ID_TYPES.BROWSER_FINGERPRINT && (
            <div style={styles.warning}>
              <h4>⚠️ Browser Fingerprint Detected</h4>
              <p>
                You are using browser fingerprinting instead of a hardware-based device ID.
                This is normal for web browsers, but if you're running an Electron app,
                make sure the IPC handlers are registered correctly.
              </p>
              <p>
                See <strong>DEVICE_ID_INTEGRATION_GUIDE.md</strong> for setup instructions.
              </p>
            </div>
          )}
        </div>
      )}

      <div style={styles.instructions}>
        <h3>Expected Results by Platform:</h3>
        <ul>
          <li><strong>Windows Electron:</strong> Device Type = WIN_GUID</li>
          <li><strong>macOS Electron:</strong> Device Type = MAC</li>
          <li><strong>Linux Electron:</strong> Device Type = LINUX_ID or MAC (fallback)</li>
          <li><strong>Web Browser:</strong> Device Type = BROWSER</li>
        </ul>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    fontSize: '28px',
    marginBottom: '10px',
    color: '#333'
  },
  description: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px'
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonSecondary: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  error: {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '20px',
    color: '#721c24'
  },
  errorHint: {
    fontSize: '14px',
    marginTop: '10px',
    fontStyle: 'italic'
  },
  result: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  resultTitle: {
    fontSize: '22px',
    marginBottom: '15px',
    color: '#333'
  },
  infoSection: {
    marginBottom: '20px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '14px'
  },
  deviceIdSection: {
    marginBottom: '20px'
  },
  deviceIdTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#333'
  },
  deviceIdBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '5px'
  },
  deviceIdCode: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#333',
    wordBreak: 'break-all'
  },
  copyButton: {
    padding: '5px 15px',
    fontSize: '14px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  deviceIdLength: {
    fontSize: '12px',
    color: '#6c757d',
    fontStyle: 'italic'
  },
  validationSection: {
    marginBottom: '20px'
  },
  validationTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#333'
  },
  validationList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  validationItem: {
    padding: '5px 0',
    fontSize: '14px'
  },
  warning: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeeba',
    borderRadius: '4px',
    padding: '15px',
    color: '#856404'
  },
  instructions: {
    backgroundColor: '#e7f3ff',
    border: '1px solid #b8daff',
    borderRadius: '4px',
    padding: '15px',
    fontSize: '14px'
  }
};

export default DeviceIdTest;
