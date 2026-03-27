import React, { createContext, useContext, useState } from "react";

const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        selectedCustomer,
        selectCustomer,
        clearCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
