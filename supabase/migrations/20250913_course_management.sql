-- Crear tabla para los cursos
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla para los módulos de los cursos
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    module_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla para las lecciones de los módulos
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- Contenido de la lección (texto, markdown, etc.)
    video_url TEXT,
    lesson_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- El público puede ver los cursos publicados
CREATE POLICY "Allow public read access to published courses" ON public.courses FOR SELECT USING (published = true);
-- Los administradores tienen acceso total a los cursos
CREATE POLICY "Allow admin full access to courses" ON public.courses FOR ALL USING (public.is_admin(auth.uid()));

-- Los administradores tienen acceso total a los módulos
CREATE POLICY "Allow admin full access to course modules" ON public.course_modules FOR ALL USING (public.is_admin(auth.uid()));

-- Los administradores tienen acceso total a las lecciones
CREATE POLICY "Allow admin full access to course lessons" ON public.course_lessons FOR ALL USING (public.is_admin(auth.uid()));

-- (Nota: Se necesitarán políticas adicionales para que los usuarios inscritos puedan ver el contenido)
