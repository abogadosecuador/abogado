import { supabase } from '../config/supabase';

export const databaseService = {
  // USUARIOS
  async saveUser(userData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userData]);
    return { data, error };
  },

  // CONTACTOS
  async saveContact(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData]);
    return { data, error };
  },

  // SUSCRIPTORES
  async saveSubscriber(email, name) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, name }]);
    return { data, error };
  },

  // PRODUCTOS
  async saveProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData]);
    return { data, error };
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id);
    return { data, error };
  },

  async deleteProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // CURSOS
  async saveCourse(courseData) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData]);
    return { data, error };
  },

  // BLOG
  async saveBlogPost(postData) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postData]);
    return { data, error };
  },

  // VENTAS
  async saveOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData]);
    return { data, error };
  }
};
