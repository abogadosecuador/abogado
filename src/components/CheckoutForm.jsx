import React, { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { paypalService } from '../services/paypalService';
import toast from 'react-hot-toast';

const PAYPAL_CLIENT_ID = "AWxKgr5n7ex5Lc3fDBOooaVHLgcAB-KCrYXgCmit9DpNXFIuBa6bUypYFjr-hAqARlILGxk_rRTsBZeS";

export default function CheckoutForm() {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    country: 'Ecuador'
  });

  const handleInputChange = (e) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone'];
    const missing = required.filter(field => !billingInfo[field]);
    
    if (missing.length > 0) {
      toast.error(`Campos requeridos: ${missing.join(', ')}`);
      return false;
    }

    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return false;
    }

    return true;
  };

  const createOrder = (data, actions) => {
    if (!validateForm()) return;

    return actions.order.create({
      purchase_units: [{
        amount: {
          value: total.toFixed(2),
          currency_code: 'USD'
        },
        description: `Compra en AbogadosEcuador - ${items.length} items`
      }]
    });
  };

  const onApprove = async (data, actions) => {
    setIsProcessing(true);
    
    try {
      const details = await actions.order.capture();
      
      // Guardar orden en base de datos
      const orderData = {
        user_id: user?.id,
        order_number: paypalService.generateOrderNumber(),
        total_amount: total,
        status: 'paid',
        payment_id: details.id,
        billing_info: billingInfo,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type
        }))
      };

      const result = await paypalService.saveOrder(orderData);
      
      if (result.success) {
        toast.success('¡Pago procesado exitosamente!');
        clearCart();
        // Redirigir a página de éxito
        window.location.href = '/thank-you';
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err) => {
    console.error('PayPal error:', err);
    toast.error('Error en el procesamiento del pago');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Carrito Vacío</h2>
        <p className="text-gray-600">Añade productos para continuar con la compra</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información de facturación */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información de Facturación</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="name"
                value={billingInfo.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={billingInfo.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="phone"
                value={billingInfo.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={billingInfo.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                name="city"
                value={billingInfo.city}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Resumen de orden */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Resumen de Orden</h2>
          
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={`${item.id}-${item.type}`} className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Cantidad: {item.quantity} × ${item.price}
                  </p>
                </div>
                <span className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)} USD</span>
            </div>
          </div>

          {/* PayPal Buttons */}
          <PayPalScriptProvider options={{ 
            "client-id": PAYPAL_CLIENT_ID,
            currency: "USD"
          }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              disabled={isProcessing}
            />
          </PayPalScriptProvider>

          {isProcessing && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Procesando pago...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
