import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componentes lazy existentes en src/pages
const HomePage = React.lazy(() => import('../pages/HomePage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPageProfessional'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const Blog = React.lazy(() => import('../pages/Blog.jsx'));
const CatalogPage = React.lazy(() => import('../pages/CatalogPage'));
const MasterclassPage = React.lazy(() => import('../pages/MasterclassPage'));
// Páginas adicionales
const CalendarPage = React.lazy(() => import('../pages/CalendarPage'));
const ProcessSearch = React.lazy(() => import('../pages/ProcessSearch.jsx'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage.jsx'));

// Fallback genérico
const Loading = () => <div className="loading-spinner">Cargando...</div>;

// Layout público unificado
const PublicLayout = React.lazy(() => import('../layouts/PublicLayout'));

const AppRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        {/* Rutas públicas anidadas bajo PublicLayout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="sobre-nosotros" element={<AboutPage />} />
          <Route path="servicios" element={<ServicesPage />} />
          <Route path="contacto" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="blog" element={<Blog />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="calendario" element={<CalendarPage onNavigate={() => {}} isLoggedIn={false} userRole="user" />} />
          <Route path="consultas" element={<ProcessSearch />} />
          <Route path="masterclass" element={<MasterclassPage />} />
        </Route>

        {/* Rutas privadas */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Ruta para la página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
