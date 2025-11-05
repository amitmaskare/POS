import React from "react";
import { FaHistory, FaTag, FaIdCard } from "react-icons/fa";

export default function Header() {
  return (
    <>
     <header className="header d-flex justify-content-between align-items-center px-4">
<div className="dropdown">
  <button className="btn btn-light dropdown-toggle fw-semibold" type="button" data-bs-toggle="dropdown">
    Admin User <span className="badge bg-danger">admin</span>
  </button>

  <ul className="dropdown-menu dropdown-menu-end">
    <li><a className="dropdown-item" href="profile.html">👤 Profile</a></li>
    <li><a className="dropdown-item" href="change_password.html">🔐 Change Password</a></li>
    <li><a className="dropdown-item" href="settings.html">⚙️ Settings</a></li>
    <li><hr className="dropdown-divider" /></li>
    <li><a className="dropdown-item text-danger" href="logout.html">🚪 Logout</a></li>
  </ul>
</div>

    <div className="btn-group gap-2">
      <button className="btn btn-outline-dark btn-sm">Check Out</button>
      <button className="btn btn-outline-dark btn-sm">Enter Aadhaar</button>
      <button className="btn btn-outline-dark btn-sm"><i className="bi bi-card-text"></i> Ration Card</button>
      <button className="btn btn-outline-dark btn-sm"><i className="bi bi-tag"></i> Offers</button>
      <button className="btn btn-outline-dark btn-sm"><i className="bi bi-clock-history"></i> Sales History</button>
    </div>
  </header>
    </>
  );
}
