/**
 * Electron Main Process - Device ID Handler
 *
 * Platform-specific device ID retrieval for:
 * - Windows: Machine GUID
 * - macOS: MAC Address
 * - Linux: Machine ID
 *
 * Add these IPC handlers to your Electron main.js file
 */

const { ipcMain } = require('electron');
const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Device ID Types
 */
const DEVICE_ID_TYPES = {
  MAC_ADDRESS: 'MAC',
  WINDOWS_GUID: 'WIN_GUID',
  LINUX_MACHINE_ID: 'LINUX_ID'
};

/**
 * Get MAC Address from network interfaces
 * Works on all platforms
 */
function getMacAddress() {
  try {
    const networkInterfaces = os.networkInterfaces();

    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];

      for (const iface of interfaces) {
        // Skip internal (loopback) and invalid MAC addresses
        if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
          return iface.mac.toUpperCase();
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting MAC address:', error);
    return null;
  }
}

/**
 * Get Windows Machine GUID
 * Reads from Windows Registry
 */
function getWindowsMachineGuid() {
  try {
    // Try to read MachineGuid from registry
    const command = 'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid';
    const output = execSync(command, { encoding: 'utf8' });

    // Parse the output to extract GUID
    const match = output.match(/MachineGuid\s+REG_SZ\s+([A-Fa-f0-9-]+)/);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }

    return null;
  } catch (error) {
    console.error('Error getting Windows Machine GUID:', error);
    return null;
  }
}

/**
 * Get Linux Machine ID
 * Reads from /etc/machine-id or /var/lib/dbus/machine-id
 */
function getLinuxMachineId() {
  try {
    // Try /etc/machine-id first (systemd)
    if (fs.existsSync('/etc/machine-id')) {
      const machineId = fs.readFileSync('/etc/machine-id', 'utf8').trim();
      if (machineId) {
        return machineId.toLowerCase();
      }
    }

    // Try /var/lib/dbus/machine-id as fallback
    if (fs.existsSync('/var/lib/dbus/machine-id')) {
      const machineId = fs.readFileSync('/var/lib/dbus/machine-id', 'utf8').trim();
      if (machineId) {
        return machineId.toLowerCase();
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting Linux Machine ID:', error);
    return null;
  }
}

/**
 * Get platform-specific device ID
 * Returns the most appropriate device ID for the current platform
 */
function getPlatformDeviceId() {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      // Windows: Try Machine GUID first, fallback to MAC
      const machineGuid = getWindowsMachineGuid();
      if (machineGuid) {
        return {
          deviceId: machineGuid,
          deviceType: DEVICE_ID_TYPES.WINDOWS_GUID,
          platform: 'Windows'
        };
      }

      // Fallback to MAC address
      const macAddress = getMacAddress();
      if (macAddress) {
        return {
          deviceId: macAddress,
          deviceType: DEVICE_ID_TYPES.MAC_ADDRESS,
          platform: 'Windows (MAC fallback)'
        };
      }

    } else if (platform === 'darwin') {
      // macOS: Use MAC Address
      const macAddress = getMacAddress();
      if (macAddress) {
        return {
          deviceId: macAddress,
          deviceType: DEVICE_ID_TYPES.MAC_ADDRESS,
          platform: 'macOS'
        };
      }

    } else if (platform === 'linux') {
      // Linux: Try Machine ID first, fallback to MAC
      const machineId = getLinuxMachineId();
      if (machineId) {
        return {
          deviceId: machineId,
          deviceType: DEVICE_ID_TYPES.LINUX_MACHINE_ID,
          platform: 'Linux'
        };
      }

      // Fallback to MAC address
      const macAddress = getMacAddress();
      if (macAddress) {
        return {
          deviceId: macAddress,
          deviceType: DEVICE_ID_TYPES.MAC_ADDRESS,
          platform: 'Linux (MAC fallback)'
        };
      }
    }

    // If all else fails
    throw new Error('Could not retrieve device ID for platform: ' + platform);

  } catch (error) {
    console.error('Error getting platform device ID:', error);

    // Ultimate fallback: MAC address
    const macAddress = getMacAddress();
    if (macAddress) {
      return {
        deviceId: macAddress,
        deviceType: DEVICE_ID_TYPES.MAC_ADDRESS,
        platform: platform + ' (fallback)'
      };
    }

    throw error;
  }
}

/**
 * Register IPC Handlers
 * Call this function in your main.js after app is ready
 */
function registerDeviceIdHandlers() {
  // Get platform-specific device ID
  ipcMain.handle('get-device-id', async () => {
    try {
      return getPlatformDeviceId();
    } catch (error) {
      console.error('IPC Error - get-device-id:', error);
      return {
        deviceId: null,
        deviceType: null,
        platform: os.platform(),
        error: error.message
      };
    }
  });

  // Legacy support - Get MAC address only
  ipcMain.handle('get-mac-address', async () => {
    try {
      return getMacAddress();
    } catch (error) {
      console.error('IPC Error - get-mac-address:', error);
      return null;
    }
  });

  console.log('Device ID IPC handlers registered');
}

// Export functions
module.exports = {
  registerDeviceIdHandlers,
  getPlatformDeviceId,
  getMacAddress,
  getWindowsMachineGuid,
  getLinuxMachineId,
  DEVICE_ID_TYPES
};
