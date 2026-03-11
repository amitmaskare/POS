/**
 * Device Utilities for Frontend
 *
 * Cross-platform device identification for device binding
 * Supports:
 * - Windows: Machine GUID (via Electron)
 * - macOS: MAC Address (via Electron)
 * - Linux: Machine ID (via Electron)
 * - Web Browser: Browser Fingerprint (fallback)
 */

/**
 * Device ID Types
 */
export const DEVICE_ID_TYPES = {
  MAC_ADDRESS: 'MAC',           // macOS, Linux, Network-based
  WINDOWS_GUID: 'WIN_GUID',     // Windows Machine GUID
  LINUX_MACHINE_ID: 'LINUX_ID', // Linux /etc/machine-id
  BROWSER_FINGERPRINT: 'BROWSER' // Browser fingerprint fallback
};

/**
 * Generate a device fingerprint based on browser and system information
 * This is a fallback when hardware IDs are not available (web browsers)
 *
 * @returns {Promise<string>} Device fingerprint hash (64 chars)
 */
export const getDeviceFingerprint = async () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser Fingerprint', 2, 2);
    const canvasFingerprint = canvas.toDataURL();

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory || 'unknown',
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvasFingerprint: canvasFingerprint,
      touchSupport: 'ontouchstart' in window
    };

    const fingerprintString = JSON.stringify(fingerprint);
    const hash = await hashString(fingerprintString);

    return hash;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback to basic fingerprint
    const basicFingerprint = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}-${navigator.platform}`;
    return await hashString(basicFingerprint);
  }
};

/**
 * Hash a string using SubtleCrypto API
 * @param {string} str
 * @returns {Promise<string>}
 */
const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Get platform-specific device ID
 * This function checks if running in Electron and gets appropriate device ID
 *
 * Priority:
 * 1. Windows: Machine GUID from registry
 * 2. macOS: MAC Address from network interface
 * 3. Linux: Machine ID from /etc/machine-id
 * 4. Browser: Fingerprint hash
 *
 * @returns {Promise<{deviceId: string, deviceType: string}>}
 */
export const getPlatformDeviceId = async () => {
  try {
    // Check if running in Electron environment
    if (window.electron) {
      // Try to get platform-specific ID
      if (window.electron.getDeviceId) {
        const deviceInfo = await window.electron.getDeviceId();
        if (deviceInfo && deviceInfo.deviceId) {
          console.log(`Device ID Type: ${deviceInfo.deviceType}`);
          return deviceInfo;
        }
      }

      // Legacy support - try old MAC address method
      if (window.electron.getMacAddress) {
        const macAddress = await window.electron.getMacAddress();
        if (macAddress) {
          return {
            deviceId: macAddress,
            deviceType: DEVICE_ID_TYPES.MAC_ADDRESS
          };
        }
      }
    }

    // Fallback to browser fingerprint
    const fingerprint = await getDeviceFingerprint();
    return {
      deviceId: fingerprint,
      deviceType: DEVICE_ID_TYPES.BROWSER_FINGERPRINT
    };

  } catch (error) {
    console.error('Error getting platform device ID:', error);
    // Ultimate fallback
    const fingerprint = await getDeviceFingerprint();
    return {
      deviceId: fingerprint,
      deviceType: DEVICE_ID_TYPES.BROWSER_FINGERPRINT
    };
  }
};

/**
 * Get device ID - this will be used for device binding
 * Returns a consistent device ID across sessions
 *
 * @returns {Promise<string>} Device ID
 */
export const getDeviceId = async () => {
  try {
    // Get platform-specific device ID
    const { deviceId, deviceType } = await getPlatformDeviceId();

    // For browser fingerprints, store in localStorage to maintain consistency
    if (deviceType === DEVICE_ID_TYPES.BROWSER_FINGERPRINT) {
      const storedFingerprint = localStorage.getItem('device_fingerprint');
      if (storedFingerprint) {
        return storedFingerprint;
      }
      localStorage.setItem('device_fingerprint', deviceId);
    }

    return deviceId;

  } catch (error) {
    console.error('Error getting device ID:', error);
    // Ultimate fallback
    const fallback = await getDeviceFingerprint();
    localStorage.setItem('device_fingerprint', fallback);
    return fallback;
  }
};

/**
 * Format MAC address to standard format (XX:XX:XX:XX:XX:XX)
 * @param {string} mac
 * @returns {string}
 */
export const formatMacAddress = (mac) => {
  if (!mac) return '';

  // Remove any non-alphanumeric characters
  const cleaned = mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();

  // Format as XX:XX:XX:XX:XX:XX
  if (cleaned.length === 12) {
    return cleaned.match(/.{2}/g).join(':');
  }

  return mac.toUpperCase();
};

/**
 * Check if device is locked (for display purposes)
 * @returns {boolean}
 */
export const isDeviceLocked = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.device_locked === 1 || user.device_locked === true;
};

/**
 * Get device info for display
 * @returns {object}
 */
export const getDeviceInfo = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    deviceId: user.device_id || null,
    deviceLocked: user.device_locked || false,
    firstLoginAt: user.first_login_at || null,
    lastLoginAt: user.last_login_at || null
  };
};

export default {
  getDeviceId,
  getDeviceFingerprint,
  formatMacAddress,
  isDeviceLocked,
  getDeviceInfo
};
