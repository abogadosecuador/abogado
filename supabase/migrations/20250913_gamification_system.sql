-- Crear tabla para las preguntas de trivia
CREATE TABLE IF NOT EXISTS public.trivia_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- { "a": "Respuesta A", "b": "Respuesta B", ... }
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT, -- Explicación de la respuesta correcta
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla para el progreso de los usuarios en la trivia
CREATE TABLE IF NOT EXISTS public.user_trivia_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    last_played_date DATE NOT NULL,
    daily_streak INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    incorrect_answers INT NOT NULL DEFAULT 0,
    UNIQUE(user_id, last_played_date)
);

-- Habilitar RLS
ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trivia_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Allow authenticated users to read active trivia questions" ON public.trivia_questions FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Allow users to manage their own trivia progress" ON public.user_trivia_progress FOR ALL USING (auth.uid() = user_id);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_trivia_progress_user_id ON public.user_trivia_progress(user_id);
