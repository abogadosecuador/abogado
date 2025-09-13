import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ModuleProvider } from './context/ModuleContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, AdminRoute, ClientRoute, VisitorOnlyRoute } from './middleware/roleMiddleware.jsx';
import Navbar from './components/Navigation/Navbar';
import Footer from './components/Footer/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';
import AIChatSystem from './components/Chat/AIChatSystem';
import FloatingCart from './components/Cart/FloatingCart';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./components/Home/HomePage'));
const Contact = lazy(() => import('./components/Contact/Contact'));
const Blog = lazy(() => import('./components/Blog/Blog'));
const BlogArticle = lazy(() => import('./components/Blog/BlogArticle'));
const ServicesOverview = lazy(() => import('./pages/ServicesOverview'));
const ServicioPenalPage = lazy(() => import('./pages/ServicioPenalPage'));
const ServicioCivilPage = lazy(() => import('./pages/ServicioCivilPage'));
const ServicioComercialPage = lazy(() => import('./pages/ServicioComercialPage'));
const ServicioTransitoPage = lazy(() => import('./pages/ServicioTransitoPage'));
const ServicioAduaneroPage = lazy(() => import('./pages/ServicioAduaneroPage'));
const ServicioConstitucionalPage = lazy(() => import('./pages/ServicioConstitucionalPage.jsx'));
const ServicioLaboralPage = lazy(() => import('./pages/ServicioLaboralPage.jsx'));
const ConsultasCivilesPage = lazy(() => import('./pages/ConsultasCivilesPage'));
const ConsultasPenalesPage = lazy(() => import('./pages/ConsultasPenalesPage'));
const ConsultaGeneral = lazy(() => import('./pages/ConsultaGeneral'));
const TestimoniosPage = lazy(() => import('./pages/TestimoniosPage'));
const AfiliadosPage = lazy(() => import('./pages/AfiliadosPage'));
const ReferidosPage = lazy(() => import('./pages/ReferidosPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'));
const NewsPage = lazy(() => import('./pages/NewsPage.jsx'));
const NewsArticle = lazy(() => import('./pages/NewsArticle.jsx'));
const AboutPage = lazy(() => import('./components/About/AboutPage'));
const Ebooks = lazy(() => import('./components/Ebooks/EbookStore'));
const CourseCatalog = lazy(() => import('./components/Courses/CourseSystem'));
const SubscriptionPlans = lazy(() => import('./components/Subscriptions/SubscriptionPlans'));
const CourseDetail = lazy(() => import('./pages/CourseDetailPage'));
const UnifiedStore = lazy(() => import('./components/Store/UnifiedStore'));
const AppointmentScheduler = lazy(() => import('./components/Appointment/AppointmentScheduler'));
const AIConsultationSystem = lazy(() => import('./components/Consultation/AIConsultationSystem'));

const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));

const DashboardLayout = lazy(() => import('./components/Dashboard/DashboardLayout'));
const DashboardOverview = lazy(() => import('./components/Dashboard/DashboardOverview'));
const PurchaseHistory = lazy(() => import('./components/Dashboard/PurchaseHistory'));
const UserProfile = lazy(() => import('./components/Dashboard/UserProfile'));
const UserCourses = lazy(() => import('./components/Dashboard/UserCourses'));
const SubscriptionManagement = lazy(() => import('./components/Dashboard/SubscriptionManagement'));

const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const AdminOverview = lazy(() => import('./components/Admin/AdminOverview'));
const UserManagement = lazy(() => import('./components/Admin/UserManagement'));
const BlogManagement = lazy(() => import('./components/Admin/BlogManagement'));
const CourseManagement = lazy(() => import('./components/Admin/CourseManagement'));
const ProductManagement = lazy(() => import('./components/Admin/ProductManagement'));

const CheckoutSystem = lazy(() => import('./components/Checkout/CheckoutSystem'));
const ThankYouPage = lazy(() => import('./components/Payment/ThankYouPage'));

const NotFoundPage = lazy(() => import('./components/Common/NotFoundPage'));

