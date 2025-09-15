import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { useCart } from '../context/CartContext';

interface CatalogItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
}

const CatalogItemModal: React.FC<CatalogItemModalProps> = ({ isOpen, onClose, item }) => {
  const { addToCart } = useCart();

  if (!item) return null;

  const title = 'name' in item ? item.name : item.title;
  const description = item.longDescription || item.description;
  const imageUrl = item.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800';

  const handleAdd = () => {
    const cartType = item.type === 'service' ? 'service' : item.type === 'course' ? 'course' : 'product';
    addToCart(item, cartType);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="w-full max-w-3xl"
            role="dialog"
            aria-modal="true"
          >
            <Card className="!p-0 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative">
                  <img src={imageUrl} alt={title} className="w-full h-64 md:h-full object-cover" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-bold mr-4">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{description}</p>

                  {Array.isArray(item.keyPoints) && item.keyPoints.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm list-disc list-inside text-gray-700 dark:text-gray-300">
                      {item.keyPoints.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">Precio</span>
                      <div className="text-2xl font-bold">${Number(item.price).toFixed(2)}</div>
                    </div>
                    <button onClick={handleAdd} className="px-5 py-3 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CatalogItemModal;
