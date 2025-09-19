import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', description: '', category: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar productos
    const { data: productsData } = await supabase.from('products').select('*');
    setProducts(productsData || []);
    
    // Cargar contactos
    const { data: contactsData } = await supabase.from('contacts').select('*');
    setContacts(contactsData || []);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('products').insert([newProduct]);
      toast.success('Producto añadido');
      setNewProduct({ name: '', price: '', description: '', category: '' });
      loadData();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await supabase.from('products').delete().eq('id', id);
      toast.success('Producto eliminado');
      loadData();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      {/* Añadir Producto */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Añadir Producto/Servicio</h2>
        <form onSubmit={addProduct} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            className="p-3 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={newProduct.price}
            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            className="p-3 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Categoría"
            value={newProduct.category}
            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            className="p-3 border rounded"
          />
          <textarea
            placeholder="Descripción"
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            className="p-3 border rounded"
          />
          <button
            type="submit"
            className="col-span-2 bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            Añadir Producto
          </button>
        </form>
      </div>

      {/* Lista de Productos */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Productos ({products.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Precio</th>
                <th className="p-3 text-left">Categoría</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">${product.price}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Contactos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Consultas Recibidas ({contacts.length})</h2>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{contact.name}</h3>
                  <p className="text-gray-600">{contact.email}</p>
                  <p className="text-gray-600">{contact.phone}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(contact.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2">{contact.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
