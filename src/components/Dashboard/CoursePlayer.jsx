import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBookOpen, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/courses/${courseId}/content`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error((await response.json()).error);
        }
        const data = await response.json();
        setCourse(data.data);
        // Set the first lesson as active by default
        if (data.data?.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(data.data.modules[0].lessons[0]);
        }
      } catch (err) {
        toast.error(`Error al cargar el curso: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseContent();
  }, [courseId]);

  const handleMarkAsComplete = async () => {
    if (!activeLesson) return;
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ lesson_id: activeLesson.id }),
      });
      setCompletedLessons(prev => new Set(prev).add(activeLesson.id));
      toast.success('¡Lección completada!');
    } catch (err) {
      toast.error('No se pudo guardar tu progreso.');
    }
  };

  if (loading) return <div className="text-center p-8">Cargando curso...</div>;
  if (!course) return <div className="text-center p-8">No se encontró el curso.</div>;

  return (
    <div className="flex flex-col lg:flex-row h-full bg-neutral-50">
      {/* Sidebar de Lecciones */}
      <aside className="w-full lg:w-80 border-r bg-white p-6 flex-shrink-0">
        <Link to="/dashboard/mis-cursos" className="flex items-center text-brand mb-4 font-semibold">
          <FaArrowLeft className="mr-2" /> Volver a Mis Cursos
        </Link>
        <h2 className="text-xl font-bold mb-4">{course.title}</h2>
        <div className="space-y-4">
          {course.modules.map(module => (
            <div key={module.id}>
              <h3 className="font-bold text-neutral-800 mb-2">{module.title}</h3>
              <ul className="space-y-1">
                {module.lessons.map(lesson => (
                  <li key={lesson.id}>
                    <button 
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left flex items-center p-2 rounded-md ${activeLesson?.id === lesson.id ? 'bg-brand/10 text-brand' : 'hover:bg-neutral-100'}`}>
                      {completedLessons.has(lesson.id) ? <FaCheckCircle className="text-success mr-2" /> : <FaBookOpen className="text-neutral-400 mr-2" />}
                      {lesson.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Contenido Principal de la Lección */}
      <main className="flex-1 p-8">
        {activeLesson ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold mb-4">{activeLesson.title}</h1>
            {activeLesson.video_url && (
              <div className="aspect-video bg-black rounded-lg mb-6">
                <iframe src={activeLesson.video_url} title={activeLesson.title} frameBorder="0" allowFullScreen className="w-full h-full rounded-lg"></iframe>
              </div>
            )}
            <div className="prose max-w-none">
              <p>{activeLesson.content}</p>
            </div>
            <button 
              onClick={handleMarkAsComplete}
              disabled={completedLessons.has(activeLesson.id)}
              className="mt-8 px-6 py-3 bg-brand text-white font-bold rounded-lg disabled:bg-neutral-400">
              {completedLessons.has(activeLesson.id) ? 'Lección Completada' : 'Marcar como Completada'}
            </button>
          </motion.div>
        ) : (
          <div className="text-center">Selecciona una lección para comenzar.</div>
        )}
      </main>
    </div>
  );
};

export default CoursePlayer;
