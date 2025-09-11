import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const PayPalButton = ({ amount, metadata = {} }) => {
  const paypalRef = useRef();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const paymentInfoRef = useRef({ payment_id: null });

  useEffect(() => {
    let script;
    let cancelled = false;

    async function loadAndRender() {
      try {
        // Obtener Client ID de configuración del backend
        const cfgRes = await fetch('/api/config');
        const cfgJson = await cfgRes.json();
        const clientId = cfgJson?.data?.paypal_client_id;
        if (!clientId) throw new Error('PayPal Client ID no configurado');

        // Cargar SDK de PayPal con el Client ID desde el backend
        script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&components=buttons`;
        script.async = true;
        script.onload = () => !cancelled && initButtons();
        script.onerror = () => console.error('No se pudo cargar el SDK de PayPal');
        document.body.appendChild(script);
      } catch (e) {
        console.error('Config/PayPal error:', e);
      }
    }

    function initButtons() {
      if (!window.paypal) return;

      window.paypal.Buttons({
        createOrder: async () => {
          // Crear orden segura en el backend y registrar el intento de pago (historial)
          const res = await fetch('/api/payments/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: Number(amount),
              currency: 'USD',
              description: 'Servicios legales - Abg. Wilson Ipiales',
              return_url: `${window.location.origin}/payment/success`,
              cancel_url: `${window.location.origin}/payment/cancel`,
              metadata,
            })
          });
          const data = await res.json();
          if (!res.ok || !data?.data?.paypal_order_id) {
            throw new Error(data?.error || 'No se pudo crear la orden de PayPal');
          }
          // Guardamos el payment_id para la captura posterior
          paymentInfoRef.current.payment_id = data.data.payment_id;
          return data.data.paypal_order_id; // El SDK espera devolver el order id
        },
        onApprove: async (data, actions) => {
          try {
            // Capturar el pago en el backend (fuente de verdad)
            const captureRes = await fetch('/api/payments/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: data.orderID,
                payment_id: paymentInfoRef.current.payment_id,
              })
            });
            const captureJson = await captureRes.json();
            if (!captureRes.ok) {
              throw new Error(captureJson?.error || 'Error capturando el pago');
            }

            // Limpiar carrito sólo tras captura exitosa
            clearCart();

            // Redirigir a página de éxito existente en rutas
            navigate('/payment/success', {
              state: {
                paymentId: captureJson?.data?.transaction_id || data.orderID,
                amount: captureJson?.data?.amount || amount,
                status: captureJson?.data?.status || 'completed'
              }
            });
          } catch (err) {
            console.error('Error al procesar la captura:', err);
            alert('Hubo un problema al confirmar el pago. No se ha cobrado. Intente nuevamente.');
          }
        },
        onError: (err) => {
          console.error('Error PayPal:', err);
          alert('Ocurrió un error con PayPal. Por favor, inténtelo más tarde.');
        }
      }).render(paypalRef.current);
    }

    loadAndRender();

    return () => {
      cancelled = true;
      if (script) document.body.removeChild(script);
    };
  }, [amount, navigate, clearCart]);

  

  return (
    <div className="mt-4">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-700 mb-2">Detalles del pago:</p>
        <p className="text-lg font-semibold">${amount} USD</p>
        <p className="text-xs text-gray-500 mt-1">Pagos seguros procesados por PayPal</p>
      </div>
      
      <div ref={paypalRef} className="mt-4"></div>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Al completar el pago, usted acepta nuestros términos y condiciones.
      </p>
    </div>
  );
};

export default PayPalButton;
