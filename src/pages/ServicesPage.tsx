import React from 'react';

const ServicesPage = () => {
  const services = [
    {
      title: 'Derecho Civil',
      description: 'Contratos, divorcios, herencias y más',
      icon: '⚖️'
    },
    {
      title: 'Derecho Penal',
      description: 'Defensa penal y asesoría legal',
      icon: '🛡️'
    },
    {
      title: 'Derecho Laboral',
      description: 'Conflictos laborales y despidos',
      icon: '👥'
    },
    {
      title: 'Derecho Comercial',
      description: 'Constitución de empresas y contratos',
      icon: '🏢'
    },
    {
      title: 'Tránsito',
      description: 'Accidentes de tránsito y multas',
      icon: '🚗'
    },
    {
      title: 'Consultas Generales',
      description: 'Asesoría legal en diversas áreas',
      icon: '💬'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Nuestros Servicios
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Consultar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
