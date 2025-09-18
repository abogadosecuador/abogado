import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';

const PayPalButton = ({ amount, metadata = {} }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [{ isPending }] = usePayPalScriptReducer();
  const paymentInfoRef = useRef({}); // Almacena IDs entre pasos

  const createOrder = async (data, actions) => {
    const promise = fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(amount),
        currency: 'USD',
        description: 'Servicios legales - Abg. Wilson Ipiales',
        metadata,
      }),
    })
    .then(res => res.json())
    .then(orderData => {
      if (!orderData?.data?.paypal_order_id) {
        throw new Error(orderData?.error || 'No se pudo crear la orden en el servidor.');
      }
      // Guardamos el ID de nuestro sistema para la captura
      paymentInfoRef.current.payment_id = orderData.data.payment_id;
      return orderData.data.paypal_order_id;
    });

    toast.promise(promise, {
      loading: 'Creando orden de pago...',
      success: 'Orden creada. Por favor, complete el pago en la ventana de PayPal.',
      error: (err) => `Error al crear la orden: ${err.message}`,
    });

    return promise;
  };

  const onApprove = async (data, actions) => {
    const promise = fetch('/api/payments/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: data.orderID,
        payment_id: paymentInfoRef.current.payment_id,
      }),
    })
    .then(res => res.json())
    .then(captureData => {
      if (captureData.error) {
        throw new Error(captureData.error);
      }
      clearCart();
      navigate('/gracias', {
        replace: true,
        state: {
          paymentId: captureData.data?.transaction_id || data.orderID,
          amount: captureData.data?.amount || amount,
          status: 'completed',
        },
      });
      return captureData;
    });

    toast.promise(promise, {
      loading: 'Procesando pago...',
      success: '¡Pago completado con éxito! Gracias por su compra.',
      error: (err) => `Error al procesar el pago: ${err.message}`,
    });

    return promise;
  };

  const onError = (err) => {
    console.error('Error de PayPal:', err);
    toast.error('Ocurrió un error con PayPal. Por favor, inténtelo de nuevo.');
  };

  const onCancel = (data) => {
    console.log('Pago cancelado:', data);
    toast.error('El pago ha sido cancelado.');
  };

  return (
    <div className="mt-4">
      {isPending ? (
        <div className="text-center p-4">Cargando botones de pago...</div>
      ) : (
        <PayPalButtons 
          style={{ layout: 'vertical' }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          disabled={!amount || amount <= 0}
        />
      )}
      <p className="text-xs text-gray-500 mt-4 text-center">
        Al completar el pago, usted acepta nuestros términos y condiciones.
      </p>
    </div>
  );
};

export default PayPalButton;

export default PayPalButton;
