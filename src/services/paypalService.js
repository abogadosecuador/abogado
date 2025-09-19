/**
 * PayPal Service - Integración completa con PayPal
 * Abogados Ecuador
 */

// PayPal Configuration - Solo Client ID público para frontend
const PAYPAL_CLIENT_ID = 'AWxKgr5n7ex5Lc3fDBOooaVHLgcAB-KCrYXgCmit9DpNXFIuBa6bUypYFjr-hAqARlILGxk_rRTsBZeS';
const PAYPAL_API_URL = 'https://api-m.paypal.com';

class PayPalService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get PayPal access token
   */
  async getAccessToken() {
    console.warn('[Deprecated] No use PayPal desde el frontend. Use /api/payments en el servidor.');
    throw new Error('Uso de PayPal desde el frontend está deshabilitado por seguridad.');
  }

  /**
   * Create PayPal order
   */
  async createOrder(orderData) {
    await this.getAccessToken();

    const order = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: orderData.currency || 'USD',
          value: orderData.amount.toString(),
          breakdown: {
            item_total: {
              currency_code: orderData.currency || 'USD',
              value: orderData.subtotal?.toString() || orderData.amount.toString()
            },
            tax_total: {
              currency_code: orderData.currency || 'USD',
              value: orderData.tax?.toString() || '0.00'
            },
            shipping: {
              currency_code: orderData.currency || 'USD',
              value: orderData.shipping?.toString() || '0.00'
            },
            discount: {
              currency_code: orderData.currency || 'USD',
              value: orderData.discount?.toString() || '0.00'
            }
          }
        },
        description: orderData.description || 'Servicios Legales - Abogados Ecuador',
        custom_id: orderData.customId,
        invoice_id: orderData.invoiceId,
        items: orderData.items?.map(item => ({
          name: item.name,
          description: item.description,
          unit_amount: {
            currency_code: orderData.currency || 'USD',
            value: item.price.toString()
          },
          quantity: item.quantity.toString(),
          category: item.digital ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS'
        })) || []
      }],
      application_context: {
        brand_name: 'Abogados Ecuador',
        landing_page: 'BILLING',
        shipping_preference: orderData.shipping ? 'SET_PROVIDED_ADDRESS' : 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`
      }
    };

    if (orderData.shippingAddress) {
      order.purchase_units[0].shipping = {
        name: {
          full_name: orderData.shippingAddress.fullName
        },
        address: {
          address_line_1: orderData.shippingAddress.line1,
          address_line_2: orderData.shippingAddress.line2,
          admin_area_2: orderData.shippingAddress.city,
          admin_area_1: orderData.shippingAddress.state,
          postal_code: orderData.shippingAddress.postalCode,
          country_code: orderData.shippingAddress.countryCode || 'EC'
        }
      };
    }

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return await response.json();
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  }

  /**
   * Capture PayPal order
   */
  async captureOrder(orderId) {
    await this.getAccessToken();

    try {
      const response = await fetch(`/api/payments/capture/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('PayPal capture error:', error);
      throw error;
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId) {
    await this.getAccessToken();

    try {
      throw new Error('Consulte detalles del pago desde el backend por seguridad.');
    } catch (error) {
      console.error('PayPal order details error:', error);
      throw error;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(captureId, amount = null, reason = 'Customer request') {
    await this.getAccessToken();

    const refundData = {
      note_to_payer: reason
    };

    if (amount) {
      refundData.amount = {
        value: amount.toString(),
        currency_code: 'USD'
      };
    }

    try {
      throw new Error('Los reembolsos deben procesarse desde el backend.');
    } catch (error) {
      console.error('PayPal refund error:', error);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(planId, subscriberData) {
    const accessToken = await this.getAccessToken();

    const subscription = {
      plan_id: planId,
      subscriber: {
        name: {
          given_name: subscriberData.firstName,
          surname: subscriberData.lastName
        },
        email_address: subscriberData.email,
        shipping_address: subscriberData.shippingAddress ? {
          name: {
            full_name: subscriberData.shippingAddress.fullName
          },
          address: {
            address_line_1: subscriberData.shippingAddress.line1,
            address_line_2: subscriberData.shippingAddress.line2,
            admin_area_2: subscriberData.shippingAddress.city,
            admin_area_1: subscriberData.shippingAddress.state,
            postal_code: subscriberData.shippingAddress.postalCode,
            country_code: subscriberData.shippingAddress.countryCode || 'EC'
          }
        } : undefined
      },
      application_context: {
        brand_name: 'Abogados Ecuador',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${window.location.origin}/subscription/success`,
        cancel_url: `${window.location.origin}/subscription/cancel`
      }
    };

    try {
      const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal subscription error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, reason = 'Customer request') {
    const accessToken = await this.getAccessToken();

    try {
      const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason
        })
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      console.error('PayPal cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(headers, body, webhookId) {
    await this.getAccessToken();

    const verificationData = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body
    };

    try {
      throw new Error('La verificación de webhooks se realiza en el backend.');
    } catch (error) {
      console.error('PayPal webhook verification error:', error);
      return false;
    }
  }

  /**
   * Initialize PayPal SDK
   */
  static loadPayPalScript() {
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        resolve(window.paypal);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&components=buttons,funding-eligibility`;
      script.async = true;
      
      script.onload = () => {
        if (window.paypal) {
          resolve(window.paypal);
        } else {
          reject(new Error('PayPal SDK failed to load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load PayPal SDK'));
      };

      document.body.appendChild(script);
    });
  }
}

// Export singleton instance
const paypalService = new PayPalService();
export default paypalService;

// Export class for testing
export { PayPalService };
