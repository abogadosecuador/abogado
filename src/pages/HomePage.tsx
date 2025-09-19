import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Abogados Ecuador
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Servicios legales profesionales para todos tus necesidades
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="#/servicios"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Ver Servicios
            </a>
            <a
              href="#/contacto"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition"
            >
              Contactar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
