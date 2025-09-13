-- Habilitar RLS para las nuevas tablas
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Crear tabla para los planes de suscripción
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    tokens_granted INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla para las suscripciones de los usuarios
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled')), -- active, inactive, cancelled
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Añadir columna de tokens a la tabla de perfiles si no existe
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'tokens'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN tokens INT NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Políticas de seguridad para subscription_plans (lectura pública)
CREATE POLICY "Allow public read access to subscription plans" ON public.subscription_plans FOR SELECT USING (true);

-- Políticas de seguridad para user_subscriptions (solo el propio usuario puede ver su suscripción)
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
