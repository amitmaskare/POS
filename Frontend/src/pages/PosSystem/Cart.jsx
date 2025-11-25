import { useState } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";


export default function Cart() {
  const [active, setActive] = useState(""); 
  const [cart, setCart] = useState([
    {
      id: 1,
      name: "Fresh Apple (1Kg)",
      sku: "AP-001",
      category: "Fruits",
      price: 120,
      qty: 1,
      image: "data:image/jpeg;base64,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",
    },
    {
      id: 2,
      name: "Chocolate Cookies Pack",
      sku: "CK-312",
      category: "Snacks",
      price: 30,
      qty: 2,
      image: "data:image/jpeg;base64,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",
    },
  ]);

  // Handle Quantity
  const updateQty = (id, type) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1),
            }
          : item
      )
    );
  };

  // Delete Item
  const deleteItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear Cart
  const clearCart = () => setCart([]);

  // Retrieve Example (Mock)
  const retrieveCart = () => {
    alert("Retrieve functionality can be added here!");
  };

  // Payment Button Style
  const getButtonStyle = (type) => ({
    backgroundColor: active === type ? "#5A8DEE" : "transparent",
    color: active === type ? "#fff" : "#000",
  });

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <aside className="cart p-3">
      <h3 className="fw-bold mb-4" style={{color:"#5A8DEE"}}>Cart</h3>

      {/* Product List */}
      <div className="mt-1">
        {cart.map((item) => (
          <div
            key={item.id}
            className="d-flex p-3 rounded-3 mb-3"
            style={{
              background: "#ffffff",
              border: "1px solid #e6e6e6",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              alignItems: "center",
            }}
          >
            <img
              src={item.image}
              alt="product"
              className="rounded-3"
              style={{ width: 55, height: 55, objectFit: "cover" }}
            />

            <div className="ms-3 flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-semibold mb-1" style={{ fontSize: "15px" }}>
                    {item.name}
                  </h6>
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    {item.category} • SKU: {item.sku}
                  </span>
                </div>

                <button className="btn p-1 text-danger" onClick={() => deleteItem(item.id)}>
                  <DeleteIcon fontSize="small" />
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                {/* Quantity */}
                <div
                  className="d-flex align-items-center rounded-pill px-2 py-1"
                  style={{
                    border: "1px solid #dcdcdc",
                    width: "90px",
                    justifyContent: "space-between",
                    height: "32px",
                  }}
                >
                  <button className="btn btn-sm p-0 px-2" onClick={() => updateQty(item.id, "dec")}>
                    −
                  </button>
                  <span className="fw-bold" style={{ fontSize: "14px" }}>
                    {item.qty}
                  </span>
                  <button className="btn btn-sm p-0 px-2" onClick={() => updateQty(item.id, "inc")}>
                    +
                  </button>
                </div>

                {/* Price */}
                <h6 className="fw-bold mb-0" style={{ fontSize: "15px" }}>
                  ₹{(item.price * item.qty).toFixed(2)}
                </h6>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-top pt-3 mt-4">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Tax (5%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold border-top pt-3 mt-4">
          <span style={{color:"#5A8DEE"}}>Total</span>
          <span style={{color:"#5A8DEE"}}>₹{total.toFixed(2)}</span>
        </div>

        {/* Discount */}
        <button className="btn btn-outline-secondary btn-sm w-100 mt-3 d-flex align-items-center text-dark justify-content-center">
          % Apply Discount
        </button>

        {/* Payment Buttons */}
        <div className="d-flex gap-2 mt-3">
          <button
            className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
            style={getButtonStyle("cash")}
            onClick={() => setActive("cash")}
          >
            <AttachMoneyIcon style={{ fontSize: 18, marginRight: 5 }} />
            Cash
          </button>

          <button
            className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
            style={getButtonStyle("credit")}
            onClick={() => setActive("credit")}
          >
            <CreditCardIcon style={{ fontSize: 18, marginRight: 5 }} />
            Credit
          </button>
        </div>

        {/* Cart Options */}
        <div className="d-flex flex-row mt-3 gap-3 justify-content-center">
          <button className="btn btn-outline-secondary text-dark">Hold Sale</button>
          <button className="btn btn-outline-secondary text-dark" onClick={clearCart}>
            Clear Cart
          </button>
          <button className="btn btn-outline-secondary text-dark" onClick={retrieveCart}>
            Retrieve
          </button>
        </div>

        {/* Print */}
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-success">
            <PrintIcon style={{ fontSize: 18, marginRight: 5 }} />
            Print Receipt
          </button>
        </div>
      </div>
    </aside>
  );
}
