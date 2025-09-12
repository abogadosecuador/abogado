import React from 'react'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import ProfessionalNavbar from '../components/Navigation/ProfessionalNavbar'

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <ProfessionalNavbar />

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
