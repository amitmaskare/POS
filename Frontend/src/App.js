import {useEffect,useState } from 'react';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/Login';

function App() {
 const [auth, setAuth] = useState(sessionStorage.getItem('token'))

useEffect(() => {
    const handleStorageChange = () => {
      setAuth(sessionStorage.getItem('token'));
    };
     window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
      <>
     {!auth ? <Login onLogin={() => setAuth(sessionStorage.getItem('token'))} /> : <AppRoutes />}
     
      </>
    
  )

}

export default App