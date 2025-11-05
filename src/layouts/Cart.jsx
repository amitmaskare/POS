export default function Cart() {
  return (
   <>
    <aside className="cart">

    <h5 className="fw-bold mb-4">Cart</h5>

    <div className="text-center text-muted mt-5">
      <img src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png" width="60" alt="img"/>
      <p className="mt-2">Your cart is empty</p>
    </div>

    <div className="border-top pt-3">
      <div className="d-flex justify-content-between fw-bold">
        <span>Total</span>
        <span>$0.00</span>
      </div>
      <button className="btn btn-success btn-lg w-100 mt-3">
        Print Receipt
      </button>
    </div>

  </aside>
   </>
  );
}
