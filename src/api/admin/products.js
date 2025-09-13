import { json } from '@sveltejs/kit';
import { supabase } from '../../lib/supabaseClient';

export async function GET({ request }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;

    return json({ data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const productData = await request.json();

    // Insert new product
    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;

    return json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return json({ error: error.message }, { status: 500 });
  }
}

export async function PUT({ request }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, ...updates } = await request.json();

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return json({ data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await request.json();

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
