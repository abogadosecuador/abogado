/**
 * Forms Handler - Recepción y persistencia de formularios
 */

import { corsHeaders } from '../headers.js';

export class FormsHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, formType) {
    if (method !== 'POST') {
      return this.methodNotAllowed();
    }

    try {
      const body = await request.json();
      switch (formType) {
        case 'contact':
          return this.handleContactForm(body);
        case 'newsletter':
          return this.handleNewsletterForm(body);
        default:
          return this.error('Tipo de formulario no válido', 404);
      }
    } catch (err) {
      return this.error('Error en la solicitud', 400);
    }
  }

  async handleContactForm(body) {
    const { name, email, subject, message } = body;
    if (!name || !email || !message) {
      return this.error('Nombre, email y mensaje son requeridos.', 400);
    }

    const { data, error } = await this.supabase
      .from('contact_submissions')
      .insert({ name, email, subject, message })
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    this.triggerWebhook('contact-form-submission', data);
    return this.success({ id: data.id });
  }

  async handleNewsletterForm(body) {
    const { email } = body;
    if (!email) {
      return this.error('Email es requerido.', 400);
    }

    const { data, error } = await this.supabase
      .from('newsletter_subscribers')
      .insert({ email })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation gracefully
      if (error.code === '23505') {
        return this.error('Este email ya está suscrito.', 409);
      }
      return this.error(error.message);
    }

    this.triggerWebhook('newsletter-subscription', data);
    return this.success({ id: data.id });
  }

  async triggerWebhook(event, data) {
    if (!this.env.N8N_WEBHOOK_URL) return;
    try {
      await fetch(`${this.env.N8N_WEBHOOK_URL}/webhook/${event}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn(`n8n webhook error (${event}):`, err);
    }
  }

  // Helpers
  success(data, status = 200) {
    return new Response(JSON.stringify({ success: true, data }), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  error(message, status = 500) {
    return new Response(JSON.stringify({ success: false, error: message }), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  methodNotAllowed() {
    return this.error('Método no permitido', 405);
  }
}
