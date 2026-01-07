

import {useState} from "react";
import { Routes,Route } from "react-router-dom";
// Pages

// import Dashboard from "../pages/Dashboard";
// import Products from "../pages/Products";
// import Login from "../pages/Login";
// import ForgotPassword from "../pages/ForgotPassword";
// import Manage from "../layouts/Manage";
// import Purchases from "../pages/Purchases";
// import Transactions from "../pages/Transactions";
// import Inventory from "../pages/Inventory";
// import Reports from "../pages/Reports";
// import Customers from "../pages/Customers";
// import Users from "../pages/Users";
// import RationCards from "../pages/RationCards";

import Dashboard from "../pages/PosSystem/Dashboard";
import Products from "../pages/Products/Products";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Manage from "../layouts/Manage";
import Purchases from "../pages/Purchases/Purchases";
import Receiving from "../pages/Receiving/Receiving";
import Sales from "../pages/Sales/Sales";
import Return from "../pages/Returns/Return";
import Transactions from "../pages/Transactions/Transactions";
import Inventory from "../pages/Inventory/Inventory";
import Reports from "../pages/Reports/Reports";
import Customers from "../pages/Customers/Customers";
import Users from "../pages/Users/Users";
import RationCards from "../pages/RationCards/RationCards";
import Offer from "../pages/Offer/Offer";
import ProtectedRoute from "./ProtectedRoute";
import SaleReturn from "../pages/SaleReturn/Dashboard"

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
        <Route path="receiving" element={<Receiving />} />
        <Route path="sales" element={<Sales />} />
        <Route path="return-product" element={<Return />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="customers" element={<Customers />} />
        <Route path="users" element={<Users />} />
        <Route path="rationcards" element={<RationCards />} />
        <Route path="offers" element={<Offer />} />
        <Route path="salereturn" element={<SaleReturn />} />
      </Route>

      {/* PUBLIC ROUTES (WITHOUT SIDEBAR) */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

export default AppRoutes;
