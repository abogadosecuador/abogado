import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dataService } from '../../../services/supabaseService';
import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data: courseData, error: courseError } = await dataService.getById('courses', courseId);
        if (courseError) throw courseError;
        setCourse(courseData);

        const { data: modulesData, error: modulesError } = await dataService.getAll('modules', { filters: [{ column: 'course_id', value: courseId }], order: { column: 'position', asc: true } });
        if (modulesError) throw modulesError;

        // Para cada módulo, cargar sus lecciones
        const modulesWithLessons = await Promise.all(modulesData.map(async (module) => {
          const { data: lessonsData, error: lessonsError } = await dataService.getAll('lessons', { filters: [{ column: 'module_id', value: module.id }], order: { column: 'position', asc: true } });
          if (lessonsError) throw lessonsError;
          return { ...module, lessons: lessonsData };
        }));

        setModules(modulesWithLessons);
        if (modulesWithLessons[0]?.lessons[0]) {
          setActiveLesson(modulesWithLessons[0].lessons[0]);
        }

      } catch (err) {
        console.error('Error al cargar el curso:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  if (loading) return <div className="text-center p-8">Cargando curso...</div>;
  if (!course) return <div className="text-center p-8">Curso no encontrado.</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{course.name}</h2>
        {modules.map(module => (
          <div key={module.id} className="mb-4">
            <h3 className="font-semibold text-lg mb-2">{module.name}</h3>
            <ul>
              {module.lessons.map(lesson => (
                <li key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`cursor-pointer p-2 rounded-md flex items-center ${activeLesson?.id === lesson.id ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>
                  <PlayCircle size={16} className="mr-2" /> {lesson.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="w-2/3 p-8">
        {activeLesson ? (
          <div>
            <h1 className="text-3xl font-bold mb-4">{activeLesson.title}</h1>
            <div className="aspect-video bg-black rounded-lg mb-4">
              {/* Aquí iría el reproductor de video, ej. Vimeo, YouTube, o un video auto-hosteado */}
              <div className="w-full h-full flex items-center justify-center text-white">Reproductor de Video para: {activeLesson.video_url}</div>
            </div>
            <p>{activeLesson.content}</p>
          </div>
        ) : (
          <div className="text-center">Selecciona una lección para comenzar.</div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
