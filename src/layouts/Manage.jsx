import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Cart from "./Cart";
import Dashboard from "../pages/Dashboard";

const Manage = () => {
  return (
   <>
   <Header />
   <Sidebar />
   <Dashboard />
   <Cart />
   </>
  );
};

export default Manage;
