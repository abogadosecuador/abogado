import React, { useState, useEffect } from 'react';
import { dataService } from '../services/supabaseService';
import ProductCard from '../components/ProductCard';
import { BookOpen } from 'lucide-react';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await dataService.getAll('courses');
        if (error) throw error;
        setCourses(data.map(item => ({ ...item, type: 'Curso' })) || []);
      } catch (err) {
        console.error('Error al cargar los cursos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="text-center py-20">Cargando cursos...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-5xl font-bold text-gray-900">Cursos Legales Interactivos</h1>
          <p className="mt-4 text-xl text-gray-600">Capacítate con nuestros cursos diseñados por expertos.</p>
        </header>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => <ProductCard key={course.id} item={course} />)}
          </div>
        ) : (
          <div className="text-center py-16"><h3 className="text-xl font-semibold">No hay cursos disponibles en este momento.</h3></div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;