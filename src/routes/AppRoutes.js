import React from "react";
import { Routes,Route } from "react-router-dom";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Manage from "../layouts/Manage";
import Dashboard from '../pages/Dashboard'
const AppRoutes=()=>{
    return(
        <Routes>   
            <Route path="/" element={<Login />} />
             {/* <Route path="/" element={<Manage />}>
            <Route path="/dashboard" element={<Dashboard />} />
             </Route>     */}
       
         {/* <Route path="/login" element={<Login />} /> */}
         <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
     
    )
}

export default AppRoutes