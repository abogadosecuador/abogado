import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const api = {
  getAuthToken: () => localStorage.getItem('authToken'),

  getBlogPosts: async () => {
    const res = await fetch('/api/admin/blog', { headers: { 'Authorization': `Bearer ${api.getAuthToken()}` } });
    if (!res.ok) throw new Error((await res.json()).error);
    return (await res.json()).data;
  },

  createBlogPost: async (postData) => {
    const res = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${api.getAuthToken()}` },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return (await res.json()).data;
  },

  updateBlogPost: async (postData) => {
    const res = await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${api.getAuthToken()}` },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return (await res.json()).data;
  },

  deleteBlogPost: async (postId) => {
    const res = await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${api.getAuthToken()}` },
      body: JSON.stringify({ id: postId }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return (await res.json()).data;
  },
};

// Placeholder for a Rich Text Editor component
const RichTextEditor = ({ value, onChange }) => (
  <textarea 
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full p-2 border rounded-lg h-48"
    placeholder="Escribe tu artículo aquí..."
  />
);

const BlogModal = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    post || { title: '', content: '', author: '', status: 'draft' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
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
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{post ? 'Editar' : 'Nueva'} Entrada de Blog</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contenido</label>
            <RichTextEditor value={formData.content} onChange={handleContentChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Autor</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-lg">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar Entrada</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

    const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getBlogPosts();
      setPosts(data || []);
    } catch (error) {
      toast.error(`Error al cargar posts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

    const handleSavePost = async (postData) => {
    try {
      if (postData.id) {
        await api.updateBlogPost(postData);
      } else {
        await api.createBlogPost(postData);
      }
      toast.success(`Entrada ${postData.id ? 'actualizada' : 'creada'} con éxito`);
      setIsModalOpen(false);
      setSelectedPost(null);
      fetchPosts(); // Recargar la lista
    } catch (error) {
      toast.error(`Error al guardar: ${error.message}`);
    }
  };

    const handleDeletePost = async (postId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      try {
        await api.deleteBlogPost(postId);
        toast.success('Entrada eliminada con éxito');
        fetchPosts(); // Recargar la lista
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
        <h2 className="text-2xl font-bold text-gray-800">Gestión del Blog</h2>
        <button onClick={() => { setSelectedPost(null); setIsModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
          <FaPlus className="mr-2" /> Nueva Entrada
        </button>
      </div>

      {loading ? (
        <p>Cargando entradas del blog...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left">Título</th>
                <th className="py-3 px-6 text-left">Autor</th>
                <th className="py-3 px-6 text-left">Estado</th>
                <th className="py-3 px-6 text-left">Fecha</th>
                <th className="py-3 px-6 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map(post => (
                <tr key={post.id}>
                  <td className="py-4 px-6">{post.title}</td>
                  <td className="py-4 px-6">{post.author}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => { setSelectedPost(post); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-4"><FaEdit /></button>
                    <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:red-blue-700"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <BlogModal 
          post={selectedPost}
          onClose={() => { setIsModalOpen(false); setSelectedPost(null); }}
          onSave={handleSavePost}
        />
      )}
    </motion.div>
  );
};

export default BlogManagement;
