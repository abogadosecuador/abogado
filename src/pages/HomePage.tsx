import React from 'react';
import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { Shield, Users, Briefcase, Scale, BookOpen, CreditCard, Phone, Mail } from 'lucide-react';

const HomePage: React.FC = () => {
  const services = [
    {
      icon: <Scale className="w-6 h-6" />,
      title: 'Derecho Penal',
      description: 'Defensa legal especializada en casos penales con experiencia comprobada.',
      link: '/services/penal'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Derecho Civil',
      description: 'Asesoría integral en contratos, familia, sucesiones y propiedad.',
      link: '/services/civil'
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Derecho Comercial',
      description: 'Soluciones jurídicas para empresas y emprendedores.',
      link: '/services/comercial'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Derecho de Tránsito',
      description: 'Representación legal en casos de tránsito y accidentes.',
      link: '/services/transito'
    }
  ];


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Soluciones Legales
            <TypeAnimation
              sequence={[
                ' Profesionales', 2000,
                ' Confiables', 2000,
                ' Efectivas', 2000,
              ]}
              wrapper="span"
              speed={50}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
              repeat={Infinity}
            />
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Abogado Wilson Ipiales - Más de 5 años de experiencia defendiendo sus derechos con 
            profesionalismo y dedicación. Su tranquilidad es nuestra prioridad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Consulta Gratuita
            </Link>
            <Link
              to="/services"
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all"
            >
              Ver Servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Áreas de Especialización</h2>
            <p className="text-xl text-gray-600">Experiencia comprobada en las áreas más importantes del derecho</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegirnos?</h2>
            <p className="text-xl text-gray-600">Compromiso, experiencia y resultados comprobados</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Experiencia Comprobada</h3>
              <p className="text-gray-600">Más de 5 años defendiendo exitosamente a nuestros clientes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Atención Personalizada</h3>
              <p className="text-gray-600">Cada caso recibe la dedicación y atención que merece</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparencia Total</h3>
              <p className="text-gray-600">Comunicación clara y honesta en cada etapa del proceso</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">¿Necesita asesoría legal?</h2>
          <p className="text-xl text-blue-100 mb-8">Contáctenos hoy mismo para una consulta gratuita</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+593988835269"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-xl transition-all"
            >
              <Phone className="w-5 h-5 mr-2" />
              +593 98 883 5269
            </a>
            <a
              href="mailto:Wifirmalegal@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all"
            >
              <Mail className="w-5 h-5 mr-2" />
              Wifirmalegal@gmail.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;