import { corsHeaders } from '../headers.js';

export class CourseContentHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, courseId, action) {
    const user = await this.authenticate(request);
    if (user instanceof Response) return user; // Error response

    // 1. Verify enrollment
    const isEnrolled = await this.checkEnrollment(user.id, courseId);
    if (!isEnrolled) {
      return this.error('No estás inscrito en este curso.', 403);
    }

    // 2. Route to action
    switch (action) {
      case 'content':
        if (method === 'GET') return this.getCourseContent(courseId);
        break;
      case 'progress':
        if (method === 'POST') return this.updateLessonProgress(request, user.id);
        break;
      default:
        return this.notFound();
    }
    return this.methodNotAllowed();
  }

  async authenticate(request) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return this.error('Unauthorized', 401);
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    if (error || !user) return this.error('Invalid token', 401);
    return user;
  }

  async checkEnrollment(userId, courseId) {
    const { data, error } = await this.supabase
      .from('user_course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    return !error && data;
  }

  async getCourseContent(courseId) {
    const { data, error } = await this.supabase
      .from('courses')
      .select(`
        *,
        modules:course_modules (*,
          lessons:course_lessons (*)
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) return this.error(error.message);
    return this.success(data);
  }

  async updateLessonProgress(request, userId) {
    const { lesson_id } = await request.json();
    if (!lesson_id) return this.error('Lesson ID es requerido.', 400);

    const { data, error } = await this.supabase
      .from('user_lesson_progress')
      .insert({ user_id: userId, lesson_id: lesson_id })
      .select()
      .single();

    if (error) {
      // Gracefully handle if progress already exists
      if (error.code === '23505') return this.success({ message: 'Progress already recorded.' });
      return this.error(error.message);
    }
    return this.success(data, 201);
  }

  // Response helpers
  success(data, status = 200) {
    return new Response(JSON.stringify({ success: true, data }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }

  error(message, status = 500) {
    return new Response(JSON.stringify({ success: false, error: message }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }

  notFound() {
    return this.error('Not Found', 404);
  }

  methodNotAllowed() {
    return this.error('Method Not Allowed', 405);
  }
}
