import { corsHeaders } from '../headers.js';

export class GamificationHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, action) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return this.error('Unauthorized', 401);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await this.supabase.auth.getUser(token);
    if (userError || !user) return this.error('Invalid token', 401);

    switch (action) {
      case 'daily-question':
        return this.getDailyQuestion(user);
      case 'submit-answer':
        return this.submitAnswer(request, user);
      default:
        return this.notFound();
    }
  }

  async getDailyQuestion(user) {
    const today = new Date().toISOString().split('T')[0];

    // Check if user has already played today
    const { data: progress, error: progressError } = await this.supabase
      .from('user_trivia_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('last_played_date', today)
      .single();

    if (progress) {
      return this.error('Ya has jugado la trivia de hoy.', 429);
    }

    // Fetch a random question that the user hasn't answered yet (simplified)
    const { data: question, error: questionError } = await this.supabase
      .from('trivia_questions')
      .select('id, question, options, difficulty') // Don't send the correct answer to the client
      .eq('active', true)
      .limit(1) // Simplified: should be random and not repeated
      .single();

    if (questionError || !question) {
      return this.error('No se encontró una pregunta de trivia.', 404);
    }

    return this.success(question);
  }

  async submitAnswer(request, user) {
    const { question_id, answer } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    // 1. Get the correct answer from the database
    const { data: question, error: questionError } = await this.supabase
      .from('trivia_questions')
      .select('correct_answer, explanation, difficulty')
      .eq('id', question_id)
      .single();

    if (questionError || !question) {
      return this.error('Pregunta no válida.', 404);
    }

    const isCorrect = question.correct_answer === answer;
    let tokensAwarded = 0;

    // 2. If correct, award tokens based on difficulty
    if (isCorrect) {
      switch (question.difficulty) {
        case 'easy': tokensAwarded = 1; break;
        case 'medium': tokensAwarded = 3; break;
        case 'hard': tokensAwarded = 5; break;
      }
      
      const { error: tokenError } = await this.supabase.rpc('add_tokens_to_user', {
        user_id_input: user.id,
        tokens_to_add: tokensAwarded
      });

      if (tokenError) {
        return this.error('No se pudieron otorgar los tokens.');
      }
    }

    // 3. Update user's trivia progress for today
    const { error: progressError } = await this.supabase
      .from('user_trivia_progress')
      .upsert({
        user_id: user.id,
        last_played_date: today,
        correct_answers: isCorrect ? 1 : 0,
        incorrect_answers: isCorrect ? 0 : 1,
      }, { onConflict: 'user_id, last_played_date' });

    if (progressError) {
      return this.error('No se pudo guardar tu progreso.');
    }

    return this.success({
      correct: isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      tokensAwarded,
    });
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
    return this.error('Not Found', 404);
  }
}
