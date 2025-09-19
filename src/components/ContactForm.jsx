import React, { useState } from 'react';
import { dataManager } from '../services/dataManager';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dataManager.saveContact(formData);
      toast.success('¡Consulta guardada exitosamente!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Error al guardar: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
      <input
        type="text"
        placeholder="Nombre"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="w-full p-3 border rounded"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        className="w-full p-3 border rounded"
        required
      />
      <input
        type="tel"
        placeholder="Teléfono"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        className="w-full p-3 border rounded"
      />
      <textarea
        placeholder="Mensaje"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        className="w-full p-3 border rounded h-32"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
      >
        Enviar Consulta
      </button>
    </form>
  );
}
