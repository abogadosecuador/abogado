/**
 * Appointments Handler
 */

import { corsHeaders } from '../headers.js';

export class AppointmentHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, id, action) {
    const authHeader = request.headers.get('Authorization');
    const user = authHeader ? await this.authenticate(authHeader) : null;
    
    if (!user && method !== 'GET') {
      return this.unauthorized();
    }

    switch (method) {
      case 'GET':
        if (id) {
          return this.getAppointment(id, user);
        }
        return this.listAppointments(request, user);
      
      case 'POST':
        return this.createAppointment(request, user);
      
      case 'PATCH':
        if (action === 'cancel') {
          return this.cancelAppointment(id, request, user);
        }
        if (action === 'reschedule') {
          return this.rescheduleAppointment(id, request, user);
        }
        if (action === 'confirm') {
          return this.confirmAppointment(id, user);
        }
        return this.updateAppointment(id, request, user);
      
      case 'DELETE':
        return this.deleteAppointment(id, user);
      
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

  async listAppointments(request, user) {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const provider_id = url.searchParams.get('provider_id');
    const from_date = url.searchParams.get('from');
    const to_date = url.searchParams.get('to');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = this.supabase
      .from('appointments')
      .select(`
        *,
        service:services(*),
        provider:providers(*),
        payment:payments(*)
      `);

    if (user) {
      query = query.eq('user_id', user.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (provider_id) {
      query = query.eq('provider_id', provider_id);
    }

    if (from_date) {
      query = query.gte('start_at', from_date);
    }

    if (to_date) {
      query = query.lte('start_at', to_date);
    }

    query = query
      .order('start_at', { ascending: true })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async getAppointment(id, user) {
    let query = this.supabase
      .from('appointments')
      .select(`
        *,
        service:services(*),
        provider:providers(*),
        payment:payments(*)
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

  async createAppointment(request, user) {
    const data = await request.json();
    
    // Validate required fields
    if (!data.service_id || !data.provider_id || !data.start_at) {
      return this.error('Servicio, proveedor y fecha son requeridos', 400);
    }

    // Calculate end time based on service duration
    const { data: service } = await this.supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', data.service_id)
      .single();

    if (!service) {
      return this.error('Servicio no encontrado', 404);
    }

    const startDate = new Date(data.start_at);
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000);

    // Check availability
    const available = await this.checkProviderAvailability(
      data.provider_id,
      startDate.toISOString(),
      endDate.toISOString()
    );

    if (!available) {
      return this.error('El horario seleccionado no está disponible', 409);
    }

    // Create appointment
    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        service_id: data.service_id,
        provider_id: data.provider_id,
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
        notes: data.notes,
        metadata: data.metadata || {}
      })
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    // Send confirmation notification
    await this.sendNotification(user.id, {
      type: 'email',
      title: 'Cita Agendada',
      message: `Su cita ha sido agendada para ${startDate.toLocaleString('es-EC')}`,
      data: { appointment_id: appointment.id }
    });

    // Trigger n8n webhook
    await this.triggerWebhook('appointment-created', {
      appointment_id: appointment.id,
      user_email: user.email,
      start_at: startDate.toISOString()
    });

    return this.success(appointment, 201);
  }

  async updateAppointment(id, request, user) {
    const updates = await request.json();
    
    // Check ownership
    const { data: existing } = await this.supabase
      .from('appointments')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return this.error('Cita no encontrada', 404);
    }

    if (existing.status !== 'pending') {
      return this.error('Solo se pueden modificar citas pendientes', 400);
    }

    const { data, error } = await this.supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async cancelAppointment(id, request, user) {
    const { reason } = await request.json();

    const { data, error } = await this.supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    // Send cancellation notification
    await this.sendNotification(user.id, {
      type: 'email',
      title: 'Cita Cancelada',
      message: 'Su cita ha sido cancelada exitosamente',
      data: { appointment_id: id }
    });

    // Trigger webhook
    await this.triggerWebhook('appointment-cancelled', {
      appointment_id: id,
      user_id: user.id,
      reason
    });

    return this.success(data);
  }

  async rescheduleAppointment(id, request, user) {
    const { new_start_at } = await request.json();

    if (!new_start_at) {
      return this.error('Nueva fecha es requerida', 400);
    }

    // Get appointment details
    const { data: appointment } = await this.supabase
      .from('appointments')
      .select('*, service:services(duration_minutes)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!appointment) {
      return this.error('Cita no encontrada', 404);
    }

    // Calculate new end time
    const newStartDate = new Date(new_start_at);
    const newEndDate = new Date(newStartDate.getTime() + appointment.service.duration_minutes * 60000);

    // Check availability
    const available = await this.checkProviderAvailability(
      appointment.provider_id,
      newStartDate.toISOString(),
      newEndDate.toISOString()
    );

    if (!available) {
      return this.error('El nuevo horario no está disponible', 409);
    }

    // Update appointment
    const { data, error } = await this.supabase
      .from('appointments')
      .update({
        start_at: newStartDate.toISOString(),
        end_at: newEndDate.toISOString(),
        metadata: {
          ...appointment.metadata,
          rescheduled_at: new Date().toISOString(),
          previous_start: appointment.start_at
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    // Send notification
    await this.sendNotification(user.id, {
      type: 'email',
      title: 'Cita Reprogramada',
      message: `Su cita ha sido reprogramada para ${newStartDate.toLocaleString('es-EC')}`,
      data: { appointment_id: id }
    });

    return this.success(data);
  }

  async confirmAppointment(id, user) {
    // Admin only - confirm appointment
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return this.error('No autorizado', 403);
    }

    const { data, error } = await this.supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async deleteAppointment(id, user) {
    // Admin only
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return this.error('No autorizado', 403);
    }

    const { error } = await this.supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      return this.error(error.message);
    }

    return this.success({ message: 'Cita eliminada' });
  }

  async checkAvailability(request) {
    const url = new URL(request.url);
    const provider_id = url.searchParams.get('provider_id');
    const service_id = url.searchParams.get('service_id');
    const date = url.searchParams.get('date');

    if (!provider_id || !date) {
      return this.error('Proveedor y fecha son requeridos', 400);
    }

    // Get provider schedule
    const { data: provider } = await this.supabase
      .from('providers')
      .select('availability, holidays')
      .eq('id', provider_id)
      .single();

    if (!provider) {
      return this.error('Proveedor no encontrado', 404);
    }

    // Get service duration
    let duration = 60; // default
    if (service_id) {
      const { data: service } = await this.supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', service_id)
        .single();
      
      if (service) {
        duration = service.duration_minutes;
      }
    }

    // Get existing appointments
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('start_at, end_at')
      .eq('provider_id', provider_id)
      .in('status', ['confirmed', 'pending'])
      .gte('start_at', startOfDay.toISOString())
      .lte('end_at', endOfDay.toISOString());

    // Calculate available slots
    const slots = this.calculateAvailableSlots(
      provider.availability,
      appointments || [],
      date,
      duration
    );

    return this.success({ 
      date, 
      provider_id, 
      service_id,
      duration,
      slots 
    });
  }

  calculateAvailableSlots(availability, appointments, date, duration) {
    const dayOfWeek = new Date(date).getDay();
    const daySchedule = availability?.[dayOfWeek];
    
    if (!daySchedule?.enabled) {
      return [];
    }

    const slots = [];
    const slotDuration = 30; // 30-minute slots
    
    // Parse schedule times
    const [startHour, startMin] = (daySchedule.start || '09:00').split(':').map(Number);
    const [endHour, endMin] = (daySchedule.end || '18:00').split(':').map(Number);
    
    const start = new Date(date);
    start.setHours(startHour, startMin, 0, 0);
    
    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);
    
    const current = new Date(start);
    
    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      
      if (slotEnd <= end) {
        // Check if slot conflicts with existing appointments
        const hasConflict = appointments.some(apt => {
          const aptStart = new Date(apt.start_at);
          const aptEnd = new Date(apt.end_at);
          return (current < aptEnd && slotEnd > aptStart);
        });
        
        if (!hasConflict) {
          slots.push({
            start: current.toISOString(),
            end: slotEnd.toISOString(),
            available: true
          });
        }
      }
      
      current.setMinutes(current.getMinutes() + slotDuration);
    }
    
    return slots;
  }

  async checkProviderAvailability(provider_id, start_at, end_at) {
    const { data } = await this.supabase
      .rpc('check_appointment_availability', {
        p_provider_id: provider_id,
        p_start_at: start_at,
        p_end_at: end_at
      });

    return data;
  }

  async sendNotification(user_id, notification) {
    await this.supabase
      .from('notifications')
      .insert({
        user_id,
        ...notification
      });
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

  unauthorized() {
    return this.error('No autorizado', 401);
  }

  methodNotAllowed() {
    return this.error('Método no permitido', 405);
  }
}
