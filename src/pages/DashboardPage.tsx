import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/supabaseService';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import ClientDashboard from '../components/Dashboard/ClientDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          // Lógica para verificar el rol del usuario desde Supabase
          const { data, error } = await dataService.getById('profiles', user.id);
          if (error) throw error;

          // Asumimos que el perfil tiene un campo 'role'
          if (data && data.role === 'admin') {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Error al verificar el rol del usuario:', error);
        }
      }
      setLoading(false);
    };

    checkUserRole();
  }, [user]);

  if (loading) {
    return <div className="text-center p-8">Cargando dashboard...</div>;
  }

  // Renderiza el dashboard correspondiente según el rol
  return isAdmin ? <AdminDashboard /> : <ClientDashboard user={user} />;
};

export default DashboardPage;

export default DashboardPage;
