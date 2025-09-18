import React, { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition, Popover } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FaGavel, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

// Datos de navegación que podrían venir de un CMS o config
const navConfig = {
  mainNav: [
    { name: 'Inicio', href: '/' },
    { name: 'Servicios', href: '/servicios' },
    { name: 'Tienda', href: '/catalogo' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contacto', href: '/contacto' },
  ],
  contact: {
    whatsapp: '593988835269'
  }
};

const ProfessionalNavbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { items, total, itemCount, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isActive = (href) => location.pathname === href;

  return (
    <Disclosure as="nav" className="bg-white shadow-md sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                  <FaGavel className="h-8 w-8 text-blue-600" />
                  <div>
                    <span className="text-xl font-bold text-gray-800">Abg. Wilson Ipiales</span>
                    <p className="text-xs text-gray-500">Soluciones Legales</p>
                  </div>
                </Link>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:items-center">
                {navConfig.mainNav.map((item) => (
                  <Link key={item.name} to={item.href} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive(item.href) ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button onClick={() => setIsCartOpen(!isCartOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                    <ShoppingCartIcon className="h-6 w-6" />
                    {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemCount}</span>}
                  </button>
                  {/* Dropdown del Carrito */}
                </div>

                {user ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none">
                      <UserCircleIcon className="h-8 w-8 text-gray-500" />
                    </Menu.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                        <Menu.Item><Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700">Dashboard</Link></Menu.Item>
                        <Menu.Item><button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-gray-700">Cerrar Sesión</button></Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="hidden sm:flex items-center space-x-2">
                    <Link to="/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800"><FaSignInAlt className="mr-1" /> Ingresar</Link>
                    <Link to="/register" className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"><FaUserPlus className="mr-1" /> Registro</Link>
                  </div>
                )}

                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                    <Bars3Icon className="block h-6 w-6" />
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navConfig.mainNav.map((item) => (
                <Disclosure.Button as={Link} to={item.href} key={item.name} className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive(item.href) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}`}>
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {!user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex flex-col space-y-2 px-2">
                  <Link to="/login" className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Ingresar</Link>
                  <Link to="/register" className="px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">Registro</Link>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default ProfessionalNavbar;
