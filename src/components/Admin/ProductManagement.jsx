import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { dataService } from '../../services/apiService';

const ProductModal = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState(
        product || { name: '', description: '', price: 0, category: 'course', image_url: '' }
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{product ? 'Editar' : 'Nuevo'} Producto</h3>
                    <button onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Nombre del Producto" required />
                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Descripción"></textarea>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Precio" required min="0" step="0.01" />
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-lg">
                        <option value="course">Curso</option>
                        <option value="ebook">E-book</option>
                        <option value="service">Servicio</option>
                    </select>
                    <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="URL de la Imagen" />
                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
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
            const { data, error } = await dataService.getAll('products');
            if (error) throw new Error(error.message);
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
                await dataService.update('products', productData.id, productData);
            } else {
                await dataService.create('products', productData);
            }
            toast.success(`Producto ${productData.id ? 'actualizado' : 'creado'} con éxito`);
            setIsModalOpen(false);
            setSelectedProduct(null);
            fetchProducts();
        } catch (error) {
            toast.error(`Error al guardar: ${error.message}`);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await dataService.remove('products', productId);
                toast.success('Producto eliminado con éxito');
                fetchProducts();
            } catch (error) {
                toast.error(`Error al eliminar: ${error.message}`);
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8">
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
                                <th className="py-3 px-6 text-left">Nombre</th>
                                <th className="py-3 px-6 text-left">Categoría</th>
                                <th className="py-3 px-6 text-left">Precio</th>
                                <th className="py-3 px-6 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="py-4 px-6">{product.name}</td>
                                    <td className="py-4 px-6">{product.category}</td>
                                    <td className="py-4 px-6">${product.price.toFixed(2)}</td>
                                    <td className="py-4 px-6">
                                        <button onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-4"><FaEdit /></button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
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
