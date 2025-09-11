import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X } from 'lucide-react'

const PublicLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Abg. Wilson Ipiales
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Inicio
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Servicios
              </Link>
              <Link to="/courses" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Cursos
              </Link>
              <Link to="/catalog" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Productos
              </Link>
              <Link to="/blog" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Blog
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition font-medium">
                Contacto
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-blue-600 transition font-medium"
                  >
                    Iniciar sesión
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition font-medium px-2 py-1"
                >
                  Inicio
                </Link>
                <Link 
                  to="/services" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition font-medium px-2 py-1"
                >
                  Servicios
                </Link>
                <Link 
                  to="/courses" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition font-medium px-2 py-1"
                >
                  Cursos
                </Link>
                <Link 
                  to="/catalog" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition font-medium px-2 py-1"
                >
                  Productos
                </Link>
                <Link 
                  to="/blog" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition font-medium px-2 py-1"
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition font-medium px-2 py-1"
                >
                  Contacto
                </Link>
                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-700 hover:text-blue-600 transition font-medium px-2 py-1"
                    >
                      Iniciar sesión
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium text-center"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Abg. Wilson Ipiales</h3>
              <p className="text-gray-400">Servicios legales profesionales con experiencia y dedicación.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/services" className="hover:text-white transition">Servicios</Link></li>
                <li><Link to="/courses" className="hover:text-white transition">Cursos</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contacto</h4>
              <p className="text-gray-400">WhatsApp: +59398835269</p>
              <p className="text-gray-400">Email: Wifirmalegal@gmail.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Abogado Wilson Ipiales. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
