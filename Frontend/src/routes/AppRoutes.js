import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Manage from "../layouts/Manage";
import Purchases from "../pages/Purchases";
import Transactions from "../pages/Transactions";
import Inventory from "../pages/Inventory";
import Reports from "../pages/Reports";
import Customers from "../pages/Customers";
import Users from "../pages/Users";
import RationCards from "../pages/RationCards";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
 const [auth, setAuth] = useState(sessionStorage.getItem('token'));

  return (
    <Routes>

      {/* LOGIN PAGE (public) */}
      <Route path="/" element={<Login onLogin={() =>  setAuth(sessionStorage.getItem('token'))}/>} />
      <Route path="/login" element={<Login onLogin={() =>  setAuth(sessionStorage.getItem('token'))}/>} />

      {/* FORGOT PASSWORD PAGE (public) */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* PROTECTED PAGES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Manage />
          </ProtectedRoute>
        }
      >
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

    </Routes>
  );
};

export default AppRoutes;
