import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBookOpen } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Este componente servirá como base para la gestión de cursos.
// La lógica de la API se conectará en los siguientes pasos.

const CourseModal = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    course || { title: '', description: '', price: 0, instructor: '', image_url: '' }
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
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">{course ? 'Editar' : 'Nuevo'} Curso</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título del Curso</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg" rows="4"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-lg" required min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instructor</label>
              <input type="text" name="instructor" value={formData.instructor} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL de la Imagen de Portada</label>
            <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-lg">Guardar Curso</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    // Simulación de carga de datos. Se conectará a la API.
    setTimeout(() => {
      setCourses([
        { id: 1, title: 'Fundamentos de Derecho Penal', instructor: 'Dr. García', price: 49.99 },
        { id: 2, title: 'Masterclass: Litigación Oral', instructor: 'Abg. Wilson Ipiales', price: 79.99 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveCourse = (courseData) => {
    toast.success(`Curso ${courseData.id ? 'actualizado' : 'creado'} con éxito`);
    setIsModalOpen(false);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('¿Estás seguro?')) {
      toast.success('Curso eliminado');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Gestión de Cursos</h2>
        <button onClick={() => { setSelectedCourse(null); setIsModalOpen(true); }} className="px-4 py-2 bg-brand text-white rounded-lg flex items-center">
          <FaPlus className="mr-2" /> Añadir Curso
        </button>
      </div>

      {loading ? <p>Cargando cursos...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-neutral-100">
              <tr>
                <th className="py-3 px-6 text-left">Título</th>
                <th className="py-3 px-6 text-left">Instructor</th>
                <th className="py-3 px-6 text-left">Precio</th>
                <th className="py-3 px-6 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {courses.map(course => (
                <tr key={course.id}>
                  <td className="py-4 px-6 flex items-center"><FaBookOpen className="text-brand mr-3" />{course.title}</td>
                  <td className="py-4 px-6">{course.instructor}</td>
                  <td className="py-4 px-6">${course.price.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => { setSelectedCourse(course); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-4"><FaEdit /></button>
                    <button onClick={() => handleDeleteCourse(course.id)} className="text-danger"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CourseModal 
          course={selectedCourse}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCourse}
        />
      )}
    </motion.div>
  );
};

export default CourseManagement;
