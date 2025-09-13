import { corsHeaders } from '../headers.js';

export class UserContentHandler {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async handle(request, method, resource) {
    const user = await this.authenticate(request);
    if (user instanceof Response) return user; // Error response

    switch (resource) {
      case 'enrolled-courses':
        if (method === 'GET') return this.getEnrolledCourses(user.id);
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

  async getEnrolledCourses(userId) {
    // This query joins enrollments with courses and calculates progress.
    // It's a complex query that might need a PostgreSQL function in Supabase for optimization.
    const { data, error } = await this.supabase
      .from('user_course_enrollments')
      .select(`
        *, 
        course:courses(*)
      `)
      .eq('user_id', userId);

    if (error) {
      return this.error(error.message);
    }

    // Placeholder for progress calculation. A real implementation would be more complex.
    const coursesWithProgress = data.map(enrollment => ({
      ...enrollment.course,
      progress: 50, // Simulated progress
      purchaseDate: enrollment.enrolled_at,
      certificateAvailable: false, // To be implemented
      lastAccessed: null // To be implemented
    }));

    return this.success(coursesWithProgress);
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
