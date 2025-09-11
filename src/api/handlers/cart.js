/**
 * Shopping Cart Handler
 */

import { corsHeaders } from '../headers.js';

export class CartHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, action) {
    const sessionId = request.headers.get('X-Session-ID');
    const authHeader = request.headers.get('Authorization');
    const user = authHeader ? await this.authenticate(authHeader) : null;
    
    const identifier = user ? { user_id: user.id } : { session_id: sessionId };
    
    if (!user && !sessionId) {
      return this.error('Session ID requerido para usuarios invitados', 400);
    }

    switch (method) {
      case 'GET':
        return this.getCart(identifier);
      
      case 'POST':
        if (action === 'add') {
          return this.addToCart(request, identifier);
        }
        if (action === 'remove') {
          return this.removeFromCart(request, identifier);
        }
        if (action === 'update') {
          return this.updateCartItem(request, identifier);
        }
        if (action === 'clear') {
          return this.clearCart(identifier);
        }
        if (action === 'apply-coupon') {
          return this.applyCoupon(request, identifier);
        }
        if (action === 'checkout') {
          return this.initiateCheckout(request, identifier, user);
        }
        return this.notFound();
      
      case 'DELETE':
        return this.clearCart(identifier);
      
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

  async getCart(identifier) {
    let query = this.supabase
      .from('carts')
      .select('*');
    
    if (identifier.user_id) {
      query = query.eq('user_id', identifier.user_id);
    } else {
      query = query.eq('session_id', identifier.session_id);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      return this.error(error.message);
    }

    if (!data) {
      // Create new cart
      const newCart = await this.createCart(identifier);
      return this.success(newCart);
    }

    // Check if cart expired
    if (new Date(data.expires_at) < new Date()) {
      await this.clearCart(identifier);
      const newCart = await this.createCart(identifier);
      return this.success(newCart);
    }

    // Enrich cart items with product/service details
    const enrichedCart = await this.enrichCartItems(data);
    return this.success(enrichedCart);
  }

  async createCart(identifier) {
    const { data, error } = await this.supabase
      .from('carts')
      .insert({
        ...identifier,
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async addToCart(request, identifier) {
    const { 
      type, // 'product' or 'service'
      item_id, 
      quantity = 1,
      metadata = {}
    } = await request.json();

    if (!type || !item_id) {
      return this.error('Tipo e ID del item son requeridos', 400);
    }

    // Get current cart
    let cart = await this.getOrCreateCart(identifier);

    // Get item details
    let itemDetails;
    if (type === 'product') {
      const { data } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', item_id)
        .single();
      itemDetails = data;
    } else if (type === 'service') {
      const { data } = await this.supabase
        .from('services')
        .select('*')
        .eq('id', item_id)
        .single();
      itemDetails = data;
    }

    if (!itemDetails) {
      return this.error('Item no encontrado', 404);
    }

    // Check stock for products
    if (type === 'product' && itemDetails.stock < quantity) {
      return this.error('Stock insuficiente', 400);
    }

    // Add or update item in cart
    const items = cart.items || [];
    const existingItemIndex = items.findIndex(
      item => item.type === type && item.item_id === item_id
    );

    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity += quantity;
      items[existingItemIndex].subtotal = items[existingItemIndex].quantity * items[existingItemIndex].price;
    } else {
      items.push({
        type,
        item_id,
        name: itemDetails.name,
        price: itemDetails.sale_price || itemDetails.price,
        quantity,
        subtotal: quantity * (itemDetails.sale_price || itemDetails.price),
        metadata
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.12; // 12% IVA Ecuador
    const total = subtotal + tax - (cart.discount || 0);

    // Update cart
    const { data, error } = await this.supabase
      .from('carts')
      .update({
        items,
        subtotal,
        tax,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', cart.id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async removeFromCart(request, identifier) {
    const { item_id, type } = await request.json();

    if (!item_id || !type) {
      return this.error('ID y tipo del item son requeridos', 400);
    }

    const cart = await this.getOrCreateCart(identifier);
    const items = cart.items.filter(
      item => !(item.item_id === item_id && item.type === type)
    );

    // Recalculate totals
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax - (cart.discount || 0);

    const { data, error } = await this.supabase
      .from('carts')
      .update({
        items,
        subtotal,
        tax,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', cart.id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async updateCartItem(request, identifier) {
    const { item_id, type, quantity } = await request.json();

    if (!item_id || !type || quantity === undefined) {
      return this.error('ID, tipo y cantidad son requeridos', 400);
    }

    if (quantity <= 0) {
      return this.removeFromCart(request, identifier);
    }

    const cart = await this.getOrCreateCart(identifier);
    const items = cart.items || [];
    const itemIndex = items.findIndex(
      item => item.item_id === item_id && item.type === type
    );

    if (itemIndex === -1) {
      return this.error('Item no encontrado en el carrito', 404);
    }

    // Check stock for products
    if (type === 'product') {
      const { data: product } = await this.supabase
        .from('products')
        .select('stock')
        .eq('id', item_id)
        .single();

      if (product && product.stock < quantity) {
        return this.error('Stock insuficiente', 400);
      }
    }

    items[itemIndex].quantity = quantity;
    items[itemIndex].subtotal = quantity * items[itemIndex].price;

    // Recalculate totals
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax - (cart.discount || 0);

    const { data, error } = await this.supabase
      .from('carts')
      .update({
        items,
        subtotal,
        tax,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', cart.id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async clearCart(identifier) {
    const cart = await this.getOrCreateCart(identifier);

    const { data, error } = await this.supabase
      .from('carts')
      .update({
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        coupon_code: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', cart.id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success(data);
  }

  async applyCoupon(request, identifier) {
    const { coupon_code } = await request.json();

    if (!coupon_code) {
      return this.error('Código de cupón requerido', 400);
    }

    const cart = await this.getOrCreateCart(identifier);

    // Get coupon details
    const { data: coupon, error: couponError } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toUpperCase())
      .eq('active', true)
      .single();

    if (couponError || !coupon) {
      return this.error('Cupón inválido o expirado', 400);
    }

    // Check validity dates
    const now = new Date();
    if (new Date(coupon.valid_from) > now || 
        (coupon.valid_until && new Date(coupon.valid_until) < now)) {
      return this.error('Cupón fuera del período de validez', 400);
    }

    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return this.error('Cupón ha alcanzado el límite de uso', 400);
    }

    // Check minimum purchase
    if (coupon.min_purchase && cart.subtotal < coupon.min_purchase) {
      return this.error(`Compra mínima requerida: $${coupon.min_purchase}`, 400);
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = cart.subtotal * (coupon.discount_value / 100);
    } else {
      discount = Math.min(coupon.discount_value, cart.subtotal);
    }

    // Update cart with discount
    const total = cart.subtotal + cart.tax - discount;

    const { data, error } = await this.supabase
      .from('carts')
      .update({
        coupon_code: coupon.code,
        discount,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', cart.id)
      .select()
      .single();

    if (error) {
      return this.error(error.message);
    }

    return this.success({
      ...data,
      coupon_applied: {
        code: coupon.code,
        description: coupon.description,
        discount_amount: discount
      }
    });
  }

  async initiateCheckout(request, identifier, user) {
    const cart = await this.getOrCreateCart(identifier);

    if (!cart.items || cart.items.length === 0) {
      return this.error('Carrito vacío', 400);
    }

    // If guest user, require basic info
    let checkoutData = {};
    if (!user) {
      const { email, name, phone } = await request.json();
      if (!email || !name) {
        return this.error('Email y nombre son requeridos para continuar', 400);
      }
      checkoutData = { email, name, phone };
    }

    // Create order/payment intent
    const orderData = {
      cart_id: cart.id,
      user_id: user?.id,
      items: cart.items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      discount: cart.discount,
      total: cart.total,
      coupon_code: cart.coupon_code,
      customer_info: checkoutData,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Return checkout session
    return this.success({
      checkout_session_id: cart.id,
      cart: cart,
      payment_amount: cart.total,
      customer_info: checkoutData,
      payment_methods: ['paypal', 'bank_transfer']
    });
  }

  async getOrCreateCart(identifier) {
    let query = this.supabase
      .from('carts')
      .select('*');
    
    if (identifier.user_id) {
      query = query.eq('user_id', identifier.user_id);
    } else {
      query = query.eq('session_id', identifier.session_id);
    }

    const { data } = await query.single();

    if (!data) {
      return await this.createCart(identifier);
    }

    return data;
  }

  async enrichCartItems(cart) {
    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        if (item.type === 'product') {
          const { data } = await this.supabase
            .from('products')
            .select('name, description, image_url')
            .eq('id', item.item_id)
            .single();
          return { ...item, details: data };
        } else if (item.type === 'service') {
          const { data } = await this.supabase
            .from('services')
            .select('name, description, duration_minutes')
            .eq('id', item.item_id)
            .single();
          return { ...item, details: data };
        }
        return item;
      })
    );

    return {
      ...cart,
      items: enrichedItems
    };
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

  notFound() {
    return this.error('Endpoint no encontrado', 404);
  }

  methodNotAllowed() {
    return this.error('Método no permitido', 405);
  }
}
