import React, { useState, useEffect } from 'react';
import { dataService } from '../services/supabaseService';
import ProductCard from '../components/ProductCard';
import { Award } from 'lucide-react';

const MasterclassPage = () => {
  const [masterclasses, setMasterclasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasterclasses = async () => {
      try {
        // Asumimos que las masterclasses tienen una categoría específica en la tabla 'courses'
        const { data, error } = await dataService.getAll('courses', { filters: [{ column: 'category', value: 'Masterclass' }] });
        if (error) throw error;
        setMasterclasses(data.map(item => ({ ...item, type: 'Masterclass' })) || []);
      } catch (err) {
        console.error('Error al cargar las masterclasses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMasterclasses();
  }, []);

  if (loading) return <div className="text-center py-20">Cargando masterclasses...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <Award className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-5xl font-bold text-gray-900">Masterclasses Exclusivas</h1>
          <p className="mt-4 text-xl text-gray-600">Formación avanzada con nuestros mejores expertos legales.</p>
        </header>

        {masterclasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {masterclasses.map(mc => <ProductCard key={mc.id} item={mc} />)}
          </div>
        ) : (
          <div className="text-center py-16"><h3 className="text-xl font-semibold">No hay masterclasses disponibles en este momento.</h3></div>
        )}
      </div>
    </div>
  );
};

export default MasterclassPage;
