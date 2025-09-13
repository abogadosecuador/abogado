import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaUsers, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const api = {
  getAuthToken: () => localStorage.getItem('authToken'),

  getSubmissions: async (type) => {
    const resource = type === 'contact' ? 'contact-submissions' : 'newsletter-subscribers';
    const token = api.getAuthToken();
    const response = await fetch(`/api/admin/${resource}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Failed to fetch ${type}`);
    }
    const data = await response.json();
    return data.data || [];
  },
};

const FormSubmissions = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await api.getSubmissions(activeTab);
        setSubmissions(data);
      } catch (err) {
        toast.error('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const renderContent = () => {
    if (loading) return <p>Cargando...</p>;

    if (activeTab === 'contact') {
      return (
        <table className="min-w-full bg-white">
          <thead className="bg-neutral-100">
            <tr>
              <th className="py-3 px-6 text-left">Nombre</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Asunto</th>
              <th className="py-3 px-6 text-left">Fecha</th>
              <th className="py-3 px-6 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {submissions.map(sub => (
              <tr key={sub.id} className={`${!sub.is_read ? 'font-bold' : ''}`}>
                <td className="py-4 px-6">{sub.name}</td>
                <td className="py-4 px-6">{sub.email}</td>
                <td className="py-4 px-6">{sub.subject}</td>
                <td className="py-4 px-6">{new Date(sub.submitted_at).toLocaleString()}</td>
                <td className="py-4 px-6">{sub.is_read ? 'Leído' : 'No leído'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'newsletter') {
      return (
        <table className="min-w-full bg-white">
          <thead className="bg-neutral-100">
            <tr>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Fecha de Suscripción</th>
              <th className="py-3 px-6 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {submissions.map(sub => (
              <tr key={sub.id}>
                <td className="py-4 px-6">{sub.email}</td>
                <td className="py-4 px-6">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                <td className="py-4 px-6">{sub.is_active ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-neutral-800 mb-6">Gestión de Formularios</h2>
      
      <div className="border-b border-neutral-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button 
            onClick={() => setActiveTab('contact')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contact' ? 'border-brand text-brand' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>
            Mensajes de Contacto
          </button>
          <button 
            onClick={() => setActiveTab('newsletter')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'newsletter' ? 'border-brand text-brand' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}>
            Suscriptores de Newsletter
          </button>
        </nav>
      </div>

      <div className="overflow-x-auto">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export default FormSubmissions;
