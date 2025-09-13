import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaChartLine, FaUsers, FaShoppingCart, FaBook, FaPalette, FaGift, 
  FaGamepad, FaNewspaper, FaCalendarAlt, FaChartPie, FaCog, FaSignOutAlt, FaWpforms 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: FaChartLine, path: '/admin' },
  { id: 'users', label: 'Usuarios', icon: FaUsers, path: '/admin/users' },
  { id: 'products', label: 'Productos', icon: FaShoppingCart, path: '/admin/products' },
  { id: 'courses', label: 'Cursos', icon: FaBook, path: '/admin/courses' },
  { id: 'blog', label: 'Blog', icon: FaNewspaper, path: '/admin/blog' },
  { id: 'forms', label: 'Formularios', icon: FaWpforms, path: '/admin/formularios' },
  { id: 'appointments', label: 'Citas', icon: FaCalendarAlt, path: '/admin/appointments' },
  { id: 'promotions', label: 'Promociones', icon: FaGift, path: '/admin/promotions' },
  { id: 'editor', label: 'Editor de Páginas', icon: FaPalette, path: '/admin/editor' },
  { id: 'analytics', label: 'Analíticas', icon: FaChartPie, path: '/admin/analytics' },
  { id: 'settings', label: 'Configuración', icon: FaCog, path: '/admin/settings' },
  { id: 'page-editor', label: 'Editor de Páginas', icon: FaPalette, path: '/admin/page-editor' },
];

const AdminLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -288 }} // width of the sidebar
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full w-72 bg-neutral-900 text-white shadow-2xl z-40 flex flex-col"
      >
        <div className="p-6 flex-shrink-0">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-light to-accent bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin'} // 'end' prop for the overview link
              className={({ isActive }) =>
                `w-full text-left p-3 rounded-lg transition-all flex items-center relative ` +
                (isActive 
                  ? 'bg-gradient-to-r from-brand to-accent shadow-lg'
                  : 'hover:bg-neutral-700/50')
              }
            >
              <item.icon className="mr-3 text-lg" />
              <span className="font-medium">{item.label}</span>
              {({ isActive }) => isActive && (
                <motion.div
                  layoutId="activeAdminTab"
                  className="absolute right-0 w-1 h-full bg-gradient-to-b from-brand-light to-accent rounded-l"
                />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 flex-shrink-0">
          <motion.button 
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-3 bg-gradient-to-r from-danger to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg flex items-center justify-center transition-all shadow-lg"
          >
            <FaSignOutAlt className="mr-2" />
            <span className="font-medium">Cerrar Sesión</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="ml-72 flex-grow p-8">
        <Outlet /> {/* Nested routes will be rendered here */}
      </main>
    </div>
  );
};

export default AdminLayout;
