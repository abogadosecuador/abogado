import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../services/apiService';

/**
 * PremiumRoute
 * Protege contenido premium validando si el usuario tiene una orden CAPTURED/COMPLETED/APROVED
 * Opcionalmente filtra por producto con el parámetro `product` (slug o texto presente en description).
 *
 * Uso:
 * <PremiumRoute product="curso-avanzado">
 *   <CursoAvanzado />
 * </PremiumRoute>
 */
const PremiumRoute = ({ children, product }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const query = product ? `?product=${encodeURIComponent(product)}` : '';
        const res = await api.get(`/payments/has-access${query}`);
        if (!mounted) return;
        setAllowed(!!res?.data?.access);
      } catch (e) {
        if (!mounted) return;
        setAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [location.pathname, product]);

  if (checking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">Verificando acceso premium...</span>
      </div>
    );
  }

  if (!allowed) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/catalogo?premium=required&redirect=${redirect}`} replace />;
  }

  return children;
};

export default PremiumRoute;
