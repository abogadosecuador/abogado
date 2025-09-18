import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../services/supabaseService';
import ProductCard from '../components/ProductCard';
import { Search, ChevronDown } from 'lucide-react';

const CatalogPage = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const { data: services } = await dataService.getAll('services');
        const { data: products } = await dataService.getAll('products');
        const { data: courses } = await dataService.getAll('courses');
        const unified = [
          ...(services || []).map(i => ({ ...i, type: 'Servicio' })),
          ...(products || []).map(i => ({ ...i, type: 'Producto' })),
          ...(courses || []).map(i => ({ ...i, type: 'Curso' }))
        ];
        setAllItems(unified);
      } catch (error) {
        console.error('Error al cargar el catálogo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, []);

  const categories = useMemo(() => ['all', ...new Set(allItems.map(item => item.category))], [allItems]);

  const filteredAndSortedItems = useMemo(() => {
    let items = allItems.filter(item => 
      (activeCategory === 'all' || item.category === activeCategory) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    // Sorting logic here based on sortBy
    return items;
  }, [allItems, activeCategory, searchTerm, sortBy]);

  if (loading) return <div className="text-center py-20">Cargando catálogo...</div>

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900">Nuestro Catálogo</h1>
          <p className="mt-4 text-xl text-gray-600">Servicios, productos y cursos para tus necesidades legales.</p>
        </header>

        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 rounded-md border" />
            </div>
            <div>
              <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="w-full py-2 px-4 rounded-md border">
                {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Todas las categorías' : c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {filteredAndSortedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedItems.map(item => <ProductCard key={`${item.type}-${item.id}`} item={item} />)}
          </div>
        ) : (
          <div className="text-center py-16"><h3 className="text-xl font-semibold">No se encontraron resultados</h3></div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;