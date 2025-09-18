import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <FaExclamationTriangle className="text-yellow-400 text-6xl mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Error 404 - Página No Encontrada</h1>
      <p className="text-lg text-gray-600 mb-6">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
      <Link 
        to="/"
        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
      >
        <FaHome className="mr-2" />
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
