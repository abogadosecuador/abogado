import React from 'react'
import { Outlet } from 'react-router-dom'
import ProfessionalNavbar from '../components/Navigation/ProfessionalNavbar'
import Footer from '../components/Footer/Footer'

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <ProfessionalNavbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default PublicLayout
