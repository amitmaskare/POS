import React from "react";

/**
 * Toast Notification Component
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the toast
 * @param {string} props.message - The message to display
 * @param {string} props.type - Toast type: "success", "error", "warning", "info"
 */
const Toast = ({ show, message, type = "info" }) => {
  if (!show) return null;

  // Determine background color based on type
  const backgroundColor =
    type === "success"
      ? "#10b981"
      : type === "error"
      ? "#ef4444"
      : type === "warning"
      ? "#f59e0b"
      : "#3b82f6";

  // Determine icon emoji based on type
  const icon =
    type === "success"
      ? "✓"
      : type === "error"
      ? "✕"
      : type === "warning"
      ? "⚠"
      : "ℹ";

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "16px 20px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 9999,
          animation: "slideIn 0.3s ease-in-out",
          backgroundColor: backgroundColor,
          color: "#fff",
          maxWidth: "400px",
          wordWrap: "break-word",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <span>{message}</span>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
};

export default Toast;
