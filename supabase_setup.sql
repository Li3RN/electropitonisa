-- ==============================================================================
-- 🔮 ELECTRO-PITONISA (TAROT DIGITAL DE SANDRA) - CONFIGURACIÓN SUPABASE
-- ==============================================================================
-- Copia y pega este script en el editor SQL de tu panel de Supabase
-- (Project Dashboard -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Tabla de la Tirada de la Semana (una sola fila activa que Sandra actualiza)
CREATE TABLE IF NOT EXISTS public.weekly_reading (
    id INT PRIMARY KEY DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Fila por defecto si no existe
INSERT INTO public.weekly_reading (id, title, description, youtube_url, image_url)
VALUES (
    1,
    'El Sol, La Estrella y La Rueda: Renacimiento y Claridad Cósmica',
    'Esta semana las energías nos invitan a soltar viejos bloqueos. Los Arcanos Mayores anuncian cambios kármicos positivos, revelaciones luminosas y una potente alineación con tus verdaderos propósitos.',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'img/tirada_semana.jpg'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabla de Reservas de Citas
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    service_type TEXT NOT NULL,
    service_price TEXT,
    preferred_date DATE NOT NULL,
    preferred_time TEXT,
    modality TEXT DEFAULT 'online', -- 'online_video', 'grabacion_personalizada', 'whatsapp'
    notes TEXT,
    status TEXT DEFAULT 'pendiente', -- 'pendiente', 'confirmada', 'completada', 'cancelada'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Tiradas Personalizadas para Clientas Registradas
CREATE TABLE IF NOT EXISTS public.client_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    title TEXT NOT NULL,
    spread_name TEXT,
    reading_date DATE DEFAULT CURRENT_DATE,
    image_url TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    interpretation TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Crear índices útiles
CREATE INDEX IF NOT EXISTS idx_client_readings_email ON public.client_readings (client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (preferred_date);

-- ==============================================================================
-- POLÍTICAS DE ACCESO (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE public.weekly_reading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_readings ENABLE ROW LEVEL SECURITY;

-- Lectura pública para la tirada de la semana
CREATE POLICY "Lectura pública de la tirada de la semana"
ON public.weekly_reading FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir a Sandra actualizar la tirada de la semana
CREATE POLICY "Permitir actualizar tirada de la semana"
ON public.weekly_reading FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permitir a cualquier visitante crear reservas
CREATE POLICY "Permitir inserción de reservas"
ON public.bookings FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir lectura y gestión de reservas
CREATE POLICY "Lectura y gestión de reservas"
ON public.bookings FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permitir ver tiradas de clientas
CREATE POLICY "Acceso a tiradas de clientas"
ON public.client_readings FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
