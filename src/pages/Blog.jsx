import React from 'react';

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: 'Nuevas Reformas al Código Civil Ecuatoriano',
      excerpt: 'Conoce las últimas modificaciones que afectan los contratos y obligaciones civiles.',
      date: '2024-01-15',
      author: 'Dr. Juan Pérez'
    },
    {
      id: 2,
      title: 'Derechos Laborales: Lo que Todo Trabajador Debe Saber',
      excerpt: 'Guía completa sobre los derechos fundamentales en el ámbito laboral ecuatoriano.',
      date: '2024-01-10',
      author: 'Dra. María González'
    },
    {
      id: 3,
      title: 'Proceso de Divorcio en Ecuador: Pasos y Requisitos',
      excerpt: 'Todo lo que necesitas saber sobre el proceso de divorcio y sus implicaciones legales.',
      date: '2024-01-05',
      author: 'Dr. Carlos Rodríguez'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Blog Legal
        </h1>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>{post.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.date).toLocaleDateString('es-ES')}</span>
                </div>
                <p className="text-gray-600 mb-4">
                  {post.excerpt}
                </p>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Leer más →
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
