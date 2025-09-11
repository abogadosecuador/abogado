/**
 * Forms Handler - Recepción y persistencia de formularios
 */

import { corsHeaders } from '../headers.js';

export class FormsHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, typeOrId, action) {
    try {
      switch (method) {
        case 'POST':
          // POST /api/forms/:type
          if (typeOrId && !action) {
            return this.createSubmission(request, typeOrId);
          }
          return this.methodNotAllowed();

        case 'GET':
          // GET /api/forms/:id (admin or owner)
          if (typeOrId && this.isUuid(typeOrId)) {
            return this.getSubmission(request, typeOrId);
          }
          return this.methodNotAllowed();

        default:
          return this.methodNotAllowed();
      }
    } catch (err) {
      console.error('Forms handler error:', err);
      return this.error('Internal server error', 500);
    }
  }

  isUuid(str) {
    return /^[0-9a-fA-F-]{36}$/.test(str);
  }

  async authenticate(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    return error ? null : user;
  }

  async createSubmission(request, formType) {
    const user = await this.authenticate(request);
    const body = await request.json().catch(() => ({}));

    const payload = {
      user_id: user?.id || null,
      form_type: formType,
      data: body?.data || body || {},
      status: 'pending',
      metadata: body?.metadata || {},
    };

    const { data, error } = await this.supabase
      .from('form_submissions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return this.error(error.message, 400);
    }

    // Disparar webhook opcional hacia n8n si está configurado
    try {
      if (this.env.N8N_WEBHOOK_URL) {
        await fetch(`${this.env.N8N_WEBHOOK_URL}/webhook/form-submission`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.id,
            form_type: data.form_type,
            data: data.data,
            user_id: data.user_id,
            created_at: data.created_at,
            metadata: data.metadata,
          })
        });
      }
    } catch (werr) {
      console.warn('n8n webhook error (forms):', werr);
    }

    return this.success({ id: data.id });
  }

  async getSubmission(request, id) {
    const user = await this.authenticate(request);

    let query = this.supabase
      .from('form_submissions')
      .select('*')
      .eq('id', id);

    // Si no es admin, limitar a su propio registro
    if (user) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!profile || profile.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }
    } else {
      // visitantes solo si no hay user_id (casos de público)
      query = query.is('user_id', null);
    }

    const { data, error } = await query.single();
    if (error) return this.error('No encontrado', 404);

    return this.success(data);
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
