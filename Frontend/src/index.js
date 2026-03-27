import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CustomerProvider } from './context/CustomerContext';

const theme = createTheme({
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#fff",
          color: "#5A8DEE",
          fontSize: "14px",
          border: "1px solid #5A8DEE",
          fontWeight: 600,
        },
        arrow: {
          color: "#1e293b",
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
  <ThemeProvider theme={theme}>
    <CustomerProvider>
      <App />
    </CustomerProvider>
    </ThemeProvider>
  </BrowserRouter>
);


reportWebVitals();
