import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaGavel, 
  FaFileContract, 
  FaBuilding, 
  FaCar, 
  FaShip,
  FaBalanceScale,
  FaUserTie,
  FaHandshake,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaStar
} from 'react-icons/fa';

const ServicesOverview = () => {
  const services = [
    {
      id: 'penal',
      title: 'Derecho Penal',
      description: 'Defensa legal completa en procesos penales con estrategias personalizadas',
      icon: <FaGavel />,
      color: 'from-red-500 to-red-600',
      features: ['Defensa 24/7', 'Casos urgentes', 'Alta tasa de éxito'],
      price: 'Desde $150',
      link: '/servicios/penal',
      popular: true
    },
    {
      id: 'civil',
      title: 'Derecho Civil',
      description: 'Asesoría en contratos, propiedades, sucesiones y obligaciones',
      icon: <FaFileContract />,
      color: 'from-blue-500 to-blue-600',
      features: ['Contratos', 'Divorcios', 'Sucesiones'],
      price: 'Desde $120',
      link: '/servicios/civil'
    },
    {
      id: 'comercial',
      title: 'Derecho Comercial',
      description: 'Servicios legales para empresas y emprendedores',
      icon: <FaBuilding />,
      color: 'from-purple-500 to-purple-600',
      features: ['Constitución empresas', 'Contratos mercantiles', 'Startups'],
      price: 'Desde $180',
      link: '/servicios/comercial'
    },
    {
      id: 'transito',
      title: 'Derecho de Tránsito',
      description: 'Representación en infracciones y accidentes de tránsito',
      icon: <FaCar />,
      color: 'from-yellow-500 to-yellow-600',
      features: ['Multas', 'Accidentes', 'Licencias'],
      price: 'Desde $100',
      link: '/servicios/transito'
    },
    {
      id: 'aduanero',
      title: 'Derecho Aduanero',
      description: 'Especialistas en normativa aduanera e importaciones',
      icon: <FaShip />,
      color: 'from-indigo-500 to-indigo-600',
      features: ['Importaciones', 'Exportaciones', 'Aranceles'],
      price: 'Desde $200',
      link: '/servicios/aduanas'
    },
    {
      id: 'consultoria',
      title: 'Consultoría Legal',
      description: 'Asesoría legal integral para todas tus necesidades',
      icon: <FaBalanceScale />,
      color: 'from-green-500 to-green-600',
      features: ['Asesoría general', 'Revisión documentos', 'Opinión legal'],
      price: 'Desde $80',
      link: '/consultas'
    }
  ];

  const stats = [
    { number: '500+', label: 'Casos Exitosos', icon: <FaCheckCircle /> },
    { number: '10+', label: 'Años Experiencia', icon: <FaClock /> },
    { number: '98%', label: 'Satisfacción', icon: <FaStar /> },
    { number: '24/7', label: 'Disponibilidad', icon: <FaShieldAlt /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Servicios Legales Profesionales
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Soluciones jurídicas integrales con más de 10 años de experiencia
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/consultas"
                className="px-8 py-4 bg-white text-blue-900 font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Consulta Gratuita
              </Link>
              <Link
                to="/contacto"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-900 transition-all"
              >
                Contactar Ahora
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl text-blue-600 mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Áreas de Práctica
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos servicios especializados en múltiples áreas del derecho
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <Link to={service.link}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                    {service.popular && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          Popular
                        </span>
                      </div>
                    )}
                    
                    <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                    
                    <div className="p-6">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${service.color} text-white flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                        {service.icon}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        {service.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-lg font-bold text-blue-600">
                          {service.price}
                        </span>
                        <span className="text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                          Ver más →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FaHandshake className="text-6xl mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              ¿Necesitas Asesoría Legal?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Agenda una consulta gratuita y recibe orientación profesional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/consultas"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Agendar Consulta
              </Link>
              <a
                href="https://wa.me/593988835269"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <FaUserTie /> WhatsApp Directo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              ¿Por qué elegirnos?
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <FaShieldAlt className="text-5xl text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Confidencialidad Total</h4>
              <p className="text-gray-600">
                Garantizamos absoluta privacidad en todos los casos
              </p>
            </div>
            <div className="text-center">
              <FaClock className="text-5xl text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Respuesta Rápida</h4>
              <p className="text-gray-600">
                Atención inmediata y disponibilidad 24/7 para urgencias
              </p>
            </div>
            <div className="text-center">
              <FaStar className="text-5xl text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Experiencia Comprobada</h4>
              <p className="text-gray-600">
                Más de 500 casos resueltos exitosamente
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesOverview;
