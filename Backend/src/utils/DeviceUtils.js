/**
 * Device Utilities
 *
 * Handles cross-platform device identification for device binding
 * Supports: Windows (Machine GUID), macOS (MAC Address), Linux (Machine ID)
 */

import os from 'os';
import crypto from 'crypto';

/**
 * Device ID Types
 */
export const DEVICE_ID_TYPES = {
  MAC_ADDRESS: 'MAC',           // macOS, Linux, Network-based
  WINDOWS_GUID: 'WIN_GUID',     // Windows Machine GUID
  LINUX_MACHINE_ID: 'LINUX_ID', // Linux /etc/machine-id
  CUSTOM_FINGERPRINT: 'CUSTOM'  // Custom fingerprint fallback
};

/**
 * Get server's MAC address (for development/testing)
 * In production, device ID should come from client
 */
export const getServerMacAddress = () => {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];

    for (const iface of interfaces) {
      // Skip internal (loopback) and non-physical interfaces
      if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
        return iface.mac.toUpperCase();
      }
    }
  }

  return null;
};

/**
 * Generate a device fingerprint from client information
 * This is a fallback if platform-specific ID cannot be obtained
 */
export const generateDeviceFingerprint = (userAgent, ipAddress, additionalData = {}) => {
  const data = JSON.stringify({
    userAgent,
    ipAddress,
    ...additionalData
  });

  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
};

/**
 * Validate MAC address format
 */
export const isValidMacAddress = (mac) => {
  if (!mac) return false;

  // MAC address pattern: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
  const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macPattern.test(mac);
};

/**
 * Validate Windows Machine GUID format
 */
export const isValidWindowsGuid = (guid) => {
  if (!guid) return false;

  // Windows GUID pattern: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  const guidPattern = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;
  return guidPattern.test(guid);
};

/**
 * Validate Linux Machine ID format
 */
export const isValidLinuxMachineId = (machineId) => {
  if (!machineId) return false;

  // Linux machine-id is typically 32 hex characters
  const linuxIdPattern = /^[0-9A-Fa-f]{32}$/;
  return linuxIdPattern.test(machineId);
};

/**
 * Validate custom fingerprint format
 */
export const isValidCustomFingerprint = (fingerprint) => {
  if (!fingerprint) return false;

  // Custom fingerprint should be a hex string (at least 32 chars)
  const fingerprintPattern = /^[0-9A-Fa-f]{32,}$/;
  return fingerprintPattern.test(fingerprint);
};

/**
 * Detect device ID type based on format
 */
export const detectDeviceIdType = (deviceId) => {
  if (!deviceId) return null;

  if (isValidMacAddress(deviceId)) {
    return DEVICE_ID_TYPES.MAC_ADDRESS;
  }

  if (isValidWindowsGuid(deviceId)) {
    return DEVICE_ID_TYPES.WINDOWS_GUID;
  }

  if (isValidLinuxMachineId(deviceId)) {
    return DEVICE_ID_TYPES.LINUX_MACHINE_ID;
  }

  if (isValidCustomFingerprint(deviceId)) {
    return DEVICE_ID_TYPES.CUSTOM_FINGERPRINT;
  }

  return null;
};

/**
 * Validate device ID format (accepts any valid format)
 */
export const isValidDeviceId = (deviceId) => {
  return detectDeviceIdType(deviceId) !== null;
};

/**
 * Normalize MAC address to standard format (uppercase with colons)
 */
export const normalizeMacAddress = (mac) => {
  if (!mac) return null;

  // Remove any non-alphanumeric characters and convert to uppercase
  const cleaned = mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();

  // Format as XX:XX:XX:XX:XX:XX
  if (cleaned.length === 12) {
    return cleaned.match(/.{2}/g).join(':');
  }

  return mac.toUpperCase();
};

/**
 * Normalize Windows GUID to standard format (uppercase)
 */
export const normalizeWindowsGuid = (guid) => {
  if (!guid) return null;
  return guid.toUpperCase();
};

/**
 * Normalize Linux Machine ID to standard format (lowercase)
 */
export const normalizeLinuxMachineId = (machineId) => {
  if (!machineId) return null;
  return machineId.toLowerCase();
};

/**
 * Normalize device ID based on its type
 */
export const normalizeDeviceId = (deviceId) => {
  if (!deviceId) return null;

  const type = detectDeviceIdType(deviceId);

  switch (type) {
    case DEVICE_ID_TYPES.MAC_ADDRESS:
      return normalizeMacAddress(deviceId);

    case DEVICE_ID_TYPES.WINDOWS_GUID:
      return normalizeWindowsGuid(deviceId);

    case DEVICE_ID_TYPES.LINUX_MACHINE_ID:
      return normalizeLinuxMachineId(deviceId);

    case DEVICE_ID_TYPES.CUSTOM_FINGERPRINT:
      return deviceId.toLowerCase();

    default:
      return deviceId;
  }
};

/**
 * Extract device information from request
 */
export const getDeviceInfoFromRequest = (req) => {
  const deviceId = req.body.device_id || req.headers['x-device-id'] || null;

  return {
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || req.connection.remoteAddress || '',
    deviceId: deviceId,
    deviceIdType: detectDeviceIdType(deviceId),
    normalizedDeviceId: normalizeDeviceId(deviceId)
  };
};

/**
 * Compare two device IDs (platform-aware, case-insensitive)
 */
export const compareDeviceIds = (deviceId1, deviceId2) => {
  if (!deviceId1 || !deviceId2) return false;

  const normalized1 = normalizeDeviceId(deviceId1);
  const normalized2 = normalizeDeviceId(deviceId2);

  return normalized1 === normalized2;
};

/**
 * Compare two MAC addresses (case-insensitive, ignoring formatting)
 * @deprecated Use compareDeviceIds instead for cross-platform support
 */
export const compareMacAddresses = (mac1, mac2) => {
  if (!mac1 || !mac2) return false;

  const normalize = (mac) => mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  return normalize(mac1) === normalize(mac2);
};

export default {
  // Device ID Types
  DEVICE_ID_TYPES,

  // Validation Functions
  isValidDeviceId,
  isValidMacAddress,
  isValidWindowsGuid,
  isValidLinuxMachineId,
  isValidCustomFingerprint,
  detectDeviceIdType,

  // Normalization Functions
  normalizeDeviceId,
  normalizeMacAddress,
  normalizeWindowsGuid,
  normalizeLinuxMachineId,

  // Comparison Functions
  compareDeviceIds,
  compareMacAddresses, // deprecated

  // Utility Functions
  getServerMacAddress,
  generateDeviceFingerprint,
  getDeviceInfoFromRequest
};
