import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbybhgxqdefuquybstqk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtieWJoZ3hxZGVmdXF1eWJzdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjAwODMsImV4cCI6MjA3MzEzNjA4M30.s1knFM9QXd8CH8TC0IOtBBBvb-qm2XYl_VlhVb-CqcE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export const dbHelpers = {
  // User operations
  async getUser(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return { data, error };
  },

  // Products operations
  async getProducts(category = null) {
    let query = supabase.from('products').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    return { data, error };
  },

  async getProduct(productId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    return { data, error };
  },

  // Orders operations
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select();
    return { data, error };
  },

  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Blog operations
  async getBlogPosts(limit = 10) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getBlogPost(slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    return { data, error };
  },

  // Courses operations
  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*, lessons(*)')
      .eq('published', true);
    return { data, error };
  },

  async getCourse(courseId) {
    const { data, error } = await supabase
      .from('courses')
      .select('*, lessons(*), enrollments(*)')
      .eq('id', courseId)
      .single();
    return { data, error };
  },

  async enrollInCourse(userId, courseId) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        status: 'active'
      });
    return { data, error };
  },

  // Newsletter operations
  async subscribeNewsletter(email, name = null) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        name,
        subscribed_at: new Date().toISOString(),
        status: 'active'
      });
    return { data, error };
  },

  // Support operations
  async createSupportTicket(ticketData) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert(ticketData)
      .select();
    return { data, error };
  },

  async getUserTickets(userId) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};

export default supabase;