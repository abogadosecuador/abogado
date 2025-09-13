import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaCreditCard, FaUserEdit, FaCoins } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const quickLinks = [
  { name: 'Editar Perfil', path: '/dashboard/perfil', icon: FaUserEdit, color: 'bg-blue-500' },
  { name: 'Mis Compras', path: '/dashboard/compras', icon: FaCreditCard, color: 'bg-green-500' },
  { name: 'Mis Cursos', path: '/dashboard/mis-cursos', icon: FaBook, color: 'bg-purple-500' },
  { name: 'Comprar Tokens', path: '/dashboard/tokens', icon: FaCoins, color: 'bg-yellow-500' },
];

const DashboardOverview = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user?.user_metadata?.full_name || 'Usuario'}</h1>
        <p className="text-gray-500 mt-1">Aquí tienes un resumen de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((link, index) => (
          <motion.div key={index} whileHover={{ y: -5, scale: 1.05 }}>
            <Link to={link.path} className={`block p-6 rounded-2xl shadow-lg text-white ${link.color}`}>
              <link.icon className="text-3xl mb-4 opacity-75" />
              <h3 className="font-bold text-lg">{link.name}</h3>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Placeholder for more widgets */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h3>
        <p className="text-gray-500">Próximamente: Un resumen de tus últimas compras y cursos iniciados.</p>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
