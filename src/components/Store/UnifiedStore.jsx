import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, FaBook, FaGraduationCap, FaGavel, FaFileContract,
  FaSearch, FaFilter, FaStar, FaHeart, FaShare, FaTag,
  FaShoppingBag, FaPlus, FaMinus, FaCheck, FaClock,
  FaBolt, FaFire, FaPercent, FaTruck, FaCreditCard
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const UnifiedStore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cartItems } = useCart();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'Todo', icon: FaShoppingBag, color: 'from-purple-500 to-pink-500' },
    { id: 'services', name: 'Servicios Legales', icon: FaGavel, color: 'from-blue-500 to-cyan-500' },
    { id: 'consultations', name: 'Consultas', icon: FaFileContract, color: 'from-green-500 to-emerald-500' },
    { id: 'courses', name: 'Cursos', icon: FaGraduationCap, color: 'from-orange-500 to-red-500' },
    { id: 'ebooks', name: 'E-books', icon: FaBook, color: 'from-indigo-500 to-purple-500' },
    { id: 'physical', name: 'Productos Físicos', icon: FaShoppingCart, color: 'from-pink-500 to-rose-500' }
  ];

  const [products] = useState([
    // Servicios Legales
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
      type: 'service',
      duration: '1 hora',
      availability: 'Inmediata',
      tags: ['Popular', 'Recomendado']
    },
    {
      id: 2,
      name: 'Redacción de Contratos',
      category: 'services',
      price: 299,
      description: 'Elaboración profesional de contratos personalizados',
      image: '/images/contracts.jpg',
      rating: 4.8,
      reviews: 89,
      type: 'service',
      duration: '3-5 días',
      tags: ['Profesional']
    },
    {
      id: 3,
      name: 'Defensa Legal Penal',
      category: 'services',
      price: 500,
      description: 'Representación legal completa en casos penales',
      image: '/images/defense.jpg',
      rating: 5.0,
      reviews: 45,
      type: 'service',
      tags: ['Premium', 'Urgente']
    },
    // Consultas
    {
      id: 4,
      name: 'Consulta Express 30 min',
      category: 'consultations',
      price: 75,
      originalPrice: 100,
      description: 'Consulta rápida para resolver dudas legales puntuales',
      image: '/images/express.jpg',
      rating: 4.7,
      reviews: 234,
      discount: 25,
      type: 'consultation',
      duration: '30 minutos',
      tags: ['Oferta', 'Rápido']
    },
    {
      id: 5,
      name: 'Consulta Virtual Premium',
      category: 'consultations',
      price: 200,
      description: 'Consulta completa por videollamada con seguimiento',
      image: '/images/virtual.jpg',
      rating: 4.9,
      reviews: 156,
      type: 'consultation',
      duration: '90 minutos',
      tags: ['Online', 'Premium']
    },
    // Cursos
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
      type: 'course',
      duration: '8 semanas',
      lessons: 24,
      students: 1250,
      tags: ['Bestseller', 'Certificado']
    },
    {
      id: 7,
      name: 'Derecho Civil para Principiantes',
      category: 'courses',
      price: 199,
      description: 'Introducción completa al derecho civil ecuatoriano',
      image: '/images/course-civil.jpg',
      rating: 4.8,
      reviews: 189,
      type: 'course',
      duration: '6 semanas',
      lessons: 18,
      students: 890,
      tags: ['Principiantes']
    },
    {
      id: 8,
      name: 'Máster en Derecho Comercial',
      category: 'courses',
      price: 799,
      description: 'Programa avanzado de derecho comercial y empresarial',
      image: '/images/course-commercial.jpg',
      rating: 5.0,
      reviews: 67,
      type: 'course',
      duration: '12 semanas',
      lessons: 36,
      students: 234,
      tags: ['Avanzado', 'Máster']
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
      type: 'ebook',
      pages: 350,
      format: 'PDF',
      tags: ['Actualizado', 'Completo']
    },
    {
      id: 10,
      name: 'Manual de Contratos',
      category: 'ebooks',
      price: 39,
      description: 'Modelos y ejemplos de contratos legales',
      image: '/images/ebook-contracts.jpg',
      rating: 4.6,
      reviews: 234,
      type: 'ebook',
      pages: 200,
      format: 'PDF + Word',
      tags: ['Práctico']
    },
    {
      id: 11,
      name: 'Derecho de Familia',
      category: 'ebooks',
      price: 59,
      description: 'Todo sobre divorcios, custodia y pensiones',
      image: '/images/ebook-family.jpg',
      rating: 4.8,
      reviews: 178,
      type: 'ebook',
      pages: 280,
      format: 'PDF',
      tags: ['Especializado']
    },
    // Productos Físicos
    {
      id: 12,
      name: 'Kit Legal Emprendedor',
      category: 'physical',
      price: 299,
      description: 'Kit completo con documentos y guías para emprendedores',
      image: '/images/kit-entrepreneur.jpg',
      rating: 4.9,
      reviews: 89,
      type: 'physical',
      shipping: true,
      stock: 15,
      tags: ['Kit', 'Emprendedores']
    },
    {
      id: 13,
      name: 'Código Civil Actualizado',
      category: 'physical',
      price: 89,
      description: 'Libro físico del Código Civil ecuatoriano actualizado',
      image: '/images/book-civil.jpg',
      rating: 4.7,
      reviews: 234,
      type: 'physical',
      shipping: true,
      stock: 32,
      tags: ['Libro']
    }
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
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Tienda Legal Completa
          </motion.h1>
          <p className="text-xl text-blue-100">
            Servicios, Consultas, Cursos, E-books y más
          </p>
          
          {/* Search Bar */}
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Productos', value: products.length },
              { label: 'Categorías', value: categories.length - 1 },
              { label: 'Clientes', value: '2,500+' },
              { label: 'Valoración', value: '4.8/5' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        {/* Categories */}
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

        {/* Filters and Sort */}
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
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Precio:</span>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-32"
              />
              <span className="text-sm font-medium">${priceRange[1]}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredProducts.length} productos encontrados
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {product.featured && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-bold">
                        DESTACADO
                      </span>
                    )}
                    {product.discount && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                        -{product.discount}%
                      </span>
                    )}
                    {product.tags?.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                      <FaHeart className="text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleQuickView(product)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <FaSearch className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 uppercase">{product.category}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < Math.floor(product.rating) ? '' : 'text-gray-300'} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                    {product.duration && (
                      <span className="flex items-center gap-1">
                        <FaClock /> {product.duration}
                      </span>
                    )}
                    {product.lessons && (
                      <span>{product.lessons} lecciones</span>
                    )}
                    {product.pages && (
                      <span>{product.pages} páginas</span>
                    )}
                    {product.stock && (
                      <span className="text-green-600">Stock: {product.stock}</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through mr-2">
                          ${product.originalPrice}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price}
                      </span>
                    </div>
                    {product.shipping && (
                      <FaTruck className="text-green-600" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      <FaShoppingCart className="inline mr-2" />
                      Agregar
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <FaBolt />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick View Modal */}
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
                        <span className="ml-2 text-lg text-gray-400 line-through">
                          ${selectedProduct.originalPrice}
                        </span>
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
