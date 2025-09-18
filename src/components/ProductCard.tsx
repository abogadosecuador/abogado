import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ item }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Evita que se abra el modal si se hace clic en el botón
    addToCart(item);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer"
    >
      <div className="relative">
        <img src={item.image_url || 'https://via.placeholder.com/400x300.png?text=Producto'} alt={item.name} className="w-full h-48 object-cover" />
        <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{item.type}</span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 flex-grow">{item.name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="font-bold text-xl text-gray-900">${item.price.toFixed(2)}</span>
          <button onClick={handleAddToCart} className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <ShoppingCart size={16} className="mr-1.5" />
            Añadir
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
