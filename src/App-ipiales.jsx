import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Componente de carga para usar con React.lazy
function LoadingIndicator() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-600">AW</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Abogado Wilson</h1>
        <p className="text-lg text-gray-600">Cargando aplicación...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

// Componentes de navegación y estructura - siempre cargar de forma estática
import Navbar from './components/Navigation/Navbar';
import Footer from './components/Footer/Footer';
import { useAuth } from './context/AuthContext';

// Componentes principales cargados dinámicamente con React.lazy
const Hero = lazy(() => import('./components/Hero'));
const Services = lazy(() => import('./components/Services'));
const BlogComponent = lazy(() => import('./components/Blog'));
const ProcessSearch = lazy(() => import('./components/ProcessSearch'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Newsletter = lazy(() => import('./components/Newsletter/Newsletter'));

// Nuevas páginas
const Blog = lazy(() => import('./pages/Blog'));
const PoliticasCondiciones = lazy(() => import('./pages/PoliticasCondiciones'));
const Seguridad = lazy(() => import('./pages/Seguridad'));
const ConsultaGeneral = lazy(() => import('./pages/ConsultaGeneral'));
const ConsultaIA = lazy(() => import('./pages/ConsultaIA'));

// Componentes de foro y comunicación
const Chat = lazy(() => import('./components/Chat'));
const Forum = lazy(() => import('./components/Forum'));
const TopicDetail = lazy(() => import('./components/Forum/TopicDetail'));

// Componentes de páginas informativas
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const JudicialNews = lazy(() => import('./components/JudicialNews'));
const Afiliados = lazy(() => import('./components/Afiliados'));
const Referidos = lazy(() => import('./components/Referidos'));
const Registration = lazy(() => import('./components/Registration'));
const ContactPage = lazy(() => import('./components/Contact/ContactPage'));

// Componentes de dashboard y administración
const DashboardPage = lazy(() => import('./components/Dashboard/DashboardPage'));
const ClientDashboard = lazy(() => import('./components/Dashboard/ClientDashboard'));
const AppointmentCalendar = lazy(() => import('./components/Appointment/AppointmentCalendar'));

// Componentes comunes y complementarios
const CookieConsent = lazy(() => import('./components/Common/CookieConsent'));
const ConsultationHub = lazy(() => import('./components/Consultation/ConsultationHub'));
const Ebooks = lazy(() => import('./components/Ebooks'));

// Componentes de pagos y transacciones
const PaymentForm = lazy(() => import('./components/Payment/PaymentForm'));
const ThankYouPage = lazy(() => import('./components/Payment/ThankYouPage'));
const CheckoutForm = lazy(() => import('./components/Payment/CheckoutForm'));

// Componentes de consultas específicas
const ConsultasPenales = lazy(() => import('./components/ConsultasPenales'));
const ConsultasTransito = lazy(() => import('./components/ConsultasTransito'));
const ConsultasCiviles = lazy(() => import('./components/ConsultasCiviles'));

// Componentes de autenticación
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));

// Servicios específicos
const Penal = lazy(() => import('./components/Services/Penal'));
const Civil = lazy(() => import('./components/Services/Civil'));
const Comercial = lazy(() => import('./components/Services/Comercial'));
const Transito = lazy(() => import('./components/Services/Transito'));
const Aduanas = lazy(() => import('./components/Services/Aduanas'));

// Componentes de chat
const WhatsAppChat = lazy(() => import('./components/Chat/WhatsAppChat'));
const LiveChat = lazy(() => import('./components/Chat/LiveChat'));
// Juegos
const TicTacToe = lazy(() => import('./components/Games/TicTacToe'));

// Importamos el componente para descarga protegida
const ProtectedDownload = lazy(() => import('./components/ProtectedDownload'));

// Determinar la URL base según el entorno (similar a apiService.js)
const getBaseUrl = () => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';  // URL relativa para Cloudflare
  }
  return 'http://localhost:8787';
};

// Importar el contexto de módulos
import { ModuleProvider, useModules } from './context/ModuleContext';