const App = () => (
    <AuthProvider>
        <CartProvider>
            <ModuleProvider>
                <ThemeProvider>
                    <div className="App min-h-screen bg-background-primary text-text-primary w-full overflow-x-hidden">
                        <Navbar />
                        <main className="flex-1 w-full no-x-overflow">
                            <Suspense fallback={<LoadingSpinner />}>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/servicios" element={<ServicesOverview />} />
                                    <Route path="/servicios/penal" element={<ServicioPenalPage />} />
                                    <Route path="/servicios/civil" element={<ServicioCivilPage />} />
                                    <Route path="/servicios/comercial" element={<ServicioComercialPage />} />
                                    <Route path="/servicios/transito" element={<ServicioTransitoPage />} />
                                    <Route path="/servicios/aduanas" element={<ServicioAduaneroPage />} />
                                    <Route path="/servicios/constitucional" element={<ServicioConstitucionalPage />} />
                                    <Route path="/servicios/laboral" element={<ServicioLaboralPage />} />
                                    <Route path="/consulta-general" element={<ConsultaGeneral />} />
                                    <Route path="/consultas/civiles" element={<ConsultasCivilesPage />} />
                                    <Route path="/consultas/penales" element={<ConsultasPenalesPage />} />
                                    <Route path="/consulta-ia" element={<AIConsultationSystem />} />
                                    <Route path="/blog" element={<Blog />} />
                                    <Route path="/blog/:articleId" element={<BlogArticle />} />
                                    <Route path="/noticias" element={<NewsPage />} />
                                    <Route path="/noticias/:id" element={<NewsArticle />} />
                                    <Route path="/foro" element={<ForumPage />} />
                                    <Route path="/newsletter" element={<NewsletterPage />} />
                                    <Route path="/cursos" element={<CourseCatalog />} />
                                    <Route path="/cursos/:slug" element={<CourseDetail />} />
                                    <Route path="/ebooks" element={<Ebooks />} />
                                    <Route path="/planes" element={<SubscriptionPlans />} />
                                    <Route path="/tienda" element={<UnifiedStore />} />
                                    <Route path="/sobre-nosotros" element={<AboutPage />} />
                                    <Route path="/testimonios" element={<TestimoniosPage />} />
                                    <Route path="/afiliados" element={<AfiliadosPage />} />
                                    <Route path="/referidos" element={<ReferidosPage />} />
                                    <Route path="/contacto" element={<Contact />} />
                                    <Route path="/agendar-cita" element={<AppointmentScheduler />} />
                                    <Route path="/privacidad" element={<PrivacyPolicyPage />} />
                                    <Route path="/terminos" element={<TermsConditionsPage />} />

                                    {/* Auth Routes */}
                                    <Route path="/login" element={<VisitorOnlyRoute><Login /></VisitorOnlyRoute>} />
                                    <Route path="/register" element={<VisitorOnlyRoute><Register /></VisitorOnlyRoute>} />
                                    <Route path="/forgot-password" element={<VisitorOnlyRoute><ForgotPassword /></VisitorOnlyRoute>} />

                                    {/* Protected Client Routes */}
                                    <Route path="/dashboard" element={<ClientRoute><DashboardLayout /></ClientRoute>}>
                                        <Route index element={<DashboardOverview />} />
                                        <Route path="perfil" element={<UserProfile />} />
                                        <Route path="compras" element={<PurchaseHistory />} />
                                        <Route path="mis-cursos" element={<UserCourses />} />
                                        <Route path="suscripcion" element={<SubscriptionManagement />} />
                                    </Route>

                                    {/* Protected Admin Routes */}
                                    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                                        <Route index element={<AdminOverview />} />
                                        <Route path="users" element={<UserManagement />} />
                                        <Route path="blog" element={<BlogManagement />} />
                                        <Route path="courses" element={<CourseManagement />} />
                                        <Route path="products" element={<ProductManagement />} />
                                    </Route>

                                    {/* Payment Routes */}
                                    <Route path="/checkout" element={<CheckoutSystem />} />
                                    <Route path="/thank-you" element={<ThankYouPage />} />

                                    {/* Catch-all */}
                                    <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff' } }} />
                        <AIChatSystem />
                        <FloatingCart />
                    </div>
                </ThemeProvider>
            </ModuleProvider>
        </CartProvider>
    </AuthProvider>
);

export default App;
