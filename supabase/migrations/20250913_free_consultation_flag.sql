-- Añadir columna para rastrear la consulta gratuita a la tabla de perfiles si no existe
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'used_free_consultation'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN used_free_consultation BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;
