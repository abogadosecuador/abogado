/**
 * Payments Handler - PayPal Integration
 */

import { corsHeaders } from '../headers.js';

export class PaymentHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
    // Determine PayPal API base URL based on mode
    const mode = (env.PAYPAL_MODE || 'live').toLowerCase();
    this.paypalApiUrl = env.PAYPAL_API_BASE || (mode === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com');
  }

  async handle(request, method, id, action) {
    const authHeader = request.headers.get('Authorization');
    const user = authHeader ? await this.authenticate(authHeader) : null;

    switch (method) {
      case 'GET':
        if (id) {
          return this.getPayment(id, user);
        }
        return this.listPayments(request, user);
      
      case 'POST':
        if (action === 'create-order') {
          return this.createPayPalOrder(request, user);
        }
        if (action === 'capture') {
          return this.capturePayPalPayment(request, user);
        }
        if (action === 'refund') {
          return this.refundPayment(id, request, user);
        }
        if (action === 'webhook') {
          return this.handlePayPalWebhook(request);
        }
        return this.notFound();
      
      default:
        return this.methodNotAllowed();
    }
  }

  async authenticate(authHeader) {
    if (!authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    return error ? null : user;
  }

  async getPayPalAuth() {
    const auth = btoa(`${this.env.PAYPAL_CLIENT_ID}:${this.env.PAYPAL_CLIENT_SECRET}`);
    
    const response = await fetch(`${this.paypalApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
  }

  async listPayments(request, user) {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const from_date = url.searchParams.get('from');
    const to_date = url.searchParams.get('to');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = this.supabase
      .from('payments')
      .select(`
        *,
        appointment:appointments(
          *,
          service:services(*)
        )
      `);

    if (user) {
      query = query.eq('user_id', user.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (from_date) {
      query = query.gte('created_at', from_date);
    }

    if (to_date) {
      query = query.lte('created_at', to_date);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async getPayment(id, user) {
    let query = this.supabase
      .from('payments')
      .select(`
        *,
        appointment:appointments(
          *,
          service:services(*),
          provider:providers(*)
        )
      `)
      .eq('id', id);

    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.single();

    if (error) {
      return this.error(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return this.success(data);
  }

  async createPayPalOrder(request, user) {
    const { 
      amount, 
      currency = 'USD',
      description, 
      appointment_id, 
      cart_id,
      return_url,
      cancel_url,
      metadata = {},
    } = await request.json();

    if (!amount || amount <= 0) {
      return this.error('Monto inválido', 400);
    }

    // Create payment record
    const { data: payment, error: paymentError } = await this.supabase
      .from('payments')
      .insert({
        user_id: user?.id,
        appointment_id,
        cart_id,
        amount,
        currency,
        status: 'pending',
        payment_method: 'paypal',
        metadata: { description, ...metadata }
      })
      .select()
      .single();

    if (paymentError) {
      return this.error(paymentError.message);
    }

    // Create PayPal order
    const accessToken = await this.getPayPalAuth();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: payment.id,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: description || 'Servicio Legal - Abogados Ecuador'
      }],
      application_context: {
        return_url: return_url || `${this.env.APP_URL || 'https://abogadosecuador.workers.dev'}/payment/success`,
        cancel_url: cancel_url || `${this.env.APP_URL || 'https://abogadosecuador.workers.dev'}/payment/cancel`,
        brand_name: 'Abogados Ecuador',
        locale: 'es-EC',
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      }
    };

    const response = await fetch(`${this.paypalApiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': payment.id
      },
      body: JSON.stringify(orderData)
    });

    const paypalOrder = await response.json();

    if (!response.ok) {
      await this.supabase
        .from('payments')
        .update({ 
          status: 'failed',
          gateway_response: paypalOrder 
        })
        .eq('id', payment.id);

      return this.error('Error creando orden de pago', 500);
    }

    // Update payment with PayPal order ID
    await this.supabase
      .from('payments')
      .update({ 
        transaction_id: paypalOrder.id,
        gateway_response: paypalOrder 
      })
      .eq('id', payment.id);

    // Get approval URL
    const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

    // Log payment creation
    await this.logActivity('payment', 'order_created', {
      payment_id: payment.id,
      paypal_order_id: paypalOrder.id,
      amount,
      user_id: user?.id
    });

    return this.success({
      payment_id: payment.id,
      paypal_order_id: paypalOrder.id,
      approval_url: approvalUrl,
      status: paypalOrder.status
    }, 201);
  }

  async capturePayPalPayment(request, user) {
    const { order_id, payment_id } = await request.json();

    if (!order_id || !payment_id) {
      return this.error('Order ID y Payment ID son requeridos', 400);
    }

    // Verify payment ownership
    const { data: payment } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (!payment) {
      return this.error('Pago no encontrado', 404);
    }

    if (user && payment.user_id !== user.id) {
      return this.error('No autorizado', 403);
    }

    // Capture PayPal payment
    const accessToken = await this.getPayPalAuth();
    
    const response = await fetch(`${this.paypalApiUrl}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${payment_id}-capture`
      }
    });

    const captureData = await response.json();

    if (!response.ok) {
      await this.supabase
        .from('payments')
        .update({
          status: 'failed',
          gateway_response: captureData
        })
        .eq('id', payment_id);

      return this.error('Error capturando el pago', 500);
    }

    // Update payment status
    const captureDetails = captureData.purchase_units[0].payments.captures[0];
    
    await this.supabase
      .from('payments')
      .update({
        status: 'completed',
        paid_at: new Date().toISOString(),
        transaction_id: captureDetails.id,
        gateway_response: captureData,
        invoice_number: captureDetails.invoice_id || `INV-${payment_id.slice(0, 8).toUpperCase()}`
      })
      .eq('id', payment_id);

    // Update related appointment status
    if (payment.appointment_id) {
      await this.supabase
        .from('appointments')
        .update({ 
          status: 'confirmed',
          payment_id: payment_id 
        })
        .eq('id', payment.appointment_id);
    }

    // Clear cart if payment was for cart
    if (payment.cart_id) {
      await this.supabase
        .from('carts')
        .update({ 
          items: [],
          total: 0,
          subtotal: 0
        })
        .eq('id', payment.cart_id);
    }

    // Send payment confirmation
    await this.sendPaymentConfirmation(payment, captureData);

    // Trigger webhook
    await this.triggerWebhook('payment-completed', {
      payment_id,
      order_id,
      amount: captureDetails.amount.value,
      currency: captureDetails.amount.currency_code,
      user_id: payment.user_id
    });

    // Log successful payment
    await this.logActivity('payment', 'capture_completed', {
      payment_id,
      paypal_capture_id: captureDetails.id,
      amount: captureDetails.amount.value
    });

    return this.success({
      payment_id,
      status: 'completed',
      transaction_id: captureDetails.id,
      amount: captureDetails.amount.value,
      currency: captureDetails.amount.currency_code,
      invoice_number: payment.invoice_number
    });
  }

  async refundPayment(id, request, user) {
    const { reason, amount } = await request.json();

    // Get payment details
    const { data: payment } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (!payment) {
      return this.error('Pago no encontrado', 404);
    }

    // Check admin permissions
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return this.error('No autorizado para procesar reembolsos', 403);
    }

    if (payment.status !== 'completed') {
      return this.error('Solo se pueden reembolsar pagos completados', 400);
    }

    // Process PayPal refund
    const accessToken = await this.getPayPalAuth();
    const refundAmount = amount || payment.amount;

    const response = await fetch(`${this.paypalApiUrl}/v2/payments/captures/${payment.transaction_id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        amount: {
          value: refundAmount.toFixed(2),
          currency_code: payment.currency
        },
        note_to_payer: reason || 'Reembolso procesado'
      })
    });

    const refundData = await response.json();

    if (!response.ok) {
      return this.error('Error procesando reembolso', 500);
    }

    // Update payment record
    await this.supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refundAmount,
        refund_reason: reason,
        gateway_response: {
          ...payment.gateway_response,
          refund: refundData
        }
      })
      .eq('id', id);

    // Update appointment if applicable
    if (payment.appointment_id) {
      await this.supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', payment.appointment_id);
    }

    // Send refund notification
    await this.triggerWebhook('payment-refunded', {
      payment_id: id,
      refund_id: refundData.id,
      amount: refundAmount,
      reason
    });

    return this.success({
      payment_id: id,
      refund_id: refundData.id,
      amount: refundAmount,
      status: 'refunded'
    });
  }

  async handlePayPalWebhook(request) {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers);

    // Verify webhook signature
    const verified = await this.verifyPayPalWebhook(headers, body);
    if (!verified) {
      return this.error('Invalid webhook signature', 401);
    }

    const event = JSON.parse(body);

    // Process webhook event
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await this.processPaymentCompleted(event);
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        await this.processPaymentRefunded(event);
        break;
      
      case 'CHECKOUT.ORDER.APPROVED':
        await this.processOrderApproved(event);
        break;
      
      default:
        console.log('Unhandled PayPal event:', event.event_type);
    }

    return this.success({ received: true });
  }

  async verifyPayPalWebhook(headers, body) {
    try {
      const accessToken = await this.getPayPalAuth();
      const verificationPayload = {
        auth_algo: headers['paypal-auth-algo'] || headers['PayPal-Auth-Algo'],
        cert_url: headers['paypal-cert-url'] || headers['PayPal-Cert-Url'],
        transmission_id: headers['paypal-transmission-id'] || headers['PayPal-Transmission-Id'],
        transmission_sig: headers['paypal-transmission-sig'] || headers['PayPal-Transmission-Sig'],
        transmission_time: headers['paypal-transmission-time'] || headers['PayPal-Transmission-Time'],
        webhook_id: this.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body)
      };

      const resp = await fetch(`${this.paypalApiUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationPayload)
      });

      if (!resp.ok) return false;
      const result = await resp.json();
      return result.verification_status === 'SUCCESS';
    } catch (e) {
      console.error('Webhook verify error:', e);
      return false;
    }
  }

  async processPaymentCompleted(event) {
    const captureId = event.resource.id;
    const orderId = event.resource.supplementary_data?.related_ids?.order_id;

    // Find payment by transaction ID
    const { data: payment } = await this.supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', orderId)
      .single();

    if (payment && payment.status !== 'completed') {
      await this.supabase
        .from('payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
          gateway_response: event.resource
        })
        .eq('id', payment.id);
    }
  }

  async processPaymentRefunded(event) {
    const captureId = event.resource.id;
    
    const { data: payment } = await this.supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', captureId)
      .single();

    if (payment) {
      await this.supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_amount: event.resource.amount.value
        })
        .eq('id', payment.id);
    }
  }

  async processOrderApproved(event) {
    // Log order approval
    console.log('PayPal order approved:', event.resource.id);
  }

  async sendPaymentConfirmation(payment, captureData) {
    if (!payment.user_id) return;

    const { data: user } = await this.supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', payment.user_id)
      .single();

    if (user) {
      await this.supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          type: 'email',
          title: 'Pago Confirmado',
          message: `Su pago de $${payment.amount} ha sido procesado exitosamente.`,
          data: {
            payment_id: payment.id,
            transaction_id: payment.transaction_id,
            invoice_number: payment.invoice_number
          }
        });
    }
  }

  async triggerWebhook(event, data) {
    try {
      await fetch(`${this.env.N8N_WEBHOOK_URL}/webhook/${event}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }

  async logActivity(category, action, data) {
    await this.supabase.from('logs_app').insert({
      level: 'info',
      category,
      message: action,
      metadata: data
    });
  }

  // Response helpers
  success(data, status = 200) {
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  error(message, status = 500) {
    return new Response(JSON.stringify({
      success: false,
      error: message
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  notFound() {
    return this.error('Endpoint no encontrado', 404);
  }

  methodNotAllowed() {
    return this.error('Método no permitido', 405);
  }
}
