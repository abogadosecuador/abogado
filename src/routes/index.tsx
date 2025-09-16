import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/routing/PrivateRoute';

// Componentes lazy existentes en src/pages
const HomePage = React.lazy(() => import('../pages/HomePage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPageProfessional'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const Blog = React.lazy(() => import('../pages/Blog'));
const CatalogPage = React.lazy(() => import('../pages/CatalogPage'));
// Páginas adicionales
const CalendarPage = React.lazy(() => import('../pages/CalendarPage'));
const ProcessSearch = React.lazy(() => import('../components/ProcessSearch'));

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
            <Route path="about" element={<AboutPage />} />
            <Route path="servicios" element={<ServicesPage />} />
            <Route path="contact" element={<ContactPage />} />
            {/* Alias para compatibilidad */}
            <Route path="contacto" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegisterPage />} />
            <Route path="blog" element={<Blog />} />
            <Route path="catalogo" element={<CatalogPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="consultas" element={<ProcessSearch />} />
          </Route>

          {/* Rutas privadas */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* 404 genérico: reutilizamos HomePage o una NotFound si existe */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
};

export default AppRoutes;
