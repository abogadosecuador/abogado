import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaUsers, FaUserGraduate, FaChartPie, FaRocket } from 'react-icons/fa';

// Datos de ejemplo, se reemplazarán con datos reales de la API
const dashboardCards = [
  { title: 'Ventas del Mes', value: '$0', change: '+0%', icon: FaDollarSign, color: 'from-green-400 to-green-600' },
  { title: 'Usuarios Nuevos', value: '0', change: '+0%', icon: FaUsers, color: 'from-blue-400 to-blue-600' },
  { title: 'Cursos Vendidos', value: '0', change: '+0%', icon: FaUserGraduate, color: 'from-purple-400 to-purple-600' },
  { title: 'Tasa de Conversión', value: '0%', change: '+0%', icon: FaChartPie, color: 'from-orange-400 to-orange-600' }
];

const AdminOverview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800">Overview</h2>
        <p className="text-gray-500 mt-1">Un resumen del rendimiento de tu plataforma.</p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.05 }}
            className={`relative overflow-hidden rounded-2xl shadow-xl text-white p-6 bg-gradient-to-br ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="opacity-80 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
                <p className={`opacity-60 text-sm mt-2 flex items-center`}>
                  <span>{card.change}</span>
                  <span className="ml-2">vs mes anterior</span>
                </p>
              </div>
              <card.icon className="opacity-30 text-5xl" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placeholder para más widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h3>
          <p className="text-gray-500">Próximamente: Un feed en tiempo real de las acciones más importantes.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
          <p className="text-gray-500">Próximamente: Botones para las tareas más comunes.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminOverview;
