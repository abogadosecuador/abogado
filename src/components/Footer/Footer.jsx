import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Información de contacto */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b border-blue-500 pb-2">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <span>Juan José Flores 4-73 y Vicente Rocafuerte, Ibarra, Ecuador</span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="text-blue-400 mr-3 flex-shrink-0" />
                <a href="tel:+593988835269" className="hover:text-blue-400 transition-colors">
                  +593 988 835 269
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-blue-400 mr-3 flex-shrink-0" />
                <a href="mailto:alexip2@hotmail.com" className="hover:text-blue-400 transition-colors">
                  alexip2@hotmail.com
                </a>
              </li>
            </ul>
          </div>
          
          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b border-blue-500 pb-2">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-blue-400 transition-colors">Servicios</Link>
              </li>
              <li>
                <Link to="/consultas" className="hover:text-blue-400 transition-colors">Consultas</Link>
              </li>
              <li>
                <Link to="/ebooks" className="hover:text-blue-400 transition-colors">Ebooks</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-blue-400 transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-blue-400 transition-colors">Contacto</Link>
              </li>
            </ul>
          </div>
          
          {/* Servicios legales */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b border-blue-500 pb-2">Servicios Legales</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/servicios/penal" className="hover:text-blue-400 transition-colors">Derecho Penal</Link>
              </li>
              <li>
                <Link to="/servicios/civil" className="hover:text-blue-400 transition-colors">Derecho Civil</Link>
              </li>
              <li>
                <Link to="/servicios/comercial" className="hover:text-blue-400 transition-colors">Derecho Comercial</Link>
              </li>
              <li>
                <Link to="/servicios/transito" className="hover:text-blue-400 transition-colors">Derecho de Tránsito</Link>
              </li>
              <li>
                <Link to="/servicios/aduanas" className="hover:text-blue-400 transition-colors">Derecho Aduanero</Link>
              </li>
            </ul>
          </div>
          
          {/* Suscripción */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white border-b border-blue-500 pb-2">Suscríbete</h3>
            <p className="mb-4">Recibe noticias legales y actualizaciones importantes directamente en tu correo electrónico.</p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border border-gray-700" 
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Suscribirse
              </button>
            </form>
            <div className="flex mt-4 space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-500 transition-colors">
                <FaFacebook className="text-xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-500 transition-colors">
                <FaTwitter className="text-xl" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-500 transition-colors">
                <FaInstagram className="text-xl" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary-500 transition-colors">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Links adicionales y copyright */}
        <div className="border-t border-secondary-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-wrap justify-center md:justify-start space-x-4 mb-4 md:mb-0">
            <Link to="/privacidad" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Política de Privacidad</Link>
            <Link to="/terminos" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Términos y Condiciones</Link>
            <Link to="/afiliados" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Programa de Afiliados</Link>
            <Link to="/referidos" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Referidos</Link>
          </div>
          <p className="text-gray-400 text-sm text-center">
            {currentYear} Abg. Wilson Alexander Ipiales Guerron. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
