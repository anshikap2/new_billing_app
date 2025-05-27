import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token && window.location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [navigate]);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;

