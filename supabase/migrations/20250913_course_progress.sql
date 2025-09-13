-- Crear tabla para las inscripciones de los usuarios en los cursos
CREATE TABLE IF NOT EXISTS public.user_course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id) -- Un usuario solo puede inscribirse una vez en un curso
);

-- Crear tabla para el progreso de los usuarios en las lecciones
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

-- Habilitar RLS
ALTER TABLE public.user_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Los usuarios pueden ver sus propias inscripciones
CREATE POLICY "Users can view their own enrollments" ON public.user_course_enrollments FOR SELECT USING (auth.uid() = user_id);
-- Los administradores tienen acceso total a las inscripciones
CREATE POLICY "Allow admin full access to enrollments" ON public.user_course_enrollments FOR ALL USING (public.is_admin(auth.uid()));

-- Los usuarios pueden gestionar su propio progreso en las lecciones
CREATE POLICY "Users can manage their own lesson progress" ON public.user_lesson_progress FOR ALL USING (auth.uid() = user_id);
-- Los administradores tienen acceso total al progreso de las lecciones
CREATE POLICY "Allow admin full access to lesson progress" ON public.user_lesson_progress FOR ALL USING (public.is_admin(auth.uid()));

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_course_enrollments_user_id ON public.user_course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id_lesson_id ON public.user_lesson_progress(user_id, lesson_id);
