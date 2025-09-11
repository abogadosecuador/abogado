import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    servicios: [
      { name: 'Derecho Penal', href: '/servicios/penal' },
      { name: 'Derecho Civil', href: '/servicios/civil' },
      { name: 'Derecho Comercial', href: '/servicios/comercial' },
      { name: 'Derecho Laboral', href: '/servicios/laboral' },
      { name: 'Derecho de Tránsito', href: '/servicios/transito' }
    ],
    recursos: [
      { name: 'Blog Legal', href: '/blog' },
      { name: 'Cursos Online', href: '/cursos' },
      { name: 'E-books', href: '/ebooks' },
      { name: 'Newsletter', href: '/newsletter' },
      { name: 'Foro Legal', href: '/foro' }
    ],
    empresa: [
      { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
      { name: 'Nuestro Equipo', href: '/equipo' },
      { name: 'Testimonios', href: '/testimonios' },
      { name: 'Afiliados', href: '/afiliados' },
      { name: 'Contacto', href: '/contacto' }
    ],
    legal: [
      { name: 'Términos y Condiciones', href: '/terminos' },
      { name: 'Política de Privacidad', href: '/privacidad' },
      { name: 'Política de Cookies', href: '/cookies' },
      { name: 'Aviso Legal', href: '/aviso-legal' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/abogadosecuador', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/abogadosec', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/abogadosecuador', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/abogadosecuador', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Abogados Ecuador</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Soluciones legales profesionales con más de 15 años de experiencia en Ecuador.
            </p>
            <div className="space-y-2">
              <a href="tel:+59398835269" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+593 98 835 269</span>
              </a>
              <a href="mailto:Wifirmalegal@gmail.com" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Wifirmalegal@gmail.com</span>
              </a>
              <div className="flex items-start space-x-2 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span className="text-sm">Quito, Ecuador</span>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="max-w-md mx-auto text-center lg:text-left lg:mx-0">
            <h3 className="text-lg font-semibold mb-2">Suscríbete a nuestro Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Recibe las últimas noticias legales y actualizaciones directamente en tu correo.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          {/* Social Links */}
          <div className="flex space-x-4 mb-4 md:mb-0">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              © {currentYear} Abogados Ecuador. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Desarrollado con ❤️ en Ecuador
            </p>
          </div>
        </div>
      </div>

      {/* PWA Install Banner */}
      <div id="pwa-install-banner" className="hidden bg-blue-600 text-white py-2 px-4 text-center">
        <p className="text-sm">
          Instala nuestra app para acceso rápido 
          <button className="ml-2 underline">Instalar ahora</button>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
