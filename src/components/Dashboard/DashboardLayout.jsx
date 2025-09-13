import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaBook, FaCoins, FaUsers, FaCreditCard, FaSignOutAlt, FaShieldAlt, FaStar, FaGamepad, FaBrain } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const userNavLinks = [
  { name: 'Resumen', path: '/dashboard', icon: <FaHome /> },
  { name: 'Mi Perfil', path: '/dashboard/perfil', icon: <FaUser /> },
  { name: 'Mis Cursos', path: '/dashboard/mis-cursos', icon: <FaBook /> },
  { name: 'Mis Compras', path: '/dashboard/compras', icon: <FaCreditCard /> },
  { name: 'Mis Tokens', path: '/dashboard/tokens', icon: <FaCoins /> },
  { name: 'Referidos', path: '/dashboard/referidos', icon: <FaUsers /> },
  { name: 'Suscripción', path: '/dashboard/suscripcion', icon: <FaStar /> },
  { name: 'Trivia Diaria', path: '/dashboard/trivia', icon: <FaGamepad /> },
  { name: 'Consulta IA', path: '/dashboard/consulta-ia', icon: <FaBrain /> },
];

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <img className="h-10 w-auto" src="/icons/favicon.svg" alt="Logo" />
          <span className="ml-2 text-xl font-semibold text-neutral-800">Mi Cuenta</span>
        </div>
        
        <div className="mt-5 px-4 py-3 border-t border-b">
          <p className="text-sm font-medium text-neutral-900">{user?.user_metadata?.full_name || user?.email}</p>
          <p className="text-xs text-neutral-500">{user?.role || 'Cliente'}</p>
        </div>
        
        <nav className="mt-3 flex-1 px-2">
          <div className="space-y-1">
            {userNavLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/dashboard'}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ` +
                  (isActive ? 'bg-brand/10 text-brand' : 'text-neutral-600 hover:bg-neutral-100')
                }
              >
                <div className="mr-3 text-lg">{link.icon}</div>
                {link.name}
              </NavLink>
            ))}
            
            {hasRole('admin') && (
              <NavLink
                to="/admin"
                className="text-neutral-600 hover:bg-neutral-100 group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-4"
              >
                <FaShieldAlt className="mr-3 text-lg" />
                Panel de Admin
              </NavLink>
            )}
          </div>
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t p-4">
        <button
          onClick={logout}
          className="flex items-center text-sm font-medium text-danger w-full"
        >
          <FaSignOutAlt className="mr-3 text-lg" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  // Este componente ahora es un layout puro que renderiza la sidebar y el contenido anidado.
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="py-8 px-4 sm:px-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
