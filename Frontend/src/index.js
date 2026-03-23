import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter } from 'react-router-dom';

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

function Root() {

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const toggleDarkMode = () => {
    const value = !darkMode;
    setDarkMode(value);
    localStorage.setItem("darkMode", value);
  };

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",
        primary: {
          main: "#415A77",
        },
        background: {
          default: darkMode ? "#0d1b2a" : "#f8f9fc",
          paper: darkMode ? "#1b263b" : "#ffffff",
        },
      },
    }), [darkMode]);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
      </ThemeProvider>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);

reportWebVitals();