import React from "react";
import { FaStore, FaBox, FaHistory, FaUsers, FaSignOutAlt } from "react-icons/fa";

export default function Sidebar() {
  return (
    <>
   <aside className="sidebar p-3">
    <h5 className="fw-bold">My Store</h5>
    <small className="text-muted">Admin • Admin User</small>

    <ul className="list-unstyled mt-4">
      <li className="p-2 nav-item fw-bold text-primary bg-primary bg-opacity-10 rounded">POS System</li>
      <li className="p-2 nav-item">Products</li>
      <li className="p-2 nav-item">Purchases</li>
      <li className="p-2 nav-item">Transactions</li>
      <li className="p-2 nav-item">Inventory</li>
      <li className="p-2 nav-item">Reports</li>
      <li className="p-2 nav-item">Customers</li>
      <li className="p-2 nav-item">Users</li>
      <li className="p-2 nav-item">Ration Cards</li>
    </ul>

    <div className="border-top pt-3 mt-3 text-danger fw-bold">
      Logout
    </div>
  </aside>
    </>
  );
}
