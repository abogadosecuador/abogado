import { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition, Popover } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, UserIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { FaUsers, FaHandshake, FaComments, FaGavel, FaBook, FaShieldAlt, FaFileContract, FaFileAlt, FaUserTie, FaWhatsapp, FaPhone, FaEnvelope, FaUserPlus, FaSignInAlt, FaLock, FaShoppingCart, FaStore } from 'react-icons/fa';
import { authService, dataService } from '../../services/apiService';
import { useCart } from '../../context/CartContext';

const mainNavigation = [
  { name: 'Inicio', href: '/', current: false },
  { name: 'Servicios', href: '/servicios', current: false, icon: <FaGavel className="text-blue-600" /> },
  { name: 'Consultas', href: '#', current: false, hasSubmenu: true, icon: <FaFileAlt className="text-blue-600" /> },
  { name: 'Productos', href: '#', current: false, hasSubmenu: true, icon: <FaStore className="text-blue-600" /> },
  { name: 'Calendario', href: '/calendario', current: false, icon: <FaBook className="text-blue-600" /> },
  { name: 'Comunidad', href: '#', current: false, hasSubmenu: true, icon: <FaUsers className="text-blue-600" /> },
  { name: 'Contacto', href: '/contacto', current: false, icon: <FaEnvelope className="text-blue-600" /> },
];

const serviceSubmenu = [
  { name: 'Derecho Penal', href: '/servicios/penal', current: false, icon: <FaGavel className="text-red-500" /> },
  { name: 'Derecho Civil', href: '/servicios/civil', current: false, icon: <FaFileContract className="text-blue-500" /> },
  { name: 'Derecho Comercial', href: '/servicios/comercial', current: false, icon: <FaFileAlt className="text-green-500" /> },
  { name: 'Derecho de Tránsito', href: '/servicios/transito', current: false, icon: <FaFileAlt className="text-yellow-500" /> },
  { name: 'Derecho Aduanero', href: '/servicios/aduanas', current: false, icon: <FaFileAlt className="text-purple-500" /> },
];

const consultasSubmenu = [
  { name: 'Consulta General', href: '/consulta-general', current: false, icon: <FaFileAlt className="text-blue-500" /> },
  { name: 'Consultas Civiles', href: '/consultas/civiles', current: false, icon: <FaFileContract className="text-green-500" /> },
  { name: 'Consultas Penales', href: '/consultas/penales', current: false, icon: <FaGavel className="text-red-500" /> },
  { name: 'Consultas de Tránsito', href: '/servicios/transito', current: false, icon: <FaFileAlt className="text-yellow-500" /> },
  { name: 'Consulta con IA', href: '/consulta-ia', current: false, icon: <FaUserTie className="text-purple-500" /> },
];

const comunidadSubmenu = [
  { name: 'Programa de Afiliados', href: '/afiliados', current: false, icon: <FaUsers className="text-blue-500" /> },
  { name: 'Programa de Referidos', href: '/referidos', current: false, icon: <FaHandshake className="text-green-500" /> },
  { name: 'Testimonios', href: '/testimonios', current: false, icon: <FaComments className="text-yellow-500" /> },
  { name: 'Foro Legal', href: '/foro', current: false, icon: <FaComments className="text-purple-500" /> },
  { name: 'Blog Legal', href: '/blog-legal', current: false, icon: <FaBook className="text-purple-500" /> },
  { name: 'Newsletter', href: '/newsletter', current: false, icon: <FaEnvelope className="text-orange-500" /> },
  { name: 'E-Books', href: '/ebooks', current: false, icon: <FaBook className="text-indigo-500" /> },
];

// Nuevo submenú para Productos
const productosSubmenu = [
  { name: 'Todos los Productos', href: '/productos', current: false, icon: <FaStore className="text-blue-500" /> },
  { name: 'E-Books Legales', href: '/ebooks', current: false, icon: <FaBook className="text-green-500" /> },
  { name: 'Cursos Online', href: '/cursos', current: false, icon: <FaBook className="text-purple-500" /> },
  { name: 'Planes de Suscripción', href: '/planes', current: false, icon: <FaShieldAlt className="text-indigo-500" /> },
  { name: 'Tienda Legal', href: '/tienda', current: false, icon: <FaStore className="text-orange-500" /> },
];

