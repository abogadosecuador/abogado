import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes lazy existentes en src/pages
const HomePage = React.lazy(() => import('../pages/HomePage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const Blog = React.lazy(() => import('../pages/Blog'));
const CatalogPage = React.lazy(() => import('../pages/CatalogPage'));

// Fallback genérico
const Loading = () => <div className="loading-spinner">Cargando...</div>;

// Layout público unificado
const PublicLayout = React.lazy(() => import('../layouts/PublicLayout'));

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <React.Suspense fallback={<Loading />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<PublicLayout />}> 
            <Route index element={<HomePage />} />
            <Route path="sobre-nosotros" element={<AboutPage />} />
            <Route path="servicios" element={<ServicesPage />} />
            <Route path="contact" element={<ContactPage />} />
            {/* Alias para compatibilidad */}
            <Route path="contacto" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegisterPage />} />
            <Route path="blog" element={<Blog />} />
            <Route path="catalogo" element={<CatalogPage />} />
          </Route>

          {/* Rutas privadas (si requieren layout propio, se puede ajustar) */}
          <Route path="/dashboard/*" element={<DashboardPage />} />

          {/* 404 genérico: reutilizamos HomePage o una NotFound si existe */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
};

export default AppRoutes;
