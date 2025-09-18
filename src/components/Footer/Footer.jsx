import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { dataService } from '../../services/supabaseService';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (window.__APP_CONFIG__) {
      setConfig({
        address: window.__APP_CONFIG__.CONTACT_ADDRESS || '',
        phone: window.__APP_CONFIG__.WHATSAPP_NUMBER || '',
        email: window.__APP_CONFIG__.CONTACT_EMAIL || '',
        facebookUrl: window.__APP_CONFIG__.FACEBOOK_URL,
        twitterUrl: window.__APP_CONFIG__.TWITTER_URL,
        instagramUrl: window.__APP_CONFIG__.INSTAGRAM_URL,
        linkedinUrl: window.__APP_CONFIG__.LINKEDIN_URL,
      });
    }
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error('Por favor, ingrese un correo electrónico.');
      return;
    }
    setSubmitting(true);
    const promise = dataService.create('newsletter_subscriptions', { email: newsletterEmail });
    toast.promise(promise, {
      loading: 'Suscribiendo...',
      success: '¡Gracias por suscribirte!',
      error: 'No se pudo suscribir. Inténtalo de nuevo.'
    });
    await promise;
    setNewsletterEmail('');
    setSubmitting(false);
  };

  return (
    <footer className="bg-gray-900 text-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Contacto</h3>
            <ul className="space-y-3">
              {config.address && <li className="flex items-start"><FaMapMarkerAlt className="text-blue-400 mt-1 mr-3" /><span>{config.address}</span></li>}
              {config.phone && <li className="flex items-center"><FaPhoneAlt className="text-blue-400 mr-3" /><a href={`tel:${config.phone}`} className="hover:text-blue-400">{config.phone}</a></li>}
              {config.email && <li className="flex items-center"><FaEnvelope className="text-blue-400 mr-3" /><a href={`mailto:${config.email}`} className="hover:text-blue-400">{config.email}</a></li>}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Enlaces</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-blue-400">Inicio</Link></li>
              <li><Link to="/servicios" className="hover:text-blue-400">Servicios</Link></li>
              <li><Link to="/catalogo" className="hover:text-blue-400">Catálogo</Link></li>
              <li><Link to="/blog" className="hover:text-blue-400">Blog</Link></li>
              <li><Link to="/contacto" className="hover:text-blue-400">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Suscríbete</h3>
            <form onSubmit={handleNewsletterSubmit}>
              <input type="email" placeholder="Tu correo" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700" required />
              <button type="submit" disabled={submitting} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">{submitting ? 'Enviando...' : 'Suscribirse'}</button>
            </form>
            <div className="flex mt-4 space-x-4">
              {config.facebookUrl && <a href={config.facebookUrl}><FaFacebook /></a>}
              {config.twitterUrl && <a href={config.twitterUrl}><FaTwitter /></a>}
              {config.instagramUrl && <a href={config.instagramUrl}><FaInstagram /></a>}
              {config.linkedinUrl && <a href={config.linkedinUrl}><FaLinkedin /></a>}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center">
          <p>&copy; {currentYear} Abg. Wilson Alexander Ipiales Guerron. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
