import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { dataService } from '../../services/apiService';

const UserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState(
        user || { full_name: '', email: '', role: 'client', password: '' }
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
                    <h3 className="text-2xl font-bold">{user ? 'Editar' : 'Nuevo'} Usuario</h3>
                    <button onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Rol</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded-lg">
                            <option value="client">Cliente</option>
                            <option value="admin">Admin</option>
                            <option value="affiliate">Afiliado</option>
                        </select>
                    </div>
                    {!user && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Contraseña</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                        </div>
                    )}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar Usuario</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await dataService.getAll('users');
            if (error) throw new Error(error.message);
            setUsers(data || []);
        } catch (error) {
            toast.error(`Error al cargar usuarios: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async (userData) => {
        try {
            if (userData.id) {
                await dataService.update('users', userData.id, userData);
            } else {
                await dataService.create('users', userData);
            }
            toast.success(`Usuario ${userData.id ? 'actualizado' : 'creado'} con éxito`);
            setIsModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(`Error al guardar: ${error.message}`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                await dataService.remove('users', userId);
                toast.success('Usuario eliminado con éxito');
                fetchUsers();
            } catch (error) {
                toast.error(`Error al eliminar: ${error.message}`);
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                <button onClick={() => { setSelectedUser(null); setIsModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
                    <FaUserPlus className="mr-2" /> Añadir Usuario
                </button>
            </div>

            {loading ? (
                <p>Cargando usuarios...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-left">Nombre</th>
                                <th className="py-3 px-6 text-left">Email</th>
                                <th className="py-3 px-6 text-left">Rol</th>
                                <th className="py-3 px-6 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="py-4 px-6">{user.full_name}</td>
                                    <td className="py-4 px-6">{user.email}</td>
                                    <td className="py-4 px-6">{user.role}</td>
                                    <td className="py-4 px-6">
                                        <button onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-4"><FaEdit /></button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <UserModal 
                    user={selectedUser}
                    onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                    onSave={handleSaveUser}
                />
            )}
        </motion.div>
    );
};

export default UserManagement;
