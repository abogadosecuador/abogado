import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useCredits } from './context/CreditContext';
import { useTokens } from './context/TokenContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import MainLayout from './layouts/MainLayout';
import EditorLayout from './layouts/EditorLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPageProfessional from './pages/LoginPageProfessional';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import PlansPage from './pages/PlansPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ProductsPage from './pages/ProductsPage';

// Lazy loaded pages
const ServicesLegalPage = lazy(() => import('./pages/ServicesLegalPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));

// Consultation Pages
const PenalConsultationPage = lazy(() => import('./pages/ConsultationTypes/PenalConsultationPage'));
const CivilConsultationPage = lazy(() => import('./pages/ConsultationTypes/CivilConsultationPage'));
const EmpresarialConsultationPage = lazy(() => import('./pages/ConsultationTypes/EmpresarialConsultationPage'));
const QuickConsultationPage = lazy(() => import('./pages/ConsultationTypes/QuickConsultationPage'));
const DigitalConsultationPage = lazy(() => import('./pages/ConsultationTypes/DigitalConsultationPage'));

// Dashboard Pages - Lazy loading for performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard'));
const ClientDashboard = lazy(() => import('./components/Dashboard/ClientDashboard'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const CasesPage = lazy(() => import('./pages/CasesPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PromotionsManager = lazy(() => import('./components/Promotions/PromotionsManager'));
import CatalogPage from './pages/CatalogPage';
import CheckoutPage from './pages/CheckoutPage';
import MyPurchasesPage from './pages/MyPurchasesPage';

// Course Pages
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage from './pages/MyCoursesPage';
import EbooksPage from './pages/EbooksPage';

// Other Pages
import AnalyticsPage from './pages/AnalyticsPage';
import SalesPage from './pages/SalesPage';
import ProjectsPage from './pages/ProjectsPage';
import UsersPage from './pages/UsersPage';
import ConsultationsPage from './pages/ConsultationsPage';
import ServiceDetailPage from './pages/ServiceDetailPage';

function App() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { credits } = useCredits();
  const { tokens } = useTokens();

  useEffect(() => {
    // Aplicar tema
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Función para determinar el tipo de usuario
  const getUserType = () => {
    if (!user) return 'guest';
    // Aquí puedes implementar lógica para determinar si es admin o cliente
    return user.role === 'admin' ? 'admin' : 'client';
  };

  const userType = getUserType();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPageProfessional />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/legal" element={<ServicesLegalPage />} />
          <Route path="services/:id" element={<ServiceDetailPage />} />
          <Route path="consultations/penal" element={<PenalConsultationPage />} />
          <Route path="consultations/civil" element={<CivilConsultationPage />} />
          <Route path="consultations/empresarial" element={<EmpresarialConsultationPage />} />
          <Route path="consultations/rapida" element={<QuickConsultationPage />} />
          <Route path="consultations/digital" element={<DigitalConsultationPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="sobre-nosotros" element={<AboutPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:id" element={<BlogPostPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfServicePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
        </Route>

        {/* Rutas del dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={
            isAuthenticated() ? (
              userType === 'admin' ? <AdminDashboard /> : <ClientDashboard />
            ) : <Navigate to="/login" replace />
          } />
          
          {/* Rutas para clientes */}
          <Route path="client" element={
            isAuthenticated() && userType === 'client' ? <ClientDashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="my-courses" element={
            isAuthenticated() ? <MyCoursesPage /> : <Navigate to="/login" replace />
          } />
          <Route path="my-purchases" element={
            isAuthenticated() ? <MyPurchasesPage /> : <Navigate to="/login" replace />
          } />
          <Route path="profile" element={
            isAuthenticated() ? <ProfilePage /> : <Navigate to="/login" replace />
          } />
          <Route path="calendar" element={
            isAuthenticated() ? <CalendarPage /> : <Navigate to="/login" replace />
          } />
          <Route path="consultations" element={
            isAuthenticated() ? <ConsultationsPage /> : <Navigate to="/login" replace />
          } />

          {/* Rutas para administradores */}
          <Route path="admin" element={
            isAuthenticated() && userType === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="clients" element={
            isAuthenticated() && userType === 'admin' ? <ClientsPage /> : <Navigate to="/login" replace />
          } />
          <Route path="cases" element={
            isAuthenticated() && userType === 'admin' ? <CasesPage /> : <Navigate to="/login" replace />
          } />
          <Route path="analytics" element={
            isAuthenticated() && userType === 'admin' ? <AnalyticsPage /> : <Navigate to="/login" replace />
          } />
          <Route path="sales" element={
            isAuthenticated() && userType === 'admin' ? <SalesPage /> : <Navigate to="/login" replace />
          } />
          <Route path="users" element={
            isAuthenticated() && userType === 'admin' ? <UsersPage /> : <Navigate to="/login" replace />
          } />
          <Route path="settings" element={
            isAuthenticated() ? <SettingsPage /> : <Navigate to="/login" replace />
          } />
        </Route>

        {/* Rutas del checkout */}
        <Route path="/checkout" element={
          isAuthenticated() ? <CheckoutPage /> : <Navigate to="/login" replace />
        } />

        {/* Rutas del editor */}
        <Route path="/editor" element={<EditorLayout />}>
          <Route path="site" element={<div>Editor de Sitio</div>} />
          <Route path="content" element={<div>Editor de Contenido</div>} />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
