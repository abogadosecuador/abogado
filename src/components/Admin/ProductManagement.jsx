import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaImage } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const api = {
  getAuthToken: () => localStorage.getItem('authToken'),

  getProducts: async () => {
    const res = await fetch('/api/admin/products', { headers: { 'Authorization': `Bearer ${api.getAuthToken()}` } });
    if (!res.ok) throw new Error((await res.json()).error);
    return (await res.json()).data;
  },

  createProduct: async (productData) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${api.getAuthToken()}` },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return (await res.json()).data;
  },

  updateProduct: async (productData) => {
    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${api.getAuthToken()}` },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return (await res.json()).data;
  },

  deleteProduct: async (productId) => {
    const res = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${api.getAuthToken()}` },
      body: JSON.stringify({ id: productId }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return (await res.json()).data;
  },
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    product || { name: '', description: '', price: 0, stock: 0, image_url: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{product ? 'Editar' : 'Nuevo'} Producto</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg" rows="3"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-lg" required min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded-lg" required min="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL de la Imagen</label>
            <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar Producto</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data || []);
    } catch (error) {
      toast.error(`Error al cargar productos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

    const handleSaveProduct = async (productData) => {
    try {
      if (productData.id) {
        // Actualizar
        await api.updateProduct(productData);
      } else {
        // Crear
        await api.createProduct(productData);
      }
      toast.success(`Producto ${productData.id ? 'actualizado' : 'creado'} con éxito`);
      setIsModalOpen(false);
      setSelectedProduct(null);
      fetchProducts(); // Recargar la lista de productos
    } catch (error) {
      toast.error(`Error al guardar: ${error.message}`);
    }
  };

    const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await api.deleteProduct(productId);
        toast.success('Producto eliminado con éxito');
        fetchProducts(); // Recargar la lista de productos
      } catch (error) {
        toast.error(`Error al eliminar: ${error.message}`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
        <button onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
          <FaPlus className="mr-2" /> Añadir Producto
        </button>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left">Producto</th>
                <th className="py-3 px-6 text-left">Precio</th>
                <th className="py-3 px-6 text-left">Stock</th>
                <th className="py-3 px-6 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="py-4 px-6 flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-md mr-4 flex-shrink-0 flex items-center justify-center">
                      {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-md" /> : <FaImage className="text-gray-400" />}
                    </div>
                    {product.name}
                  </td>
                  <td className="py-4 px-6">${product.price.toFixed(2)}</td>
                  <td className="py-4 px-6">{product.stock}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-4"><FaEdit /></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:red-blue-700"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}
          onSave={handleSaveProduct}
        />
      )}
    </motion.div>
  );
};

export default ProductManagement;
