import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaSearch, FaShoppingCart, FaBolt, FaClock } from 'react-icons/fa';

const ProductCard = ({ product, index, onAddToCart, onBuyNow, onQuickView }) => {
    return (
        <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden group"
        >
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
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
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onQuickView(product)} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                        <FaSearch className="text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <span className="text-xs text-gray-500 uppercase">{product.category}</span>
                <h3 className="font-bold text-gray-800 mt-1 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.floor(product.rating) ? '' : 'text-gray-300'} />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600">{product.rating} ({product.reviews} reseñas)</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through mr-2">${product.originalPrice}</span>
                        )}
                        <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onAddToCart(product)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                        <FaShoppingCart className="inline mr-2" />
                        Agregar
                    </button>
                    <button
                        onClick={() => onBuyNow(product)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <FaBolt />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
