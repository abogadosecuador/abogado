import { corsHeaders } from '../headers.js';

// Placeholder for Gemini API client. In a real app, you'd use the official SDK.
async function callGeminiApi(prompt, env) {
  if (!env.GEMINI_API_KEY) {
    // In production, this should be a hard failure. For local dev, we can simulate.
    console.warn('GEMINI_API_KEY is not configured. Simulating AI response.');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `--- DOCUMENTO SIMULADO ---\nEste es un documento generado por IA basado en el prompt: "${prompt.substring(0, 150)}..."`;
  }
  
  // Real API call logic would go here
  console.log(`Calling Gemini with prompt: ${prompt}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `Este es un documento generado por IA basado en el prompt: "${prompt.substring(0, 150)}..."`;
}

export class AiDocumentHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request) {
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

    // 2. Get request body
    const { template, formData, tokenCost } = await request.json();
    if (!template || !formData || !tokenCost) {
      return this.error('Faltan datos en la solicitud.', 400);
    }

    // 3. Verify user's token balance
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('tokens')
      .eq('id', user.id)
      .single();

    if (profileError) {
        return this.error('No se pudo verificar el perfil del usuario.', 500);
    }

    if (profile.tokens < tokenCost) {
      return this.error('Tokens insuficientes.', 403);
    }

    // 4. Generate the prompt for the AI
    const prompt = `Actúa como un abogado experto en Ecuador. Genera un documento legal del tipo "${template.name}" con los siguientes datos: ${JSON.stringify(formData, null, 2)}. El documento debe ser formal, completo y legalmente válido en Ecuador.`;

    try {
      // 5. Call the AI to generate the document
      const generatedContent = await callGeminiApi(prompt, this.env);

      // 6. Deduct tokens from the user's account
      const new_token_balance = profile.tokens - tokenCost;
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ tokens: new_token_balance })
        .eq('id', user.id);

      if (updateError) {
        console.error(`CRITICAL: Failed to deduct tokens for user ${user.id}. Error: ${updateError.message}`);
        // Decide if you should still return the document or an error. 
        // Returning an error is safer to prevent free usage.
        return this.error('No se pudieron deducir los tokens. Inténtalo de nuevo.');
      }

      // 7. Return the generated document
      return this.success({ content: generatedContent, newTokenBalance: new_token_balance });

    } catch (err) {
      console.error('Error generating document:', err);
      return this.error(err.message);
    }
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
}
