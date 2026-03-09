import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";

const PosCart = ({
  title,
  cart,
  deleteItem,
  updateQty,
  updatePrice,
  editingPriceId,
  setEditingPriceId,
  subtotal,
  tax,
  total,
  totalTax,
  renderPaymentButtons,
  renderCartOptions,
  checkoutSale,
  isReturn = false,
}) => {
  return (
    <aside
      className="cart p-3"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h4 className="fw-bold mb-4" style={{ color: "#415a77" }}>
        {title}
      </h4>

      {/* Product List */}
      <div
        className="mt-1"
        style={{ flex: 1, overflowY: "auto", paddingRight: "6px" }}
      >
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
              src={item?.image || ""}
              alt="product"
              className="rounded-3"
              style={{ width: 55, height: 55, objectFit: "cover" }}
            />

            <div className="ms-3 flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <h6 className="fw-semibold mb-1" style={{ fontSize: "15px" }}>
                  {item.product_name}
                </h6>

                <button
                  className="btn p-1 text-danger"
                  onClick={() => deleteItem(item.id)}
                >
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
                  {isReturn && item.return_qty ? (
                    <span className="fw-bold" style={{ fontSize: "14px" }}>
                      {item.return_qty}
                    </span>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm p-0 px-2"
                        onClick={() => updateQty(item.id, "dec")}
                      >
                        −
                      </button>
                      <span
                        className="fw-bold"
                        style={{ fontSize: "14px" }}
                      >
                        {item.qty}
                      </span>
                      <button
                        className="btn btn-sm p-0 px-2"
                        onClick={() => updateQty(item.id, "inc")}
                      >
                        +
                      </button>
                    </>
                  )}
                </div>

                {/* Price */}
                <div className="d-flex align-items-center gap-2">
                  {editingPriceId === item.id ? (
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                      value={item.price}
                      autoFocus
                      onChange={(e) =>
                        updatePrice(item.id, e.target.value)
                      }
                      onBlur={() => setEditingPriceId(null)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setEditingPriceId(null)
                      }
                    />
                  ) : (
                    <h6
                      className="fw-bold mb-0"
                      style={{ fontSize: "15px" }}
                    >
                      ₹{item.price}
                    </h6>
                  )}

                  <button
                    className="btn btn-sm p-0 text-primary"
                    onClick={() => setEditingPriceId(item.id)}
                  >
                    <EditIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-top pt-3 mt-4">
        <div className="d-flex justify-content-between mb-2">
          <span>
            {isReturn && total < 0 ? "Subtotal (Refund)" : "Subtotal"}
          </span>
          <span>
            ₹{isReturn
              ? Math.abs(Number(subtotal)).toFixed(2)
              : Number(subtotal).toFixed(2)}
          </span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span >Tax ({totalTax}%)</span>
          <span>
            ₹{isReturn
              ? Math.abs(Number(tax)).toFixed(2)
              : Number(tax).toFixed(2)}
          </span>
        </div>

        <div className="d-flex justify-content-between fw-bold border-top pt-3 mt-4">
          <span style={{ color: "#415a77" }}>
            {isReturn && total < 0 ? "Total Refund" : "Total"}
          </span>
          <span style={{ color: "#415a77" }}>
            ₹{isReturn
              ? Math.abs(Number(total)).toFixed(2)
              : Number(total).toFixed(2)}
          </span>
        </div>

        {/* Payment Buttons */}
        <div className="mt-3">
        {renderPaymentButtons}

        </div>

        {/* Cart Options */}
        <div className="mt-3">
        {renderCartOptions}

        </div>

        {/* Print */}
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-success" onClick={checkoutSale}>
            <PrintIcon style={{ fontSize: 18, marginRight: 5 }} />
            Print Receipt
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PosCart;
