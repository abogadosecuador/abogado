import { corsHeaders } from '../headers.js';

export class AdminHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, resource) {
    // 1. Authenticate and authorize admin
    const user = await this.authorizeAdmin(request);
    if (user instanceof Response) return user; // Return error response if auth fails

    // 2. Route to the correct resource handler
    switch (resource) {
      case 'users':
        if (method === 'GET') return this.getUsers();
        break;
      case 'products':
        return this.handleCrud(request, method, 'products');
      case 'blog':
        return this.handleCrud(request, method, 'blog_posts');
      case 'courses':
        return this.handleCrud(request, method, 'courses');
      case 'contact-submissions':
        if (method === 'GET') return this.getContactSubmissions();
        break;
      case 'newsletter-subscribers':
        if (method === 'GET') return this.getNewsletterSubscribers();
        break;
      default:
        return this.notFound();
    }
    return this.methodNotAllowed();
  }

  async authorizeAdmin(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return this.error('No authorization token provided', 401);
    }
    const token = authHeader.substring(7);
    const { data: { user }, error: userError } = await this.supabase.auth.getUser(token);

    if (userError || !user) {
      return this.error('Invalid token', 401);
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'admin') {
      return this.error('Access denied: Admins only', 403);
    }
    return user;
  }

  async handleCrud(request, method, tableName) {
    switch (method) {
      case 'GET':
        return this.getAll(tableName);
      case 'POST':
        return this.create(request, tableName);
      case 'PUT':
        return this.update(request, tableName);
      case 'DELETE':
        return this.delete(request, tableName);
      default:
        return this.methodNotAllowed();
    }
  }

  async getAll(tableName) {
    const { data, error } = await this.supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (error) return this.error(error.message);
    return this.success(data);
  }

  async create(request, tableName) {
    const props = await request.json();
    const { data, error } = await this.supabase.from(tableName).insert(props).select().single();
    if (error) return this.error(error.message);
    return this.success(data, 201);
  }

  async update(request, tableName) {
    const { id, ...props } = await request.json();
    if (!id) return this.error('ID is required for updates', 400);
    const { data, error } = await this.supabase.from(tableName).update(props).eq('id', id).select().single();
    if (error) return this.error(error.message);
    return this.success(data);
  }

  async delete(request, tableName) {
    const { id } = await request.json();
    if (!id) return this.error('ID is required for deletion', 400);
    const { error } = await this.supabase.from(tableName).delete().eq('id', id);
    if (error) return this.error(error.message);
    return this.success({ message: `${tableName} item deleted successfully` });
  }

  async getUsers() {
    const { data: { users }, error } = await this.supabase.auth.admin.listUsers();
    if (error) return this.error(error.message, 500);
    return this.success(users);
  }

  async getContactSubmissions() {
    return this.getAll('contact_submissions');
  }

  async getNewsletterSubscribers() {
    return this.getAll('newsletter_subscribers');
  }

  // Response helpers
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
  
  unauthorized() {
    return this.error('Unauthorized', 401);
  }

  notFound() {
    return this.error('Admin resource not found', 404);
  }

  methodNotAllowed() {
    return this.error('Method not allowed for this resource', 405);
  }
}
