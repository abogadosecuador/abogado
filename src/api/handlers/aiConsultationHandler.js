import { corsHeaders } from '../headers.js';

// Placeholder for Gemini API client
async function callGeminiApi(prompt, env) {
  if (!env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not configured. Simulating AI response.');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `--- RESPUESTA SIMULADA DE IA ---\nBasado en tu consulta: "${prompt.substring(0, 150)}...", la recomendación inicial es...`;
  }
  // Real API call logic would go here
}

export class AiConsultationHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
    this.CONSULTATION_TOKEN_COST = 10; // Define the cost for a consultation
  }

  async handle(request) {
    // 1. Authenticate the user
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return this.error('Unauthorized', 401);
    const { data: { user }, error: userError } = await this.supabase.auth.getUser(token);
    if (userError || !user) return this.error('Invalid token', 401);

    // 2. Get the user's query from the request
    const { query } = await request.json();
    if (!query) return this.error('La consulta no puede estar vacía.', 400);

    // 3. Get user profile to check free consultation status and token balance
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('used_free_consultation, tokens')
      .eq('id', user.id)
      .single();

    if (profileError) return this.error('No se pudo obtener el perfil del usuario.', 500);

    // 4. Decide the logic: free or paid
    if (!profile.used_free_consultation) {
      return this.processFreeConsultation(user, query);
    } else {
      return this.processPaidConsultation(user, profile, query);
    }
  }

  async processFreeConsultation(user, query) {
    try {
      const prompt = `Consulta legal de un usuario: "${query}". Proporciona una respuesta clara y concisa.`;
      const aiResponse = await callGeminiApi(prompt, this.env);

      // Mark the free consultation as used
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ used_free_consultation: true })
        .eq('id', user.id);

      if (updateError) {
        console.error(`CRITICAL: Failed to mark free consultation as used for user ${user.id}.`);
        // Proceed anyway but log the error
      }

      return this.success({ content: aiResponse, tokensSpent: 0 });
    } catch (err) {
      return this.error(err.message);
    }
  }

  async processPaidConsultation(user, profile, query) {
    if (profile.tokens < this.CONSULTATION_TOKEN_COST) {
      return this.error('Tokens insuficientes para esta consulta.', 403);
    }

    try {
      const prompt = `Consulta legal de un usuario: "${query}". Proporciona una respuesta clara y concisa.`;
      const aiResponse = await callGeminiApi(prompt, this.env);

      // Deduct tokens
      const new_token_balance = profile.tokens - this.CONSULTATION_TOKEN_COST;
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ tokens: new_token_balance })
        .eq('id', user.id);

      if (updateError) {
        console.error(`CRITICAL: Failed to deduct tokens for user ${user.id}.`);
        return this.error('No se pudieron deducir los tokens. Inténtalo de nuevo.');
      }

      return this.success({ content: aiResponse, tokensSpent: this.CONSULTATION_TOKEN_COST, newTokenBalance: new_token_balance });
    } catch (err) {
      return this.error(err.message);
    }
  }

  // Response helpers
  success(data, status = 200) {
    return new Response(JSON.stringify({ success: true, data }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }

  error(message, status = 500) {
    return new Response(JSON.stringify({ success: false, error: message }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
}
