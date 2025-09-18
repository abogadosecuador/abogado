import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/supabaseService';
import { BookOpenIcon, ShoppingCartIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

const ClientDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({ courses: [], purchases: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Obtener cursos y compras del usuario desde Supabase
        const { data: courses, error: coursesError } = await dataService.getAll('user_courses', { filters: [{ column: 'user_id', value: user.id }] });
        if (coursesError) throw coursesError;

        const { data: purchases, error: purchasesError } = await dataService.getAll('purchases', { filters: [{ column: 'user_id', value: user.id }] });
        if (purchasesError) throw purchasesError;

        setDashboardData({ courses, purchases });
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="text-center p-8">Cargando tu información...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold">Bienvenido, {user.email} 👋</h1>
        <p className="text-blue-100 mt-2">Tu portal legal personal</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Cursos</h2>
        {dashboardData.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.courses.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{course.name}</h3>
                {/* Aquí se podría añadir una barra de progreso si existiera en la DB */}
                <Link to={`/cursos/${course.id}`} className="text-blue-600 hover:underline mt-2 inline-block">Ir al curso</Link>
              </div>
            ))}
          </div>
        ) : (
          <p>Aún no te has inscrito en ningún curso.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/citas" className="text-center p-4 border rounded-lg hover:shadow-md transition-all">
            <CalendarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span>Agendar Cita</span>
          </Link>
          <Link to="/cursos" className="text-center p-4 border rounded-lg hover:shadow-md transition-all">
            <BookOpenIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <span>Ver Cursos</span>
          </Link>
          <Link to="/tienda" className="text-center p-4 border rounded-lg hover:shadow-md transition-all">
            <ShoppingCartIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <span>Tienda</span>
          </Link>
          <Link to="/perfil" className="text-center p-4 border rounded-lg hover:shadow-md transition-all">
            <UserIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <span>Mi Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
