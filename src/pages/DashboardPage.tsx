import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ClientDashboard from '../components/Dashboard/ClientDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import MyCoursesPage from './MyCoursesPage';
import MyPurchasesPage from './MyPurchasesPage';
import CoursePlayer from '../components/Dashboard/Client/CoursePlayer';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, BookOpen, LogOut } from 'lucide-react';

const DashboardLayout = ({ children, isAdmin }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const clientMenu = [
    { path: '/dashboard', name: 'General', icon: LayoutDashboard },
    { path: '/dashboard/mis-cursos', name: 'Mis Cursos', icon: BookOpen },
    { path: '/dashboard/mis-compras', name: 'Mis Compras', icon: ShoppingCart },
  ];

  // Menú de admin se manejaría dentro de AdminDashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <nav className="space-y-2">
          {clientMenu.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center p-2 rounded-md text-sm font-medium ${isActive(item.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <item.icon size={18} className="mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center p-2 mt-4 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 w-full">
          <LogOut size={18} className="mr-3" />
          Cerrar Sesión
        </button>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  return (
    <DashboardLayout isAdmin={isAdmin}>
      <Routes>
        <Route index element={<ClientDashboard user={user} />} />
        <Route path="mis-cursos" element={<MyCoursesPage />} />
        <Route path="mis-compras" element={<MyPurchasesPage />} />
        <Route path="cursos/:courseId" element={<CoursePlayer />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;
