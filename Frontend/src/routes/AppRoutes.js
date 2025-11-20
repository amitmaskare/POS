

import React from "react";
import { Routes,Route } from "react-router-dom";
// Pages
import Dashboard from "../pages/PosSystem/Dashboard";
import Products from "../pages/Products/Products";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Manage from "../layouts/Manage";
import Purchases from "../pages/Purchases/Purchases";
import Transactions from "../pages/Transactions/Transactions";
import Inventory from "../pages/Inventory/Inventory";
import Reports from "../pages/Reports/Reports";
import Customers from "../pages/Customers/Customers";
import Users from "../pages/Users/Users";
import RationCards from "../pages/RationCards/RationCards";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ALL PAGES THAT NEED SIDEBAR + HEADER */}
      <Route path="/" element={<Manage />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="customers" element={<Customers />} />
        <Route path="users" element={<Users />} />
        <Route path="rationcards" element={<RationCards />} />
      </Route>

      {/* PUBLIC ROUTES (WITHOUT SIDEBAR) */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

export default AppRoutes;
