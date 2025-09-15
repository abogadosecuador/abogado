import React, { useState, useEffect, useMemo } from 'react';
import { CatalogItem } from '../types';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { SearchIcon } from '../components/icons/InterfaceIcons';
import { Page, PublicRoute } from '../types';
import { legalServices, digitalProducts, courses } from '../data/servicesData';
import CatalogItemModal from '../components/CatalogItemModal';

const CATALOG_KEY = 'nexuspro_catalog';

interface CatalogPageProps {
  onNavigate: (page: Page | PublicRoute | string) => void;
  navigationPayload?: any;
  clearNavigationPayload?: () => void;
}

const CatalogPage: React.FC<CatalogPageProps> = ({ onNavigate, navigationPayload, clearNavigationPayload }) => {
    const [allItems, setAllItems] = useState<CatalogItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('relevance');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(9);
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const catalogString = localStorage.getItem(CATALOG_KEY);
        if (catalogString) {
            setAllItems(JSON.parse(catalogString));
        } else {
            // Construir catálogo unificado desde fuentes locales
            const services: CatalogItem[] = legalServices.map((s) => ({
                id: s.id,
                type: 'service',
                name: s.title,
                description: s.shortDescription,
                price: s.price,
                status: 'active',
                category: s.category,
                imageUrl: s.imageUrl || '/images/services/placeholder.jpg',
                slug: s.slug,
                shortDescription: s.shortDescription,
                longDescription: s.longDescription,
                keyPoints: s.keyPoints,
              }));

            const products: CatalogItem[] = digitalProducts.map((p) => ({
                id: p.id,
                type: p.type === 'digital' ? 'ebook' : 'product',
                name: p.name,
                description: p.description,
                price: p.price,
                status: 'active',
                category: p.category,
                imageUrl: p.imageUrl,
              }));

            const courseItems: CatalogItem[] = courses.map((c) => ({
                id: c.id,
                type: 'course',
                name: c.title,
                description: c.description,
                price: c.price,
                status: 'active',
                category: c.category,
                imageUrl: c.imageUrl,
              } as CatalogItem));

            const unified = [...services, ...products, ...courseItems];
            setAllItems(unified);
            localStorage.setItem(CATALOG_KEY, JSON.stringify(unified));
        }

        // Enriquecer imágenes desde Cloudinary (si hay credenciales configuradas en backend)
        // Buscamos por prefijos comunes (services/, products/, courses/). Ignoramos errores silenciosamente
        (async () => {
          try {
            const res = await fetch('/api/cloudinary/list?max_results=100');
            if (res.ok) {
              const json = await res.json();
              const images: { public_id: string; url: string }[] = json?.data || [];
              if (Array.isArray(images) && images.length > 0) {
                const byName: Record<string, string> = {};
                images.forEach(img => {
                  const key = img.public_id.split('/').pop() || img.public_id; // usar el último segmento como posible key
                  byName[key.toLowerCase()] = img.url;
                });
                setAllItems(prev => prev.map(it => {
                  const slug = (it.slug || it.name || '').toLowerCase().replace(/\s+/g, '-');
                  const idKey = (it.id || '').toLowerCase();
                  const newUrl = byName[slug] || byName[idKey] || it.imageUrl;
                  return { ...it, imageUrl: newUrl || it.imageUrl };
                }));
              }
            }
          } catch (e) {
            // ignorar, el catálogo seguirá funcionando con imágenes locales
          }
        })();

        if (navigationPayload?.searchTerm) {
            setSearchTerm(navigationPayload.searchTerm);
            clearNavigationPayload?.();
        }
    }, [navigationPayload, clearNavigationPayload]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(allItems.map(item => item.category));
        return ['all', ...Array.from(uniqueCategories)];
    }, [allItems]);

    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch && item.status === 'active';
        });
    }, [allItems, activeCategory, searchTerm]);

    const sortedItems = useMemo(() => {
        const items = [...filteredItems];
        switch (sortBy) {
          case 'price_asc':
            items.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price_desc':
            items.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case 'name_asc':
            items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
          case 'name_desc':
            items.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
          default:
            break;
        }
        return items;
    }, [filteredItems, sortBy]);

    const totalPages = Math.max(1, Math.ceil(sortedItems.length / perPage));
    const pageItems = useMemo(() => {
        const start = (page - 1) * perPage;
        return sortedItems.slice(start, start + perPage);
    }, [sortedItems, page, perPage]);

    const openModal = (item: CatalogItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white font-serif tracking-tight sm:text-5xl">Catálogo Universal</h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                    Explora todos nuestros productos, servicios y cursos en un solo lugar.
                </p>
            </header>

            <div className="flex">
                <FilterBar
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />
                <main className="flex-grow pl-6">
                    <div className="mb-6">
                         <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar productos, servicios o cursos..."
                                className="w-full pl-12 pr-4 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600 dark:text-gray-300">Ordenar por</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                              <option value="relevance">Relevancia</option>
                              <option value="price_asc">Precio: menor a mayor</option>
                              <option value="price_desc">Precio: mayor a menor</option>
                              <option value="name_asc">Nombre: A-Z</option>
                              <option value="name_desc">Nombre: Z-A</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600 dark:text-gray-300">Por página</label>
                            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                              <option value={9}>9</option>
                              <option value={12}>12</option>
                              <option value={18}>18</option>
                              <option value={24}>24</option>
                            </select>
                          </div>
                        </div>
                    </div>
                    {sortedItems.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {pageItems.map(item => (
                                  <ProductCard
                                      key={`${item.type}-${item.id}`}
                                      item={item}
                                      type={item.type}
                                      onClick={() => openModal(item)}
                                  />
                              ))}
                          </div>
                          <div className="mt-8 flex items-center justify-center gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`px-4 py-2 rounded-md border ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Anterior</button>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Página {page} de {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={`px-4 py-2 rounded-md border ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Siguiente</button>
                          </div>
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-xl font-semibold">No se encontraron resultados</h3>
                            <p className="text-gray-500 mt-2">Intenta ajustar tu búsqueda o filtros.</p>
                        </div>
                    )}
                </main>
            </div>

            <CatalogItemModal isOpen={isModalOpen} onClose={closeModal} item={selectedItem} />
        </div>
    );
};

export default CatalogPage;