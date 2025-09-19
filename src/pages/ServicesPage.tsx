import React, { useState, useEffect } from 'react';
import { ScaleIcon, UserGroupIcon, TruckIcon, BuildingOfficeIcon, HeartIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { dataService } from '../services/supabaseService';

const iconMap = {
  civil: ScaleIcon,
  penal: UserGroupIcon,
  transito: TruckIcon,
  laboral: BuildingOfficeIcon,
  comercial: DocumentTextIcon,
  familia: HeartIcon,
  default: ScaleIcon,
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: servicesData, error: servicesError } = await dataService.getAll('services');
        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        const { data: testimonialsData, error: testimonialsError } = await dataService.getAll('testimonials');
        if (testimonialsError) throw testimonialsError;
        setTestimonials(testimonialsData || []);
      } catch (error) {
        console.error('Error al cargar los datos de la página de servicios:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Servicios Legales Profesionales
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Asesoría legal especializada en todas las áreas del derecho ecuatoriano. 
              Soluciones efectivas y profesionales para proteger sus derechos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Consulta Gratuita
              </Link>
              <Link
                to="/calendar"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Agendar Cita
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestros Servicios Legales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ofrecemos asesoría legal integral en todas las áreas del derecho, 
            con la experiencia y profesionalismo que su caso requiere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
              service.popular ? 'border-blue-500' : 'border-transparent'
            }`}>
              {service.popular && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  ⭐ Más Popular
                </div>
              )}
              <div className="p-6">
                <div className={`w-16 h-16 ${service.color} rounded-lg flex items-center justify-center mb-4`}>
                  {React.createElement(iconMap[service.icon_key] || iconMap.default, { className: 'w-8 h-8 text-white' })}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {service.duration}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">${service.price}</div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Incluye:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <Link
                    to={`/services/${service.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block font-semibold"
                  >
                    Ver Detalles
                  </Link>
                  <Link
                    to="/calendar"
                    className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-center block font-semibold"
                  >
                    Agendar Consulta
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonios */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600">
              Testimonios reales de clientes satisfechos con nuestros servicios legales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.898 3.445 1.43-8.314L.489 6.76l8.451-.98L10 0l1.561 5.78 8.451.98-4.043 3.771 1.43 8.314L10 15z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-xs text-blue-600">{testimonial.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Necesita Asesoría Legal?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            No espere más. Nuestro equipo de abogados expertos está listo para ayudarle 
            a resolver su caso legal de manera profesional y efectiva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Contactar Ahora
            </Link>
            <Link
              to="/calendar"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Agendar Consulta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
