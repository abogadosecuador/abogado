import React, { useState, useEffect, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition, Popover } from '@headlessui/react';
import { 
  Menu as MenuIcon, 
  X, 
  ChevronDown, 
  User, 
  ShoppingCart as ShoppingCartIcon, 
  Phone, 
  Mail, 
  LogIn, 
  UserPlus,
  LogOut,
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Shield,
  Briefcase,
  Gavel,
  Home,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { FaWhatsapp, FaSignInAlt, FaUserPlus as FaUserPlusIcon } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { items, total, removeFromCart } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setDropdownOpen({});
        setUserMenuOpen(false);
        setIsCartOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const toggleDropdown = (name) => {
    setDropdownOpen(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const navigationLinks = [
    { name: 'Inicio', href: '/', icon: <Home size={16} /> },
    {
        name: 'Servicios',
        icon: <Gavel size={16} />,
        submenu: [
            { name: 'Derecho Penal', href: '/servicios/penal', icon: <Shield size={16} /> },
            { name: 'Derecho Civil', href: '/servicios/civil', icon: <FileText size={16} /> },
            { name: 'Derecho Comercial', href: '/servicios/comercial', icon: <Briefcase size={16} /> },
            { name: 'Derecho de Tránsito', href: '/servicios/transito', icon: <Car size={16} /> },
            { name: 'Derecho Aduanero', href: '/servicios/aduanas', icon: <Anchor size={16} /> },
            { name: 'Derecho Constitucional', href: '/servicios/constitucional', icon: <Scale size={16} /> },
            { name: 'Derecho Laboral', href: '/servicios/laboral', icon: <Users size={16} /> },
        ]
    },
    {
        name: 'Consultas',
        icon: <MessageSquare size={16} />,
        submenu: [
            { name: 'Consulta General', href: '/consulta-general', icon: <MessageSquare size={16} /> },
            { name: 'Consultas Civiles', href: '/consultas/civiles', icon: <FileText size={16} /> },
            { name: 'Consultas Penales', href: '/consultas/penales', icon: <Shield size={16} /> },
            { name: 'Consulta con IA', href: '/consulta-ia', icon: <BrainCircuit size={16} /> },
        ]
    },
    {
        name: 'Recursos',
        icon: <BookOpen size={16} />,
        submenu: [
            { name: 'Blog', href: '/blog', icon: <BookOpen size={16} /> },
            { name: 'Noticias', href: '/noticias', icon: <Newspaper size={16} /> },
            { name: 'Foro', href: '/foro', icon: <Users size={16} /> },
            { name: 'Newsletter', href: '/newsletter', icon: <Mail size={16} /> },
        ]
    },
    {
        name: 'Tienda',
        icon: <ShoppingCartIcon size={16} />,
        submenu: [
            { name: 'Catálogo de Cursos', href: '/cursos', icon: <BookOpen size={16} /> },
            { name: 'Tienda de E-Books', href: '/ebooks', icon: <BookOpen size={16} /> },
            { name: 'Planes de Suscripción', href: '/planes', icon: <CreditCard size={16} /> },
        ]
    },
    {
        name: 'Comunidad',
        icon: <Users size={16} />,
        submenu: [
            { name: 'Sobre Nosotros', href: '/sobre-nosotros', icon: <Info size={16} /> },
            { name: 'Testimonios', href: '/testimonios', icon: <Star size={16} /> },
            { name: 'Afiliados', href: '/afiliados', icon: <Handshake size={16} /> },
            { name: 'Referidos', href: '/referidos', icon: <Users size={16} /> },
        ]
    },
    { name: 'Contacto', href: '/contacto', icon: <Phone size={16} /> },
];

  const isActive = (path) => location.pathname === path;

  return (
    <Disclosure as="nav" className="bg-white shadow-lg sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand to-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">AE</span>
                  </div>
                  <span className="text-xl font-bold text-neutral-900 hidden sm:block">AbogadosEcuador</span>
                </Link>
              </div>

              <div className="hidden lg:flex items-center space-x-1">
                {navigationLinks.map((item) =>
                  item.submenu ? (
                    <Popover key={item.name} className="relative">
                      {({ open: popoverOpen }) => (
                        <>
                          <Popover.Button className='flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-brand focus:outline-none'>
                            <span>{item.name}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${popoverOpen ? 'rotate-180' : ''}`} />
                          </Popover.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                          >
                            <Popover.Panel className="absolute z-10 mt-3 w-screen max-w-xs -translate-x-1/2 transform px-4 sm:px-0">
                              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="relative grid gap-8 bg-white p-7 lg:grid-cols-1">
                                  {item.submenu.map((subItem) => (
                                    <Link
                                      key={subItem.name}
                                      to={subItem.href}
                                      className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                                    >
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white sm:h-12 sm:w-12">
                                        {subItem.icon}
                                      </div>
                                      <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">{subItem.name}</p>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  ) : (
                    <NavLink key={item.name} to={item.href} className="px-3 py-2 rounded-lg text-sm font-medium">
                      {item.name}
                    </NavLink>
                  )
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Link to="/agendar-cita" className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-brand px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-brand-dark">
                  Agendar Cita
                </Link>
                {user ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-neutral-600 hover:text-brand transition-colors">
                      <User className="w-5 h-5" />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={`${active ? 'bg-gray-100' : ''} flex items-center space-x-2 px-4 py-2 text-sm text-gray-700`}>
                              <LayoutDashboard className="w-4 h-4" />
                              <span>Dashboard</span>
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button onClick={handleLogout} className={`${active ? 'bg-gray-100' : ''} w-full flex items-center space-x-2 px-4 py-2 text-sm text-danger text-left`}>
                              <LogOut className="w-4 h-4" />
                              <span>Cerrar Sesión</span>
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <NavLink to="/login" className="px-4 py-2 text-sm font-medium">
                      Iniciar Sesión
                    </NavLink>
                    <Link to="/register" className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors">
                      Registrarse
                    </Link>
                  </div>
                )}
                <Disclosure.Button className="lg:hidden p-2 text-neutral-600 hover:text-brand transition-colors">
                  {open ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigationLinks.map((item) =>
                item.submenu ? (
                  <Disclosure key={item.name}>
                    {({ open: disclosureOpen }) => (
                      <>
                        <Disclosure.Button className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                          <span>{item.name}</span>
                          <ChevronDown className={`w-5 h-5 ${disclosureOpen ? 'rotate-180' : ''}`} />
                        </Disclosure.Button>
                        <Disclosure.Panel className="pl-4">
                          {item.submenu.map((subItem) => (
                            <NavLink key={subItem.name} to={subItem.href} className="block rounded-md py-2 pr-4 pl-3 text-base font-medium">
                              {subItem.name}
                            </NavLink>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ) : (
                  <NavLink key={item.name} to={item.href} className="block rounded-md px-3 py-2 text-base font-medium">
                    {item.name}
                  </NavLink>
                )
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
