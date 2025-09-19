import { supabase } from '../config/supabase';

export const paypalService = {
  // Crear orden de PayPal
  createOrder: async (orderData) => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  },

  // Capturar pago de PayPal
  capturePayment: async (orderID) => {
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderID })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw error;
    }
  },

  // Guardar orden en base de datos
  saveOrder: async (orderData) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          order_number: orderData.order_number,
          total_amount: orderData.total_amount,
          status: orderData.status || 'pending',
          payment_method: 'paypal',
          payment_id: orderData.payment_id,
          billing_info: orderData.billing_info,
          items: orderData.items,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving order:', error);
      return { success: false, error: error.message };
    }
  },

  // Generar número de orden único
  generateOrderNumber: () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `AE-${timestamp}-${random}`;
  },

  // Validar datos de orden
  validateOrderData: (orderData) => {
    const required = ['items', 'total_amount'];
    const missing = required.filter(field => !orderData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    }

    if (orderData.total_amount <= 0) {
      throw new Error('El monto total debe ser mayor a 0');
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('La orden debe contener al menos un item');
    }

    return true;
  }
};
