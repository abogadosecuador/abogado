import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Calendar, 
  FileText, 
  CreditCard, 
  Award, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  Star,
  Activity,
  DollarSign,
  Package,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, checkSubscription } = useAuthStore();
  const [stats, setStats] = useState({
    activeServices: 0,
    completedCourses: 0,
    pendingConsultations: 0,
    totalPurchases: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    // Simulación de carga de datos - en producción esto vendría de la API
    setStats({
      activeServices: 3,
      completedCourses: 2,
      pendingConsultations: 1,
      totalPurchases: 7
    });

    setRecentActivity([
      {
        id: 1,
        type: 'purchase',
        title: 'Consultoría Legal Comprada',
        description: 'Servicio de consultoría legal empresarial',
        date: new Date(Date.now() - 86400000),
        status: 'completed'
      },
      {
        id: 2,
        type: 'course',
        title: 'Curso Iniciado',
        description: 'Derecho Tributario Básico',
        date: new Date(Date.now() - 172800000),
        status: 'in_progress'
      },
      {
        id: 3,
        type: 'consultation',
        title: 'Consulta Agendada',
        description: 'Consulta con Dr. Wilson - 15 de Enero',
        date: new Date(Date.now() - 259200000),
        status: 'pending'
      }
    ]);

    setNotifications([
      {
        id: 1,
        type: 'info',
        message: 'Tu suscripción se renovará en 5 días',
        date: new Date()
      },
      {
        id: 2,
        type: 'success',
        message: 'Nuevo curso disponible: Derecho Penal Avanzado',
        date: new Date(Date.now() - 3600000)
      }
    ]);
  };

  const subscription = checkSubscription();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Sesión cerrada exitosamente');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'services', label: 'Mis Servicios', icon: ShoppingBag },
    { id: 'courses', label: 'Mis Cursos', icon: BookOpen },
    { id: 'consultations', label: 'Consultas', icon: MessageSquare },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'purchases', label: 'Historial', icon: FileText },
    { id: 'subscription', label: 'Suscripción', icon: CreditCard },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const quickActions = [
    { label: 'Agendar Consulta', icon: Calendar, action: () => navigate('/consulta-gratis'), color: 'blue' },
    { label: 'Ver Cursos', icon: BookOpen, action: () => navigate('/cursos'), color: 'green' },
    { label: 'Comprar Tokens', icon: CreditCard, action: () => navigate('/suscripciones'), color: 'purple' },
    { label: 'Centro de Ayuda', icon: MessageSquare, action: () => navigate('/contacto'), color: 'orange' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Activity className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-5 h-5" />;
      case 'course':
        return <BookOpen className="w-5 h-5" />;
      case 'consultation':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-xl h-screen sticky top-16">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.full_name || 'Usuario'}</h3>
                <p className="text-sm text-gray-500 capitalize">{subscription.plan || 'Free'} Plan</p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mt-4 text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bienvenido, {user?.full_name?.split(' ')[0] || 'Usuario'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Servicios Activos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeServices}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+12%</span>
                <span className="text-gray-500 ml-1">vs mes anterior</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cursos Completados</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedCourses}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">60% del objetivo</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Consultas Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingConsultations}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <Link to="/consultas" className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-700">
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Tokens Disponibles</p>
                  <p className="text-2xl font-bold mt-1">
                    {user?.tokens_remaining === -1 ? '∞' : user?.tokens_remaining || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
              <button
                onClick={() => navigate('/suscripciones')}
                className="mt-4 w-full bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-lg text-sm font-medium"
              >
                Recargar Tokens
              </button>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={action.action}
                  className={`p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group`}
                >
                  <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent Activity & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        {getStatusIcon(activity.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(activity.date, "d 'de' MMMM, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver toda la actividad →
              </button>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notificaciones</h2>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {format(notification.date, "HH:mm", { locale: es })}
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todas las notificaciones →
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;