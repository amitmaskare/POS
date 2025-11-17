import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Beverages", "Snacks", "Stationery"];

  return (
    <>
      <main
        style={{
          width: "100%",
          textAlign: "left",
          margin: 0,
          padding: 0,
        }}
      >
     <div className="row">
      <div className="col-12 col-md-6 col-lg-8">
        <div className="input-group mb-3">
          <span className="input-group-text bg-white border-end-0">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="form-control form-control border-start-0"
            placeholder="Search products..."
          />
        </div>
      </div>
    </div>


        <div className="btn-group gap-2 mb-3">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setActiveFilter(item)}
              className="btn rounded-pill"
              style={{
                backgroundColor:
                  activeFilter === item ? "#5A8DEE" : "transparent",
                border:
                  activeFilter === item ? "1px solid #5A8DEE" : "1px solid #ccc",
                color: activeFilter === item ? "#fff" : "#444",
              }}
            >
              {item}
            </button>
          ))}
        </div>

       
      </main>
    </>
  );
}
