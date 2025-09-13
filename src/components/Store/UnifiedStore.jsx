import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, FaBook, FaGraduationCap, FaGavel, FaFileContract,
  FaSearch, FaFilter, FaStar, FaShoppingBag, FaBolt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductCard from './ProductCard';

const UnifiedStore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'Todo', icon: FaShoppingBag, color: 'from-purple-500 to-pink-500' },
    { id: 'services', name: 'Servicios Legales', icon: FaGavel, color: 'from-blue-500 to-cyan-500' },
    { id: 'consultations', name: 'Consultas', icon: FaFileContract, color: 'from-green-500 to-emerald-500' },
    { id: 'courses', name: 'Cursos', icon: FaGraduationCap, color: 'from-orange-500 to-red-500' },
    { id: 'ebooks', name: 'E-books', icon: FaBook, color: 'from-indigo-500 to-purple-500' },
  ];

  const [products] = useState([
    // Courses
    {
        id: 6,
        name: 'Curso Derecho Penal Completo',
        category: 'courses',
        price: 399,
        originalPrice: 599,
        description: 'Curso completo de derecho penal con certificación',
        image: '/images/course-penal.jpg',
        rating: 4.9,
        reviews: 312,
        featured: true,
        discount: 33,
        duration: '8 semanas',
        lessons: 24,
    },
    // E-books
    {
        id: 9,
        name: 'Guía Legal Ecuador 2024',
        category: 'ebooks',
        price: 49,
        originalPrice: 79,
        description: 'Guía completa actualizada de leyes ecuatorianas',
        image: '/images/ebook-guide.jpg',
        rating: 4.7,
        reviews: 456,
        featured: true,
        discount: 38,
        pages: 350,
    },
    // Services
    {
        id: 1,
        name: 'Consulta Legal Completa',
        category: 'services',
        price: 150,
        originalPrice: 200,
        description: 'Asesoría legal profesional de 1 hora con análisis completo de su caso',
        image: '/images/consultation.jpg',
        rating: 4.9,
        reviews: 127,
        featured: true,
        discount: 25,
    },
  ]);

  const filteredProducts = products.filter(product => {
    const matchCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchCategory && matchSearch && matchPrice;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'popular': return b.reviews - a.reviews;
      default: return b.featured ? 1 : -1;
    }
  });

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category
    });
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const handleBuyNow = (product) => {
    handleAddToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full overflow-x-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Tienda Legal Completa
          </motion.h1>
          <p className="text-xl text-blue-100">Servicios, Consultas, Cursos, E-books y más</p>
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos, servicios, cursos..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md'
                } ${activeCategory === cat.id ? cat.color : ''}`}
              >
                <cat.icon className="inline mr-2" />
                {cat.name}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Destacados</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Valorados</option>
              <option value="popular">Más Populares</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {filteredProducts.length} productos encontrados
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index} 
                onAddToCart={handleAddToCart} 
                onBuyNow={handleBuyNow} 
                onQuickView={handleQuickView} 
              />
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {quickViewOpen && selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setQuickViewOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  <div>
                    <img
                      src={selectedProduct.image || '/images/placeholder.jpg'}
                      alt={selectedProduct.name}
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
                    <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < Math.floor(selectedProduct.rating) ? '' : 'text-gray-300'} />
                        ))}
                      </div>
                      <span>{selectedProduct.rating} ({selectedProduct.reviews} reseñas)</span>
                    </div>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-blue-600">${selectedProduct.price}</span>
                      {selectedProduct.originalPrice && (
                        <span className="ml-2 text-lg text-gray-400 line-through">${selectedProduct.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
                      >
                        Agregar al Carrito
                      </button>
                      <button
                        onClick={() => handleBuyNow(selectedProduct)}
                        className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium"
                      >
                        Comprar Ahora
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnifiedStore;
