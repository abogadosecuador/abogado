import { corsHeaders } from '../headers.js';

export class AdminHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, resource) {
    // 1. Authenticate the user from the token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return this.error('No authorization token provided', 401);
    }
    const token = authHeader.substring(7);
    const { data: { user }, error: userError } = await this.supabase.auth.getUser(token);

    if (userError || !user) {
      return this.error('Invalid token', 401);
    }

    // 2. Check if the user has the 'admin' role
    // Note: Supabase JWT doesn't include roles by default. We query the 'profiles' table.
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'admin') {
      return this.error('Access denied: Admins only', 403);
    }

    // 3. Route to the correct resource handler
    switch (resource) {
      case 'users':
        if (method === 'GET') {
          return this.getUsers();
        }
        break;

      case 'products':
        switch (method) {
          case 'GET':
            return this.getProducts();
          case 'POST':
            return this.createProduct(request);
          case 'PUT':
            return this.updateProduct(request);
          case 'DELETE':
            return this.deleteProduct(request);
          default:
            return this.methodNotAllowed();
        }
        break;

      case 'blog':
        switch (method) {
          case 'GET':
            return this.getBlogPosts();
          case 'POST':
            return this.createBlogPost(request);
          case 'PUT':
            return this.updateBlogPost(request);
          case 'DELETE':
            return this.deleteBlogPost(request);
          default:
            return this.methodNotAllowed();
        }
        break;
      // Add other admin resources here (e.g., 'products', 'courses')
      default:
        return this.notFound();
    }
    
    return this.methodNotAllowed();
  }

  async getUsers() {
    // Use the service role key to bypass RLS and get all users
    // This requires creating a separate Supabase client with the service key
    // For now, we use the admin's privilege which should have access via RLS.
    const { data: users, error } = await this.supabase.auth.admin.listUsers();

    if (error) {
      return this.error(error.message, 500);
    }

    return this.success(users.users);
  }

  // Product Management Methods
  async getProducts() {
    const { data, error } = await this.supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      return this.error(error.message);
    }
    return this.success(data);
  }

  async createProduct(request) {
    const productData = await request.json();
    const { data, error } = await this.supabase.from('products').insert(productData).select().single();
    if (error) {
      return this.error(error.message);
    }
    return this.success(data, 201);
  }

  async updateProduct(request) {
    const { id, ...updateData } = await request.json();
    if (!id) {
      return this.error('Product ID is required for updates', 400);
    }
    const { data, error } = await this.supabase.from('products').update(updateData).eq('id', id).select().single();
    if (error) {
      return this.error(error.message);
    }
    return this.success(data);
  }

  async deleteProduct(request) {
    const { id } = await request.json();
    if (!id) {
      return this.error('Product ID is required for deletion', 400);
    }
    const { error } = await this.supabase.from('products').delete().eq('id', id);
    if (error) {
      return this.error(error.message);
    }
    return this.success({ message: 'Product deleted successfully' });
  }

  // Blog Management Methods
  async getBlogPosts() {
    const { data, error } = await this.supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) {
      return this.error(error.message);
    }
    return this.success(data);
  }

  async createBlogPost(request) {
    const postData = await request.json();
    const { data, error } = await this.supabase.from('blog_posts').insert(postData).select().single();
    if (error) {
      return this.error(error.message);
    }
    return this.success(data, 201);
  }

  async updateBlogPost(request) {
    const { id, ...updateData } = await request.json();
    if (!id) {
      return this.error('Post ID is required for updates', 400);
    }
    const { data, error } = await this.supabase.from('blog_posts').update(updateData).eq('id', id).select().single();
    if (error) {
      return this.error(error.message);
    }
    return this.success(data);
  }

  async deleteBlogPost(request) {
    const { id } = await request.json();
    if (!id) {
      return this.error('Post ID is required for deletion', 400);
    }
    const { error } = await this.supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      return this.error(error.message);
    }
    return this.success({ message: 'Blog post deleted successfully' });
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

  notFound() {
    return this.error('Admin resource not found', 404);
  }

  methodNotAllowed() {
    return this.error('Method not allowed for this resource', 405);
  }
}
