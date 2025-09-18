import React, { useState, useEffect } from 'react';
import { dataService } from '../../../services/supabaseService';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({ name: '', description: '', price: 0, category: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await dataService.getAll('courses');
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      toast.error('Error al cargar los cursos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (currentCourse.id) {
        // Actualizar curso
        await dataService.update('courses', currentCourse.id, currentCourse);
        toast.success('Curso actualizado con éxito.');
      } else {
        // Crear curso
        await dataService.create('courses', currentCourse);
        toast.success('Curso creado con éxito.');
      }
      fetchCourses();
      setShowModal(false);
    } catch (err) {
      toast.error('No se pudo guardar el curso.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      try {
        await dataService.delete('courses', id);
        toast.success('Curso eliminado con éxito.');
        fetchCourses();
      } catch (err) {
        toast.error('No se pudo eliminar el curso.');
      }
    }
  };

  return (
    <div>
      <button onClick={() => { setCurrentCourse({ name: '', description: '', price: 0, category: '' }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"><Plus size={18} className="mr-2" /> Crear Curso</button>
      
      <div className="mt-4 bg-white p-4 rounded-md shadow-sm">
        {courses.map(course => (
          <div key={course.id} className="flex justify-between items-center p-2 border-b">
            <span>{course.name}</span>
            <div>
              <button onClick={() => { setCurrentCourse(course); setShowModal(true); }} className="mr-2"><Edit size={18} /></button>
              <button onClick={() => handleDelete(course.id)}><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-1/3">
            <h2 className="text-xl font-bold mb-4">{currentCourse.id ? 'Editar' : 'Crear'} Curso</h2>
            <input type="text" placeholder="Nombre" value={currentCourse.name} onChange={e => setCurrentCourse({...currentCourse, name: e.target.value})} className="w-full p-2 border rounded-md mb-2" />
            <textarea placeholder="Descripción" value={currentCourse.description} onChange={e => setCurrentCourse({...currentCourse, description: e.target.value})} className="w-full p-2 border rounded-md mb-2"></textarea>
            <input type="number" placeholder="Precio" value={currentCourse.price} onChange={e => setCurrentCourse({...currentCourse, price: parseFloat(e.target.value)})} className="w-full p-2 border rounded-md mb-2" />
            <input type="text" placeholder="Categoría" value={currentCourse.category} onChange={e => setCurrentCourse({...currentCourse, category: e.target.value})} className="w-full p-2 border rounded-md mb-4" />
            <div className="flex justify-end">
              <button onClick={() => setShowModal(false)} className="mr-2 px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;