// Submenú para Políticas y Seguridad
const policySubmenu = [
  { name: 'Política de Privacidad', href: '/privacidad', current: false, icon: <FaShieldAlt className="text-gray-500" /> },
  { name: 'Términos y Condiciones', href: '/terminos', current: false, icon: <FaFileContract className="text-gray-500" /> },
  { name: 'Seguridad', href: '/seguridad', current: false, icon: <FaLock className="text-gray-500" /> },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Navbar() {
  const [session, setSession] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { items, total, removeFromCart } = useCart();

  useEffect(() => {
    // Establecer la sesión inicial
    const setInitialSession = async () => {
      try {
        // Verificar si hay un token en localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          const { user } = await authService.getCurrentUser();
          setSession({ user });
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error('Error al obtener la sesión inicial:', error);
        setSession(null);
      }
    };
    setInitialSession();

    // Simplificamos la lógica de escucha de cambios de autenticación
    const handleAuthChange = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        authService.getCurrentUser().then(({ user }) => {
          if (user) setSession({ user });
        });
      } else {
        setSession(null);
      }
    };

    // Comprobamos cada 5 segundos si el token cambió
    const interval = setInterval(handleAuthChange, 5000);
    
    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

  const updatedNavigation = mainNavigation.map(item => ({
    ...item,
    current: location.pathname === item.href || 
             (item.href !== '#' && item.href !== '/' && location.pathname.includes(item.href))
  }));

  // Añadir entrada para Políticas y Seguridad
  const allNavigation = [...updatedNavigation, { 
    name: 'Políticas', 
    href: '#', 
    current: location.pathname === '/privacidad' || location.pathname === '/terminos' || location.pathname === '/seguridad', 
    hasSubmenu: true, 
    icon: <FaShieldAlt className="text-blue-600" /> 
  }];

  return (
    <Disclosure as="nav" className="bg-white shadow-lg sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-screen-xl overflow-x-hidden">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden z-50">
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Abrir menú principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Desktop navigation */}
              <div className="flex flex-1 items-center justify-center sm:justify-start overflow-x-hidden">
                {/* Logo completely removed as requested */}
                <div className="hidden sm:ml-6 sm:flex flex-wrap gap-x-2 gap-y-2 md:gap-x-4 max-w-full">
                  {allNavigation.map((item) => 
                    item.hasSubmenu ? (
                      <Popover className="relative" key={item.name}>
                        {({ open }) => (
                          <>
                            <Popover.Button
                              className={classNames(
                                item.current ? 'bg-blue-700 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                                'rounded-md px-3 py-2 text-sm font-medium flex items-center group transition-colors'
                              )}
                            >
                              <span className="mr-1">{item.icon}</span>
                              <span>{item.name}</span>
                              <ChevronDownIcon 
                                className={classNames(
                                  'ml-1 h-4 w-4 transition-transform',
                                  open ? 'rotate-180 transform' : ''
                                )}
                              />
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
                              <Popover.Panel className="absolute left-1/2 z-50 mt-1 w-56 -translate-x-1/2 transform">
                                <div className="rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                                  <div className="relative grid gap-1 p-2">
                                    {(item.name === 'Servicios' ? serviceSubmenu : 
                                      item.name === 'Consultas' ? consultasSubmenu : 
                                      item.name === 'Productos' ? productosSubmenu :
                                      item.name === 'Comunidad' ? comunidadSubmenu :
                                      item.name === 'Políticas' ? policySubmenu : []).map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        to={subItem.href}
                                        className={classNames(
                                          subItem.current ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                                          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                                        )}
                                      >
                                        <span className="mr-2">{subItem.icon}</span>
                                        <span>{subItem.name}</span>
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
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current ? 'bg-blue-700 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                          'rounded-md px-3 py-2 text-sm font-medium flex items-center transition-colors'
                        )}
                      >
                        <span className="mr-1">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    )
                  )}
                </div>
              </div>

              {/* Right side buttons */}
              <div className="absolute inset-y-0 right-0 flex items-center space-x-1 sm:static sm:space-x-2">
                {/* Cart Button Professional */}
                <div className="relative">
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="relative p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-all duration-200 group"
                  >
                    <ShoppingCartIcon className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    {items && items.length > 0 && (
                      <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg animate-pulse">
                        {items.length}
                      </span>
                    )}
                  </button>
                  
                  {/* Cart Dropdown Professional */}
                  {isCartOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                        <h3 className="font-bold text-lg flex items-center">
                          <ShoppingCartIcon className="h-5 w-5 mr-2" />
                          Carrito de Compras
                        </h3>
                        <p className="text-xs text-blue-100 mt-1">{items?.length || 0} artículos</p>
                      </div>
                      <div className="p-4">
                        {items && items.length > 0 ? (
                          <>
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                              {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500">Cant: {item.quantity || 1}</span>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs font-medium text-blue-600">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeFromCart(item.id, item.type)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span className="font-medium">${total?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">IVA (12%):</span>
                                  <span className="font-medium">${((total || 0) * 0.12).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                  <span className="font-bold text-gray-800">Total:</span>
                                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ${((total || 0) * 1.12).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Link
                                  to="/checkout"
                                  onClick={() => setIsCartOpen(false)}
                                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                  Finalizar Compra
                                </Link>
                                <Link
                                  to="/tienda"
                                  onClick={() => setIsCartOpen(false)}
                                  className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Continuar Comprando
                                </Link>
                              </div>
                            </div>
                        </>
                        ) : (
                          <div className="text-center py-8">
                            <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium mb-4">Tu carrito está vacío</p>
                            <Link
                              to="/tienda"
                              onClick={() => setIsCartOpen(false)}
                              className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                            >
                              Explorar Tienda
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Auth buttons */}
                {session ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-blue-100 p-1 text-blue-600 hover:bg-blue-200 focus:outline-none">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Abrir menú de usuario</span>
                        <UserIcon className="h-6 w-6" aria-hidden="true" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/dashboard"
                              className={classNames(
                                active ? 'bg-blue-50' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Mi Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={async () => {
                                await authService.signOut();
                              }}
                              className={classNames(
                                active ? 'bg-blue-50' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Cerrar Sesión
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-1">
                    <Link
                      to="/registro"
                      className="inline-flex items-center p-1.5 text-xs font-medium rounded text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100"
                    >
                      <FaUserPlus className="mr-1" /> Registrarse
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center p-1.5 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaSignInAlt className="mr-1" /> Iniciar Sesión
                    </Link>
                  </div>
                )}
                
                {/* Contact Action Buttons - Hidden on small screens */}
                <div className="hidden md:flex md:items-center space-x-1">
                  <a 
                    href="tel:+593988835269" 
                    className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    <FaPhone className="mr-1" /> Llamar
                  </a>
                  <a 
                    href="https://wa.me/593988835269" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors duration-200"
                  >
                    <FaWhatsapp className="mr-1" /> WhatsApp
                  </a>
                  <Link 
                    to="/contacto" 
                    className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500 transition-colors duration-200"
                  >
                    <FaEnvelope className="mr-1" /> Consulta Gratis
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {allNavigation.map((item) =>
                item.hasSubmenu ? (
                  <Disclosure key={item.name} as="div" className="mt-1">
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={classNames(
                            item.current ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 hover:text-blue-700',
                            'group w-full flex items-center justify-between rounded-md px-2 py-2 text-left text-sm font-medium text-gray-700 focus:outline-none'
                          )}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                          <ChevronDownIcon
                            className={classNames(
                              'h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-transform',
                              open ? 'rotate-180 transform' : ''
                            )}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-1 space-y-1">
                          {(item.name === 'Servicios' ? serviceSubmenu : 
                            item.name === 'Consultas' ? consultasSubmenu : 
                            item.name === 'Productos' ? productosSubmenu :
                            item.name === 'Comunidad' ? comunidadSubmenu :
                            item.name === 'Políticas' ? policySubmenu : []).map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className="group flex items-center rounded-md py-2 pl-4 pr-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <span className="mr-2">{subItem.icon}</span>
                              <span>{subItem.name}</span>
                            </Link>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 hover:text-blue-700',
                      'flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700'
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )
              )}
              
              {/* Mobile Contact Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contacto Directo</h3>
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href="tel:+593988835269" 
                    className="flex items-center justify-center p-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <FaPhone className="mr-1" /> Llamar
                  </a>
                  <a 
                    href="https://wa.me/593988835269" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center p-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-500 hover:bg-green-600"
                  >
                    <FaWhatsapp className="mr-1" /> WhatsApp
                  </a>
                  <Link 
                    to="/contacto" 
                    className="flex items-center justify-center p-2 border border-transparent text-xs font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500 col-span-2 mt-1"
                  >
                    <FaEnvelope className="mr-1" /> Consulta Gratis
                  </Link>
                </div>
              </div>
              
              {/* Mobile Authentication Buttons */}
              {!session && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mi Cuenta</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center p-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaSignInAlt className="mr-1" /> Iniciar Sesión
                    </Link>
                    <Link
                      to="/registro"
                      className="flex items-center justify-center p-2 text-xs font-medium rounded-md text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100"
                    >
                      <FaUserPlus className="mr-1" /> Registrarse
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Navbar;
