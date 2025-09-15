import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  BriefcaseIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ServicioLaboralPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedService, setSelectedService] = useState(null);

  const handleAddToCart = (service) => {
    addToCart({
      id: service.id,
      name: service.title,
      price: service.price,
      type: 'service',
      category: 'Derecho Laboral',
      description: service.description
    });
    toast.success(`${service.title} agregado al carrito`);
  };

  const services = [
    {
      id: 'despido-intempestivo',
      title: 'Demanda por Despido Intempestivo',
      description: 'Reclamación de indemnizaciones por terminación injustificada del contrato.',
      price: 650,
      features: [
        'Análisis de liquidación',
        'Demanda laboral',
        'Audiencias y negociación',
        'Ejecución de sentencia'
      ],
      icon: <BriefcaseIcon className="h-8 w-8" />,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'beneficios-sociales',
      title: 'Reclamación de Beneficios Sociales',
      description: 'Cálculo y cobro de décimos, vacaciones y horas extras no pagadas.',
      price: 500,
      features: [
        'Cálculo integral',
        'Conciliación previa',
        'Demanda por diferencias',
        'Ejecución de planillas'
      ],
      icon: <DocumentTextIcon className="h-8 w-8" />,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'visto-bueno',
      title: 'Visto Bueno y Desahucio',
      description: 'Patrocinio en procesos administrativos ante el Ministerio del Trabajo.',
      price: 450,
      features: [
        'Trámite administrativo',
        'Audiencia y pruebas',
        'Recursos administrativos',
        'Plan de salida'
      ],
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'contratos-laborales',
      title: 'Contratos Laborales',
      description: 'Redacción y actualización de contratos, reglamentos y políticas internas.',
      price: 400,
      features: [
        'Contratos individuales',
        'Contratos especiales',
        'Reglamentos internos',
        'Políticas de cumplimiento'
      ],
      icon: <UserGroupIcon className="h-8 w-8" />,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const handlePayment = (service) => {
    handleAddToCart(service);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-r from-yellow-900 to-yellow-700 text-white py-24"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Derecho Laboral</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Asesoría en relaciones laborales para empleadores y trabajadores.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              className="bg-white text-yellow-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Ver Servicios
            </motion.button>
          </div>
        </div>
      </motion.section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Servicios Laborales</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Seleccione el servicio que necesita y proceda a contratar o agregar al carrito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`relative bg-white rounded-xl shadow-lg overflow-hidden`}
              onClick={() => setSelectedService(service)}
            >
              <div className={`h-2 bg-gradient-to-r ${service.color}`} />
              <div className="p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${service.color} text-white mb-4`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(service.price)}
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(service); }}
                    className="flex-1 py-3 rounded-lg font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    Agregar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handlePayment(service); }}
                    className={`flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${service.color} hover:shadow-lg transition-all`}
                  >
                    Contratar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServicioLaboralPage;