function App() {
  const [apiReady, setApiReady] = useState(true); // Optimista por defecto
  const [isLoading, setIsLoading] = useState(true);

  // Verificar la API al iniciar
  useEffect(() => {
    const verifyApiConnection = async () => {
      try {
        // En producción, asumimos que la API está lista
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          setApiReady(true);
          setIsLoading(false);
          return;
        }

        const healthEndpoint = `${getBaseUrl()}/api/health`;
        const response = await axios.get(healthEndpoint, { timeout: 5000 });
        
        if (response.status === 200) {
          setApiReady(true);
          toast.success('Conexión a la API establecida', {
            id: 'api-connection',
            duration: 3000
          });
        } else {
          throw new Error('API no disponible');
        }
      } catch (error) {
        console.warn('No se pudo conectar a la API. Trabajando en modo offline.', error);
        // En desarrollo, podemos seguir a pesar de no tener API
        setApiReady(true);
        toast.error('API no disponible. Trabajando en modo offline', {
          id: 'api-connection',
          duration: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyApiConnection();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!apiReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Servicio no disponible</h2>
            <p className="mt-2 text-sm text-gray-600">
              Lo sentimos, el servicio no está disponible en este momento. Por favor, inténtelo más tarde.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-5 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <ModuleProvider>
        <AppContent />
      </ModuleProvider>
    </Suspense>
  );
}

// Componente AppContent separado para usar el contexto de autenticación
function AppContent() {
  // Protección contra errores en el contexto de autenticación
  const authContext = useAuth() || {};
  const { user, isAuthenticated = false, loading = false } = authContext;
  const location = useLocation();
  
  // Obtener el contexto de módulos
  const { preloadCriticalModules, isLoading: modulesLoading } = useModules();
  
  // Cargar módulos críticos al iniciar
  useEffect(() => {
    console.log('[AppContent] Precargando módulos críticos...');
    preloadCriticalModules().catch(error => {
      console.warn('[AppContent] Error al precargar módulos:', error);
    });
  }, []);
  
  // Mostrar un spinner mientras se determina si el usuario está autenticado o los módulos están cargando
  if (loading || modulesLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          {/* Página principal */}
          <Route path="/" element={
            <>
              <Hero />
              <Services />
              <Testimonials />
              <BlogComponent />
              <ProcessSearch />
              <Newsletter />
            </>
          } />
          
          {/* Servicios */}
          <Route path="/servicios/penal" element={<Penal />} />
          <Route path="/servicios/civil" element={<Civil />} />
          <Route path="/servicios/comercial" element={<Comercial />} />
          <Route path="/servicios/transito" element={<Transito />} />
          <Route path="/servicios/aduanas" element={<Aduanas />} />
          
          {/* Consultas */}
          <Route path="/consultas/penales" element={<ConsultasPenales />} />
          <Route path="/consultas/transito" element={<ConsultasTransito />} />
          <Route path="/consultas/civiles" element={<ConsultasCiviles />} />
          <Route path="/consultas" element={<ConsultaGeneral />} />
          
          {/* Otras rutas */}
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/chat" element={<LiveChat />} />
          <Route path="/noticias" element={<JudicialNews />} />
          <Route path="/afiliados" element={<Afiliados />} />
          <Route path="/referidos" element={<Referidos />} />
          <Route path="/consulta" element={<ConsultationHub />} />
          {/* Juegos */}
          <Route path="/juegos/3enraya" element={<TicTacToe />} />
          <Route path="/ebooks" element={<Ebooks />} />
          <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos-condiciones" element={<PoliticasCondiciones />} />
          <Route path="/terminos" element={<PoliticasCondiciones />} />
          <Route path="/seguridad" element={<Seguridad />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/consulta-general" element={<ConsultaGeneral />} />
          <Route path="/consulta-ia" element={<ConsultaIA />} />
          
          {/* Foro */}
          <Route path="/foro" element={<Forum />} />
          <Route path="/foro/tema/:id" element={<TopicDetail />} />
          
          {/* Rutas de autenticación */}
          <Route path="/registro" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
          } />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/recuperar-password" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />
          } />
          <Route path="/reset-password" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />
          } />
          
          {/* Rutas protegidas */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          } />
          <Route path="/cliente" element={
            <RequireAuth>
              <ClientDashboard />
            </RequireAuth>
          } />
          <Route path="/calendario" element={
            <RequireAuth>
              <AppointmentCalendar />
            </RequireAuth>
          } />
          <Route path="/pago" element={
            <RequireAuth>
              <PaymentForm />
            </RequireAuth>
          } />
          <Route path="/checkout" element={
            <RequireAuth>
              <CheckoutForm />
            </RequireAuth>
          } />
          <Route path="/gracias" element={<ThankYouPage />} />
          <Route path="/ebooks/download/:id" element={<ProtectedDownload />} />
          
          {/* Ruta de fallback */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-md w-full space-y-8 text-center">
                <h1 className="text-4xl font-extrabold text-red-600">404</h1>
                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  Página no encontrada
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  La página que estás buscando no existe o ha sido movida.
                </p>
                <div className="mt-5">
                  <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                    Volver al inicio
                  </Link>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
      
      <Footer />
      <CookieConsent />
      <WhatsAppChat />
    </>
  );
}

// Componente para proteger rutas que requieren autenticación
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redireccionar al login, guardando la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default App;
