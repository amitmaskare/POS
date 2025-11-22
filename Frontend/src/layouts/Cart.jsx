import { useState } from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import PrintIcon from '@mui/icons-material/Print';
export default function Cart() {
  const [active, setActive] = useState(""); // track which button is active

  const handleClick = (type) => {
    setActive(type);
  };

  const getButtonStyle = (type) => ({
    backgroundColor: active === type ? "#5A8DEE" : "transparent",
    color: active === type ? "#fff" : "#000",
  });
  return (
    <>
      <aside className="cart p-3">

        <h3 className="fw-bold mb-4">
          Cart
        </h3>

        <div className="text-center text-muted mt-5" >
          <img
            src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
            width="60"
            alt="empty cart" 
          />
          <p className="mt-2"  style={{ color: "#5A8DEE" }}>Your cart is empty</p>
        </div>

        <div className="border-top pt-3 mt-4">
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>$0.00</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Tax</span>
            <span>$0.00</span>
          </div>
          <div className="d-flex justify-content-between fw-bold border-top pt-3 mt-4">
            <span>Total</span>
            <span>$0.00</span>
          </div>

          <button className="btn btn-outline-secondary btn-sm w-100 mt-3 d-flex align-items-center text-dark justify-content-center">
            %
            Apply Discount
          </button>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
              style={getButtonStyle("cash")}
              onClick={() => handleClick("cash")}
            >
              <AttachMoneyIcon style={{ fontSize: 18, marginRight: 5 }} />
              Cash
            </button>
            <button
              className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center"
              style={getButtonStyle("credit")}
              onClick={() => handleClick("credit")}
            >
              <CreditCardIcon style={{ fontSize: 18, marginRight: 5 }} />
              Credit
            </button>
          </div>

          <div className="d-flex flex-row mt-3 gap-3 justify-content-center">
            <button className="btn btn-outline-secondary text-dark">Hold Sale</button>
            <button className="btn btn-outline-secondary text-dark">Clear Cart</button>
            <button className="btn btn-outline-secondary text-dark">Retrieve</button>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button className="btn btn-success">
              <PrintIcon style={{ fontSize: 18, marginRight: 5 }} />
              Print Receipt
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
