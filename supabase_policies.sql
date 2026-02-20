-- Habilitar RLS en las tablas (por si no está habilitado)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_requests ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura pública para tickets
CREATE POLICY "Permitir lectura pública en tickets"
ON tickets
FOR SELECT
TO anon, authenticated
USING (true);

-- Crear política de lectura pública para program_requests
CREATE POLICY "Permitir lectura pública en program_requests"
ON program_requests
FOR SELECT
TO anon, authenticated
USING (true);

-- Si necesitas permitir también la creación (INSERT) desde el frontend sin auth:
-- CREATE POLICY "Permitir inserción pública en tickets"
-- ON tickets
-- FOR INSERT
-- TO anon, authenticated
-- WITH CHECK (true);
