import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import Login from "./pages/Login/Login";

function App({ darkMode, toggleDarkMode }) {
  const [auth, setAuth] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setAuth(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
      {!auth ? (
        <Login onLogin={() => setAuth(localStorage.getItem("token"))} />
      ) : (
        <AppRoutes darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      )}
    </>
  );
}

export default App;