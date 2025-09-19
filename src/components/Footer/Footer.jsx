import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AE</span>
              </div>
              <span className="text-xl font-bold">AbogadosEcuador</span>
            </div>
            <p className="text-gray-400 text-sm">
              Servicios legales profesionales con más de 15 años de experiencia. 
              Tu confianza, nuestra prioridad.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-500 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/productos/servicios" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Servicios Legales
                </Link>
              </li>
              <li>
                <Link to="/productos/consultoria" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Consultoría
                </Link>
              </li>
              <li>
                <Link to="/cursos" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cursos Online
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Blog Legal
                </Link>
              </li>
              <li>
                <Link to="/comunidad" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Comunidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/politicas/privacidad" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/politicas/terminos" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/politicas/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link to="/politicas/reembolso" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Política de Reembolso
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Av. Principal 123, Quito, Ecuador
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href="tel:+593999999999" className="text-gray-400 hover:text-white transition-colors text-sm">
                  +593 99 999 9999
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaWhatsapp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href="https://wa.me/593999999999" target="_blank" rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href="mailto:info@abogadosecuador.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                  info@abogadosecuador.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Suscríbete a nuestro Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Recibe las últimas noticias legales y actualizaciones directamente en tu correo.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
              >
                Suscribir
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} AbogadosEcuador. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;