import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navigation/Navbar';
import Footer from './components/Footer/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';

const HomePage = lazy(() => import('./components/Home/HomePage'));
const AboutPage = lazy(() => import('./components/About/AboutPage'));
const ConsultasPage = lazy(() => import('./components/Consultation/ConsultasPage'));
const UnifiedStore = lazy(() => import('./components/Store/UnifiedStore'));
const CheckoutSystem = lazy(() => import('./components/Checkout/CheckoutSystem'));
const AppointmentScheduler = lazy(() => import('./components/Appointment/AppointmentScheduler'));
const ThankYouPage = lazy(() => import('./components/Payment/ThankYouPage'));
const NotFoundPage = lazy(() => import('./components/Common/NotFoundPage'));
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));

const App = () => (
  <div className="App min-h-screen bg-white text-gray-900 w-full overflow-x-hidden">
    <Navbar />
    <main className="flex-1 w-full">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre-nosotros" element={<AboutPage />} />
          <Route path="/consultas" element={<ConsultasPage />} />
          <Route path="/tienda" element={<UnifiedStore />} />
          <Route path="/checkout" element={<CheckoutSystem />} />
          <Route path="/calendario" element={<AppointmentScheduler />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gracias" element={<ThankYouPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </main>
    <Footer />
  </div>
);

export default App;
