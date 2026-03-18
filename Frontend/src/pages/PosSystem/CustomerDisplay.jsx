import React, { useEffect, useState } from "react";
import socket from "../../socket";

export default function CustomerDisplay() {

  const roomId = "pos_terminal_1";

  const [items, setItems] = useState([]);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {

    socket.emit("join-room", roomId);

    // receive product
    socket.on("display-bill", (product) => {

      console.log("Received product:", product);

      // Check if product already exists
      setItems((prev) => {
        const existingIndex = prev.findIndex(item => item.id === product.id);

        if (existingIndex !== -1) {
          // Update existing product quantity
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            qty: (updated[existingIndex].qty || 1) + 1
          };
          return updated;
        } else {
          // Add new product
          return [...prev, { ...product, qty: product.qty || 1 }];
        }
      });

    });

    // payment success
    socket.on("show-thankyou", () => {

      setShowThankYou(true);

      setItems([]);

      setTimeout(() => {

        setShowThankYou(false);

      }, 4000);

    });

    return () => {
      socket.off("display-bill");
      socket.off("show-thankyou");
    };

  }, []);

  // Calculate item tax amount (same as Cart.jsx)
  const getItemTaxAmount = (item) => {
    const base = item.qty * item.price;
    const taxPercent = item.tax || 0;
    return (base * taxPercent) / 100;
  };

  // Calculate totals (same as Cart.jsx)
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const tax = items.reduce((sum, item) => sum + getItemTaxAmount(item), 0);
  const totalTax = items.reduce((sum, item) => sum + Number(item.tax || 0), 0);
  const total = subtotal + tax;

  return (
    <div
      style={{
        height: "100vh",
        background: "#000",
        color: "#fff",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >

      {showThankYou ? (

        <div
          style={{
            textAlign: "center",
            marginTop: "20%",
          }}
        >

          <h1
            style={{
              fontSize: "90px",
              color: "#00ff99",
            }}
          >
            THANK YOU
          </h1>

          <h2
            style={{
              fontSize: "40px",
            }}
          >
            VISIT AGAIN
          </h2>

        </div>

      ) : (

        <>
          <h1
            style={{
              textAlign: "center",
              marginBottom: "30px",
              fontSize: "45px",
            }}
          >
            Customer Display
          </h1>

          <div>

            {items.map((item, index) => (

              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "15px",
                  borderBottom: "1px solid #444",
                  fontSize: "28px",
                }}
              >

                <span>
                  {item.product_name || item.name} × {item.qty || 1}
                </span>

                <span>
                  ₹{((item.selling_price || item.price) * (item.qty || 1)).toFixed(2)}
                </span>

              </div>

            ))}

          </div>

          <div
            style={{
              marginTop: "40px",
              borderTop: "2px solid #fff",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "32px",
                marginBottom: "15px",
                color: "#ccc",
              }}
            >
              <span>Subtotal:</span>
              <span>₹{Number(subtotal).toFixed(2)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "32px",
                marginBottom: "15px",
                color: "#ccc",
              }}
            >
              <span>Tax ({totalTax}%):</span>
              <span>₹{Number(tax).toFixed(2)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "45px",
                fontWeight: "bold",
                borderTop: "2px solid #fff",
                paddingTop: "20px",
                marginTop: "15px",
                color: "#00ff99",
              }}
            >
              <span>Total:</span>
              <span>₹{Number(total).toFixed(2)}</span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}