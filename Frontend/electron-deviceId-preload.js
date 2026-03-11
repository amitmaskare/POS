/**
 * Electron Preload Script for Device ID
 *
 * This file exposes platform-specific device ID functions to the renderer process
 * Add this to your Electron app's preload script
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose device ID functions to renderer
contextBridge.exposeInMainWorld('electron', {
  /**
   * Get platform-specific device ID
   * Returns: { deviceId: string, deviceType: string, platform: string }
   */
  getDeviceId: () => ipcRenderer.invoke('get-device-id'),

  /**
   * Legacy support - Get MAC address only
   * @deprecated Use getDeviceId instead
   */
  getMacAddress: () => ipcRenderer.invoke('get-mac-address')
});
