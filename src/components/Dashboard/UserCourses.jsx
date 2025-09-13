import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaCertificate, FaBook, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const CourseCard = ({ course }) => {
  const progress = course.progress || 0;

  const getStatusBadge = () => {
    if (progress >= 100) {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Completado</span>;
    } else if (progress > 0) {
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">En progreso</span>;
    } else {
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">No iniciado</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
    >
      <div className="relative">
        <img src={course.image_url || "/images/courses/default.jpg"} alt={course.title} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
          <div>{getStatusBadge()}</div>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-neutral-900 mb-2">{course.title}</h3>
        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="mt-auto">
          {progress > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-500">Progreso</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2.5">
                <div className="bg-brand h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Instructor: {course.instructor}</span>
            <Link to={`/dashboard/mis-cursos/${course.id}`} className="p-2 text-brand hover:bg-brand/10 rounded-full" title="Continuar aprendiendo">
              <FaPlay />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UserCourses = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/user/enrolled-courses', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error((await response.json()).error || 'Failed to fetch courses');
        }
        const data = await response.json();
        setEnrolledCourses(data.data || []);
      } catch (error) {
        toast.error(`Error al cargar tus cursos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  const filteredCourses = enrolledCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>;
  }

  return (
    <div className="bg-neutral-50 rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">Mis Cursos</h2>
        <div className="relative">
          <FaSearch className="absolute top-3 left-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar en mis cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-neutral-300 rounded-md w-full"
          />
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg">
          <FaBook className="mx-auto text-neutral-400 text-4xl mb-4" />
          <h3 className="text-xl font-medium text-neutral-700">No tienes cursos inscritos</h3>
          <p className="text-neutral-500 my-4">¡Explora nuestro catálogo y empieza a aprender!</p>
          <Link to="/cursos" className="px-5 py-3 bg-brand text-white rounded-md font-semibold">
            Ver Cursos Disponibles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCourses;
