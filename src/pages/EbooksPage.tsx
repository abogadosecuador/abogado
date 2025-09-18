import React, { useState, useEffect } from 'react';
import { dataService } from '../services/supabaseService';
import ProductCard from '../components/ProductCard';
import { BookOpen } from 'lucide-react';

const EbooksPage = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        // Asumimos que los ebooks tienen una categoría específica en la tabla 'products'
        const { data, error } = await dataService.getAll('products', { filters: [{ column: 'category', value: 'Ebook' }] });
        if (error) throw error;
        setEbooks(data.map(item => ({ ...item, type: 'Ebook' })) || []);
      } catch (err) {
        console.error('Error al cargar los ebooks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEbooks();
  }, []);

  if (loading) return <div className="text-center py-20">Cargando ebooks...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-5xl font-bold text-gray-900">Ebooks y Guías Legales</h1>
          <p className="mt-4 text-xl text-gray-600">Recursos descargables para potenciar tu conocimiento.</p>
        </header>

        {ebooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ebooks.map(ebook => <ProductCard key={ebook.id} item={ebook} />)}
          </div>
        ) : (
          <div className="text-center py-16"><h3 className="text-xl font-semibold">No hay ebooks disponibles en este momento.</h3></div>
        )}
      </div>
    </div>
  );
};

export default EbooksPage;