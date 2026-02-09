import { useState, useEffect } from "react";

/**
 * Custom Hook for Toast Notifications
 * @returns {Object} - { showToast, toastMessage, toastType, showToastNotification }
 */
export const useToast = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState(""); // "success", "error", "info", "warning"
  const [showToast, setShowToast] = useState(false);
  const [toastTimeout, setToastTimeout] = useState(null);

  /**
   * Show Toast Notification with auto-hide after 3 seconds
   * @param {string} message - The message to display
   * @param {string} type - The toast type: "success", "error", "warning", "info"
   * @param {number} duration - Duration in milliseconds (default: 3000)
   */
  const showToastNotification = (message, type = "info", duration = 3000) => {
    // Validate message
    if (!message || typeof message !== "string") {
      console.warn("Toast message must be a non-empty string");
      return;
    }

    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    // Clear existing timeout
    if (toastTimeout) clearTimeout(toastTimeout);

    // Auto-hide after specified duration
    const timeout = setTimeout(() => {
      setShowToast(false);
    }, duration);

    setToastTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeout) clearTimeout(toastTimeout);
    };
  }, [toastTimeout]);

  return {
    showToast,
    toastMessage,
    toastType,
    showToastNotification,
  };
};

export default useToast;
