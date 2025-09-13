import { corsHeaders } from '../headers.js';

export class SubscriptionHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, action) {
    // 1. Authenticate the user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return this.error('No authorization token provided', 401);
    }
    const token = authHeader.substring(7);
    const { data: { user }, error: userError } = await this.supabase.auth.getUser(token);

    if (userError || !user) {
      return this.error('Invalid token', 401);
    }

    // 2. Route to the correct method
    switch (method) {
      case 'GET':
        if (action === 'plans') {
          return this.getSubscriptionPlans();
        }
        return this.getUserSubscription(user);
      case 'POST':
        // The creation of a subscription should be triggered by a successful payment webhook
        // to ensure it's a secure, server-to-server operation. 
        // This POST endpoint is for manual activation or special cases.
        return this.createUserSubscription(request, user);
      default:
        return this.methodNotAllowed();
    }
  }

  async getSubscriptionPlans() {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) {
      return this.error(error.message);
    }
    return this.success(data);
  }

  async getUserSubscription(user) {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('end_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return this.error(error.message);
    }

    return this.success(data);
  }

  async createUserSubscription(request, user) {
    const { plan_id, payment_id } = await request.json();
    if (!plan_id) {
      return this.error('Plan ID is required.', 400);
    }

    // 1. Get plan details to know duration and tokens
    const { data: plan, error: planError } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return this.error('Invalid plan ID.', 404);
    }

    // 2. Create the subscription
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1); // Assuming all plans are monthly for now

    const { data: subscription, error: subscriptionError } = await this.supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })
      .select()
      .single();

    if (subscriptionError) {
      return this.error(`Failed to create subscription: ${subscriptionError.message}`);
    }

    // 3. Add tokens to the user's profile
    const { error: tokenError } = await this.supabase.rpc('add_tokens_to_user', {
      user_id_input: user.id,
      tokens_to_add: plan.tokens_granted
    });

    if (tokenError) {
      // Log this critical error for manual correction
      console.error(`CRITICAL: Failed to add ${plan.tokens_granted} tokens to user ${user.id} for subscription ${subscription.id}.`);
    }

    return this.success(subscription, 201);
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
  
  methodNotAllowed() {
    return this.error('Method Not Allowed', 405);
  }
}
