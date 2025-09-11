import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTimes, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const FloatingCart = () => {
  const navigate = useNavigate();
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Calcular cantidad total de items
  const totalItems = items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  // Efecto para mostrar notificación cuando se agrega un item
  useEffect(() => {
    if (items?.length > 0) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          setIsMinimized(false);
          setTimeout(() => setIsMinimized(true), 3000);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [items?.length, isOpen]);

  const handleCheckout = () => {
    if (items?.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }
    setIsOpen(false);
    navigate('/checkout');
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item.id, item.type || 'product');
    } else {
      updateQuantity(item.id, item.type || 'product', newQuantity);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Botón flotante del carrito */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 safe-right-offset z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all"
        >
          <FaShoppingCart className="text-2xl" />
          {totalItems > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          )}
        </motion.button>

        {/* Tooltip con total */}
        {!isOpen && !isMinimized && totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-4 right-4 z-40"
          >
            <span className="text-sm">Total: ${total?.toFixed(2) || '0.00'}</span>
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
          </motion.div>
        )}
      </motion.div>

      {/* Panel del carrito */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Panel lateral */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <FaShoppingCart className="mr-2" />
                  Carrito de Compras
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Items del carrito */}
              <div className="flex-1 overflow-y-auto p-4">
                {items && items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-lg p-3 flex items-center gap-3"
                      >
                        {/* Imagen */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FaShoppingCart />
                            </div>
                          )}
                        </div>

                        {/* Detalles */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-500">{item.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-blue-600">${item.price}</span>
                            
                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateQuantity(item, (item.quantity || 1) - 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <FaMinus className="text-xs" />
                              </button>
                              <span className="px-2 text-sm font-medium">{item.quantity || 1}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item, (item.quantity || 1) + 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <FaPlus className="text-xs" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => removeFromCart(item.id, item.type || 'product')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FaShoppingCart className="text-6xl mb-4" />
                    <p className="text-lg">Tu carrito está vacío</p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/tienda');
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ir a la Tienda
                    </button>
                  </div>
                )}
              </div>

              {/* Footer con total y acciones */}
              {items && items.length > 0 && (
                <div className="border-t p-4 space-y-3">
                  {/* Resumen */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (12%):</span>
                      <span>${((total || 0) * 0.12).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-blue-600">${((total || 0) * 1.12).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckout}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                      Proceder al Pago
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/tienda');
                      }}
                      className="w-full py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Seguir Comprando
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
                          clearCart();
                          toast.success('Carrito vaciado');
                        }
                      }}
                      className="w-full py-2 text-red-500 text-sm hover:text-red-700 transition-colors"
                    >
                      Vaciar Carrito
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCart;
