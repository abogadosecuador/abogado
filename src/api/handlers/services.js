/**
 * Services and Products Handler
 */

import { corsHeaders } from '../headers.js';

export class ServiceHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, id) {
    switch (method) {
      case 'GET':
        if (id) {
          return this.getService(id);
        }
        return this.listServices(request);
      
      case 'POST':
        return this.createService(request);
      
      case 'PATCH':
        return this.updateService(id, request);
      
      case 'DELETE':
        return this.deleteService(id, request);
      
      default:
        return this.methodNotAllowed();
    }
  }

  async handleProducts(request, method, id) {
    switch (method) {
      case 'GET':
        if (id) {
          return this.getProduct(id);
        }
        return this.listProducts(request);
      
      case 'POST':
        return this.createProduct(request);
      
      case 'PATCH':
        return this.updateProduct(id, request);
      
      case 'DELETE':
        return this.deleteProduct(id, request);
      
      default:
        return this.methodNotAllowed();
    }
  }

  // Services methods
  async listServices(request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const active = url.searchParams.get('active') !== 'false';
    const search = url.searchParams.get('search');

    let query = this.supabase
      .from('services')
      .select(`
        *,
        providers:provider_services(
          provider:providers(*)
        )
      `);

    if (active !== undefined) {
      query = query.eq('active', active);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async getService(id) {
    const { data, error } = await this.supabase
      .from('services')
      .select(`
        *,
        providers:provider_services(
          provider:providers(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return this.error(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return this.success(data);
  }

  async createService(request) {
    const authHeader = request.headers.get('Authorization');
    const user = await this.authenticate(authHeader);
    
    if (!user || !(await this.isAdmin(user.id))) {
      return this.unauthorized();
    }

    const serviceData = await request.json();

    const { data, error } = await this.supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data, 201);
  }

  async updateService(id, request) {
    const authHeader = request.headers.get('Authorization');
    const user = await this.authenticate(authHeader);
    
    if (!user || !(await this.isAdmin(user.id))) {
      return this.unauthorized();
    }

    const updates = await request.json();
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await this.supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async deleteService(id, request) {
    const authHeader = request.headers.get('Authorization');
    const user = await this.authenticate(authHeader);
    
    if (!user || !(await this.isAdmin(user.id))) {
      return this.unauthorized();
    }

    const { error } = await this.supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      return this.error(error.message);
    }

    return this.success({ message: 'Servicio eliminado' });
  }

  // Products methods
  async listProducts(request) {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const active = url.searchParams.get('active') !== 'false';
    const search = url.searchParams.get('search');
    const in_stock = url.searchParams.get('in_stock');

    let query = this.supabase
      .from('products')
      .select('*');

    if (active !== undefined) {
      query = query.eq('active', active);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (in_stock === 'true') {
      query = query.gt('stock', 0);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async getProduct(id) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return this.error(error.message, error.code === 'PGRST116' ? 404 : 500);
    }

    return this.success(data);
  }

  async createProduct(request) {
    const authHeader = request.headers.get('Authorization');
    const user = await this.authenticate(authHeader);
    
    if (!user || !(await this.isAdmin(user.id))) {
      return this.unauthorized();
    }

    const productData = await request.json();

    const { data, error } = await this.supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data, 201);
  }

  async updateProduct(id, request) {
    const authHeader = request.headers.get('Authorization');
    const user = await this.authenticate(authHeader);
    
    if (!user || !(await this.isAdmin(user.id))) {
      return this.unauthorized();
    }

    const updates = await request.json();
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async deleteProduct(id, request) {
    const authHeader = request.headers.get('Authorization');
    const user = await this.authenticate(authHeader);
    
    if (!user || !(await this.isAdmin(user.id))) {
      return this.unauthorized();
    }

    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return this.error(error.message);
    }

    return this.success({ message: 'Producto eliminado' });
  }

  // Helper methods
  async authenticate(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    return error ? null : user;
  }

  async isAdmin(userId) {
    const { data } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    return data?.role === 'admin';
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
