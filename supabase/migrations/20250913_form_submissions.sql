-- Crear tabla para los envíos del formulario de contacto
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN NOT NULL DEFAULT false
);

-- Crear tabla para los suscriptores del newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Cualquiera puede enviar un mensaje de contacto (insertar)
CREATE POLICY "Allow public insert for contact submissions" ON public.contact_submissions FOR INSERT WITH CHECK (true);
-- Solo los administradores pueden leer o modificar los mensajes de contacto
CREATE POLICY "Allow admin full access to contact submissions" ON public.contact_submissions FOR ALL USING (public.is_admin(auth.uid()));

-- Cualquiera puede suscribirse al newsletter (insertar)
CREATE POLICY "Allow public insert for newsletter subscribers" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
-- Solo los administradores pueden ver la lista de suscriptores
CREATE POLICY "Allow admin read access to newsletter subscribers" ON public.newsletter_subscribers FOR SELECT USING (public.is_admin(auth.uid()));
