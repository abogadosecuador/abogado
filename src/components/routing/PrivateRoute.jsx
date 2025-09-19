import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/supabaseService';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('authToken');
    if (!token) {
      setAuthorized(false);
      setChecking(false);
      return;
    }
    (async () => {
      try {
        const res = await authService.getUser();
        if (mounted) {
          if (res?.data?.user) {
            setAuthorized(true);
          } else {
            setAuthorized(false);
          }
          setChecking(false);
        }
      } catch (error) {
        if (mounted) {
          setAuthorized(false);
          setChecking(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">Verificando sesión...</span>
      </div>
    );
  }

  if (!authorized) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
};

export default PrivateRoute;
