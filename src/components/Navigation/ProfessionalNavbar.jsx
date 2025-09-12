import { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition, Popover } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, UserIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { FaGavel, FaBook, FaStore, FaFileAlt, FaEnvelope, FaWhatsapp, FaPhone, FaUserPlus, FaSignInAlt, FaHome, FaNewspaper } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const mainNavigation = [
  { name: 'Inicio', href: '/', icon: FaHome },
  { name: 'Servicios', href: '/services', hasSubmenu: true, icon: FaGavel },
  { name: 'Productos', href: '/products', hasSubmenu: true, icon: FaStore },
  { name: 'Consultas', href: '/consultations', icon: FaFileAlt },
  { name: 'Blog', href: '/blog', icon: FaNewspaper },
  { name: 'Contacto', href: '/contact', icon: FaEnvelope },
];

const serviceSubmenu = [
  { name: 'Derecho Penal', href: '/services/penal' },
  { name: 'Derecho Civil', href: '/services/civil' },
  { name: 'Derecho Comercial', href: '/services/comercial' },
  { name: 'Tránsito', href: '/services/transito' },
  { name: 'Aduanero', href: '/services/aduanas' },
];

const productosSubmenu = [
  { name: 'Cursos', href: '/courses' },
  { name: 'E-Books', href: '/ebooks' },
  { name: 'Planes', href: '/plans' },
  { name: 'Catálogo', href: '/catalog' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function ProfessionalNavbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { items, total, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      {({ open }) => (
        <>
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="flex sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Abrir menú</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <FaGavel className="text-white text-lg" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-lg font-bold text-gray-900">Abg. Wilson Ipiales</span>
                    <span className="text-xs text-gray-500 block">Asesoría Legal Profesional</span>
                  </div>
                </Link>
              </div>

              {/* Desktop navigation */}
              <div className="hidden sm:flex items-center space-x-1">
                {mainNavigation.map((item) => 
                  item.hasSubmenu ? (
                    <Popover key={item.name} className="relative">
                      {({ open }) => (
                        <>
                          <Popover.Button
                            className={classNames(
                              isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600',
                              'group inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                            )}
                          >
                            <item.icon className="mr-1.5 h-4 w-4" />
                            <span>{item.name}</span>
                            <ChevronDownIcon className={classNames('ml-1 h-4 w-4 transition-transform', open ? 'rotate-180' : '')} />
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
                            <Popover.Panel className="absolute left-0 z-10 mt-3 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                              <div className="py-1">
                                {(item.name === 'Servicios' ? serviceSubmenu : productosSubmenu).map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    to={subItem.href}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
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
                        isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600',
                        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                      )}
                    >
                      <item.icon className="mr-1.5 h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                )}
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-2">
                {/* Cart */}
                <div className="relative">
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                    {items && items.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
                        {items.length}
                      </span>
                    )}
                  </button>

                  {/* Cart Dropdown */}
                  {isCartOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Carrito de Compras</h3>
                        {items && items.length > 0 ? (
                          <>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">Cant: {item.quantity || 1} - ${item.price}</p>
                                  </div>
                                  <button
                                    onClick={() => removeFromCart(item.id, item.type)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex justify-between mb-3">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold text-blue-600">${total?.toFixed(2) || '0.00'}</span>
                              </div>
                              <Link
                                to="/checkout"
                                onClick={() => setIsCartOpen(false)}
                                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Finalizar Compra
                              </Link>
                            </div>
                          </>
                        ) : (
                          <p className="text-center py-4 text-gray-500">Tu carrito está vacío</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact buttons */}
                <div className="hidden lg:flex items-center space-x-2">
                  <a 
                    href="https://wa.me/593988835269" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <FaWhatsapp className="mr-1 h-3 w-3" />
                    WhatsApp
                  </a>
                </div>

                {/* Auth buttons */}
                {user ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <UserIcon className="h-6 w-6" />
                    </Menu.Button>
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
                              className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                            >
                              Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                            >
                              Mi Perfil
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700')}
                            >
                              Cerrar Sesión
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/register"
                      className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FaUserPlus className="mr-1 h-3 w-3" />
                      Registro
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaSignInAlt className="mr-1 h-3 w-3" />
                      Ingresar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                >
                  <item.icon className="inline mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile auth buttons */}
              {!user && (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-4 py-2 mt-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default ProfessionalNavbar;
