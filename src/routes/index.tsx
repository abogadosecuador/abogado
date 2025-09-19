import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages que existen
const HomePage = React.lazy(() => import('../pages/HomePage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Blog = React.lazy(() => import('../pages/Blog'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

// Layout removido - usando rutas directas

const Loading = () => <div className="flex items-center justify-center min-h-screen">Cargando...</div>;

// Admin Panel
const AdminPanel = React.lazy(() => import('../pages/AdminPanel'));

const AppRoutes = () => {
  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sobre-nosotros" element={<AboutPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
