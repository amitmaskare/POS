export default function Dashboard() {
  return (
    <>
     <main className="content">
    <input type="text" className="form-control form-control-lg mb-3" placeholder="Search products..." />

    <div className="btn-group gap-2 mb-3">
      <button className="btn btn-primary rounded-pill">All</button>
      <button className="btn btn-outline-secondary rounded-pill">Beverages</button>
      <button className="btn btn-outline-secondary rounded-pill">Snacks</button>
      <button className="btn btn-outline-secondary rounded-pill">Stationery</button>
    </div>

   
    <div className="text-center text-muted mt-5">
      <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" alt="Img" width="90"/>
      <p className="mt-3 fw-semibold">No Products Available</p>
    </div>
  </main>
    </>
  );
}
