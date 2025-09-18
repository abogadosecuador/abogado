import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { dataService } from '../services/supabaseService';
import SEO from '../components/Common/SEO';
import { Calendar, User } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const { data, error } = await dataService.get('posts', { filters: [{ column: 'slug', value: slug }], single: true });
        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Error al cargar el post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20">Cargando artículo...</div>;
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Artículo no encontrado</h1>
        <Link to="/blog" className="mt-4 inline-block text-blue-600 hover:underline">Volver al Blog</Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SEO title={post.title} description={post.excerpt} image={post.image_url} />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <article>
          <header className="mb-8 border-b pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
            <div className="flex items-center text-gray-500 text-sm space-x-4">
              <div className="flex items-center"><User size={14} className="mr-1.5" /> {post.author || 'Equipo Editorial'}</div>
              <div className="flex items-center"><Calendar size={14} className="mr-1.5" /> {new Date(post.created_at).toLocaleDateString()}</div>
            </div>
          </header>
          {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg mb-8" />}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;