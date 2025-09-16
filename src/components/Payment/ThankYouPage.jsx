import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const ThankYouPage = () => {
  const location = useLocation();
  const payment = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">¡Gracias por tu compra!</h1>
          <p className="text-gray-600">Tu pago se ha procesado correctamente. Te hemos enviado un correo con los detalles.</p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Resumen del pago</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><span className="font-medium">ID de Transacción:</span> {payment.paymentId || 'N/D'}</li>
              <li><span className="font-medium">Estado:</span> {payment.status || 'completed'}</li>
              <li><span className="font-medium">Monto:</span> ${Number(payment.amount || 0).toFixed(2)} USD</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Siguientes pasos</h2>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-2">
              <li>Revisa tu correo con el comprobante y detalles del pedido.</li>
              <li>Si adquiriste servicios, nos pondremos en contacto para agendar.</li>
              <li>Para soporte, escribe a <a href="mailto:Wifirmalegal@gmail.com" className="text-blue-600">Wifirmalegal@gmail.com</a>.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Ir a mi cuenta</Link>
          <Link to="/tienda" className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">Seguir comprando</Link>
          <Link to="/consultas" className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">Solicitar consulta</Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
