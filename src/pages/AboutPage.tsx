import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Sobre Nosotros
        </h1>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 mb-6">
            Somos un equipo de abogados especializados en diversas áreas del derecho, 
            comprometidos con brindar servicios legales de calidad a nuestros clientes.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            Con años de experiencia en el sistema judicial ecuatoriano, ofrecemos 
            asesoría legal integral en derecho civil, penal, laboral, comercial y más.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Experiencia</h3>
              <p className="text-gray-600">Más de 10 años de experiencia legal</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Profesionalismo</h3>
              <p className="text-gray-600">Abogados certificados y especializados</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Resultados</h3>
              <p className="text-gray-600">Casos exitosos y clientes satisfechos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
