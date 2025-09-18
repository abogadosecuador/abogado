import React, { useState, useEffect } from 'react';
import { FaUsers, FaChartLine, FaShoppingCart, FaBook, FaNewspaper, FaCog, FaPalette, FaGift, FaGamepad, FaComments, FaRocket, FaChartPie } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { dataService } from '../../services/supabaseService';
import CourseManager from './Admin/CourseManager'; // Importar el gestor de cursos

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, totalProducts: 0, totalCourses: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: users } = await dataService.getAll('users');
        const { data: products } = await dataService.getAll('products');
        const { data: courses } = await dataService.getAll('courses');
        // Simulación de ingresos y actividades por ahora
        setStats({ totalUsers: users.length, totalProducts: products.length, totalCourses: courses.length, totalRevenue: 50000 });
        setRecentActivities([{ id: 1, user: 'Admin', action: 'Dashboard cargado', time: 'Ahora' }]);
      } catch (error) {
        toast.error('No se pudieron cargar los datos del dashboard.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'Usuarios', icon: FaUsers },
    { id: 'products', label: 'Productos', icon: FaShoppingCart },
    { id: 'courses', label: 'Cursos', icon: FaBook },
    { id: 'editor', label: 'Editor de Páginas', icon: FaPalette },
    { id: 'promotions', label: 'Promociones', icon: FaGift },
    { id: 'gamification', label: 'Gamificación', icon: FaGamepad },
    { id: 'blog', label: 'Blog', icon: FaNewspaper },
    { id: 'settings', label: 'Configuración', icon: FaCog },
  ];

  if (loading) return <div className="p-8">Cargando Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <motion.div initial={{ x: -250 }} animate={{ x: 0 }} className="w-72 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Admin Pro</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {menuItems.map(item => (
            <motion.button key={item.id} onClick={() => setActiveTab(item.id)} whileHover={{ x: 5 }} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
              <item.icon className="mr-3" />
              {item.label}
            </motion.button>
          ))}
        </nav>
        <div className="p-4">
          <button className="w-full flex items-center p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors">
            <FaSignOutAlt className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </motion.div>

      <main className="flex-1 p-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{menuItems.find(i => i.id === activeTab)?.label}</h2>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Usuarios Totales" value={stats.totalUsers} icon={FaUsers} color="blue" />
                  <StatCard title="Ingresos Totales" value={`$${stats.totalRevenue.toLocaleString()}`} icon={FaChartLine} color="green" />
                  <StatCard title="Productos" value={stats.totalProducts} icon={FaShoppingCart} color="purple" />
                  <StatCard title="Cursos" value={stats.totalCourses} icon={FaBook} color="orange" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">Contenido de Gráficos...</div>
                  <div className="bg-white p-6 rounded-lg shadow-md">Actividad Reciente...</div>
                </div>
              </div>
            )}
            {/* Aquí se añadirían los componentes para las otras pestañas */}
            {activeTab === 'courses' && <CourseManager />}
            {/* Añadir aquí los componentes para las otras pestañas cuando se creen */}
            {activeTab !== 'overview' && activeTab !== 'courses' && <div className="bg-white p-6 rounded-lg shadow-md">Gestión de {activeTab}...</div>}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-gradient-to-br from-${color}-500 to-${color}-600 text-white p-6 rounded-xl shadow-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <Icon className="text-5xl opacity-30" />
    </div>
  </div>
);

export default AdminDashboard;
