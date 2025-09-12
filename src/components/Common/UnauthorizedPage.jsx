import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaHome, FaSignInAlt, FaUserPlus, FaShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getUserRole } = useAuth();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  const goToRegister = () => {
    navigate('/register');
  };

  const goToDashboard = () => {
    const role = getUserRole();
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icono de acceso denegado */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <FaLock className="text-6xl text-red-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <FaShield className="text-2xl text-orange-600" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-yellow-600">!</span>
            </div>
          </div>
        </div>

        {/* Título y descripción */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Acceso Denegado
          </span>
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
          403 - No tienes permisos
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
          Lo sentimos, no tienes permisos para acceder a esta página. 
          {isAuthenticated() 
            ? ' Tu cuenta no tiene los privilegios necesarios para esta funcionalidad.'
            : ' Debes iniciar sesión para acceder a esta área.'
          }
        </p>

        {/* Acciones según el estado de autenticación */}
        {isAuthenticated() ? (
          <div className="space-y-6">
            {/* Usuario autenticado pero sin permisos */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Tu cuenta actual
              </h3>
              <p className="text-yellow-700 mb-4">
                Has iniciado sesión como <strong>{getUserRole()}</strong>, pero necesitas permisos adicionales.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={goToDashboard}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  <FaHome className="mr-2" />
                  Ir a mi Dashboard
                </button>
                
                <Link
                  to="/contacto"
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  Solicitar Acceso
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Usuario no autenticado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Acceso requerido
              </h3>
              <p className="text-blue-700 mb-4">
                Para acceder a esta funcionalidad, necesitas crear una cuenta o iniciar sesión.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={goToLogin}
                  className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                >
                  <FaSignInAlt className="mr-2" />
                  Iniciar Sesión
                </button>
                
                <button
                  onClick={goToRegister}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  <FaUserPlus className="mr-2" />
                  Crear Cuenta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Acciones generales */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={goBack}
            className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            Volver atrás
          </button>
          
          <button
            onClick={goHome}
            className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
          >
            <FaHome className="mr-2" />
            Ir al inicio
          </button>
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            ¿Por qué ocurre esto?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">
                  <strong>Permisos insuficientes:</strong> Tu cuenta no tiene los privilegios necesarios.
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">
                  <strong>Área restringida:</strong> Esta funcionalidad es solo para usuarios específicos.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">
                  <strong>Cuenta no verificada:</strong> Tu cuenta puede necesitar verificación.
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">
                  <strong>Suscripción requerida:</strong> Puede ser una funcionalidad premium.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enlaces de ayuda */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            ¿Necesitas ayuda?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/contacto"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-blue-700 font-medium"
            >
              Contactar Soporte
            </Link>
            
            <Link
              to="/faq"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 text-green-700 font-medium"
            >
              Preguntas Frecuentes
            </Link>
            
            <Link
              to="/terminos-condiciones"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-purple-700 font-medium"
            >
              Términos y Condiciones
            </Link>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 text-center text-gray-500">
          <p className="mb-2">
            Para solicitar acceso o resolver problemas:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a
              href="mailto:soporte@abogadowilson.com"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              soporte@abogadowilson.com
            </a>
            <a
              href="https://wa.me/593988352269"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              WhatsApp: +593 98 883 5269
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
