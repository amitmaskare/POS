

import {useState} from "react";
import { Routes,Route } from "react-router-dom";
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
import Reports from "../pages/Reports/Reports";
import Customers from "../pages/Customers/Customers";
import Users from "../pages/Users/Users";
import RationCards from "../pages/RationCards/RationCards";
import Offer from "../pages/Offer/Offer";
import ProtectedRoute from "./ProtectedRoute";
import PermissionRoute from "./PermissionRoute";
import SaleReturn from "../pages/SaleReturn/Dashboard"
import Role from "../pages/Role/Role";
import Permission from "../pages/Permission/Permission";
import RolePermission from "../pages/RolePermission/RolePermission";
import UserPermissions from "../pages/Users/UserPermissions";
import POSSettings from "../pages/Settings/POSSettings";
import Settings from "../pages/Settings/Settings";
import Store from "../pages/Store/Stores";
import CustomerDisplay from "../pages/PosSystem/CustomerDisplay";
import { Inventory } from "../pages/Inventory/Inventory";

const AppRoutes = ({ darkMode, toggleDarkMode }) => {
 const [auth, setAuth] = useState(localStorage.getItem('token'));

  return (
    <Routes>
      {/* LOGIN PAGE (public) */}
           <Route path="/" element={<Login onLogin={() =>  setAuth(localStorage.getItem('token'))}/>} />
           <Route path="/login" element={<Login onLogin={() =>  setAuth(localStorage.getItem('token'))}/>} />
     
           {/* FORGOT PASSWORD PAGE (public) */}
           <Route path="/forgot-password" element={<ForgotPassword />} />
     
           {/* PROTECTED PAGES */}
           <Route
        path="/"
        element={
          <ProtectedRoute>
            <Manage darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<PermissionRoute permission="view-product">
      <Products />
    </PermissionRoute>} />
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
        <Route path="role" element={<Role />} />
        <Route path="permission" element={<Permission />} />
        <Route path="rolepermission" element={<RolePermission />} />
        <Route path="user-permissions/:userId" element={<UserPermissions />} />
        <Route path="user-permissions" element={<UserPermissions />} />
        <Route path="salereturn" element={<SaleReturn />} />
         <Route path="stores" element={<Store />} />
        <Route path="pos-settings" element={<POSSettings />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* PUBLIC ROUTES (WITHOUT SIDEBAR) */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/customer-display" element={<CustomerDisplay />} />
    </Routes>
  );
};

export default AppRoutes;
