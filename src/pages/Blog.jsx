import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Tag } from 'lucide-react';
import { dataService } from '../services/supabaseService';
import SEO from '../components/Common/SEO';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await dataService.getAll('posts', { 
          order: { column: 'created_at', asc: false }
        });
        if (error) throw error;
        setArticles(data || []);
      } catch (err) {
        console.error('Error al cargar los artículos del blog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO
        title="Blog Legal | Abogado Wilson Ipiales"
        description="Artículos y noticias sobre temas legales en Ecuador. Información actualizada sobre derecho penal, civil, tránsito y más."
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Nuestro Blog Legal</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Manténgase informado con nuestros análisis y noticias sobre el mundo del derecho en Ecuador.</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <ArticleSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                <Link to={`/blog/${article.slug || article.id}`} className="block">
                  <img 
                    src={article.image_url || 'https://via.placeholder.com/600x400.png?text=Abogados+Ecuador'}
                    alt={article.title}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                    <div className="flex items-center"><Tag size={14} className="mr-1.5" /> {article.category || 'General'}</div>
                    <div className="flex items-center"><Calendar size={14} className="mr-1.5" /> {new Date(article.created_at).toLocaleDateString()}</div>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 flex-grow">{article.title}</h2>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="mt-auto">
                    <Link 
                      to={`/blog/${article.slug || article.id}`} 
                      className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-300"
                    >
                      Leer más →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ArticleSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-lg">
    <div className="w-full h-56 bg-gray-200 animate-pulse"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-3 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4 animate-pulse"></div>
      <div className="h-5 bg-blue-200 rounded w-1/3 animate-pulse mt-auto"></div>
    </div>
  </div>
);

export default Blog;
