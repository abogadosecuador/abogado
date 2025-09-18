import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/supabaseService';
import { BookOpen } from 'lucide-react';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data: purchases, error: purchasesError } = await dataService.getAll('purchases', { 
          filters: [
            { column: 'user_id', value: user.id },
            { column: 'item_type', value: 'course' }
          ]
        });
        if (purchasesError) throw purchasesError;

        const courseIds = purchases.map(p => p.item_id);
        if (courseIds.length > 0) {
          const { data: coursesData, error: coursesError } = await dataService.getAll('courses', { 
            filters: [{ column: 'id', operator: 'in', value: courseIds }]
          });
          if (coursesError) throw coursesError;
          setCourses(coursesData || []);
        }
      } catch (err) {
        console.error('Error al cargar mis cursos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, [user]);

  if (loading) return <div className="text-center p-8">Cargando tus cursos...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center text-gray-800"><BookOpen className="h-8 w-8 mr-3 text-blue-600"/> Mis Cursos</h1>
        <p className="mt-1 text-gray-600">Continúa tu aprendizaje donde lo dejaste.</p>
      </header>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link to={`/dashboard/cursos/${course.id}`} key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden block hover:shadow-lg transition-shadow">
              <img src={course.image_url || 'https://via.placeholder.com/400x300.png?text=Curso'} alt={course.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800">{course.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm"><p className="text-gray-500">Aún no te has inscrito en ningún curso.</p></div>
      )}
    </div>
  );
};

export default MyCoursesPage;
