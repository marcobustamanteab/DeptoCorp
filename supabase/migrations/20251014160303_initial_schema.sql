-- ============================================
-- EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ============================================
-- EDIFICIOS
-- ============================================
CREATE TABLE edificios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  ciudad TEXT,
  pais TEXT DEFAULT 'Chile',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEPARTAMENTOS
-- ============================================
CREATE TABLE departamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edificio_id UUID REFERENCES edificios(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  piso INTEGER,
  metros_cuadrados DECIMAL(10,2),
  porcentaje_gastos DECIMAL(5,2) DEFAULT 0, -- % que paga de gastos comunes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(edificio_id, numero)
);

-- ============================================
-- RESIDENTES
-- ============================================
CREATE TABLE residentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  departamento_id UUID REFERENCES departamentos(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  rut TEXT,
  es_propietario BOOLEAN DEFAULT false,
  fecha_ingreso DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROLES DE USUARIO
-- ============================================
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  edificio_id UUID REFERENCES edificios(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'residente', 'portero')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, edificio_id)
);

-- ============================================
-- GASTOS COMUNES (MENSUALES)
-- ============================================
CREATE TABLE gastos_comunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edificio_id UUID REFERENCES edificios(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio INTEGER NOT NULL,
  monto_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  fecha_vencimiento DATE NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'cerrado')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(edificio_id, mes, anio)
);

-- ============================================
-- DETALLE GASTOS POR DEPARTAMENTO
-- ============================================
CREATE TABLE gastos_departamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_comun_id UUID REFERENCES gastos_comunes(id) ON DELETE CASCADE,
  departamento_id UUID REFERENCES departamentos(id) ON DELETE CASCADE,
  monto DECIMAL(12,2) NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'atrasado')),
  fecha_pago TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gasto_comun_id, departamento_id)
);

-- ============================================
-- PAGOS
-- ============================================
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_departamento_id UUID REFERENCES gastos_departamento(id) ON DELETE CASCADE,
  monto DECIMAL(12,2) NOT NULL,
  metodo_pago TEXT, -- 'transferencia', 'mercadopago', 'efectivo', etc
  referencia_externa TEXT, -- ID de Mercado Pago, número de transferencia, etc
  comprobante_url TEXT, -- URL del archivo en Supabase Storage
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'rechazado')),
  fecha_pago TIMESTAMPTZ DEFAULT NOW(),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AVISOS/ANUNCIOS
-- ============================================
CREATE TABLE avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edificio_id UUID REFERENCES edificios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  activo BOOLEAN DEFAULT true,
  fecha_publicacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_expiracion TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ESPACIOS COMUNES (para reservas)
-- ============================================
CREATE TABLE espacios_comunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edificio_id UUID REFERENCES edificios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  capacidad INTEGER,
  requiere_autorizacion BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESERVAS
-- ============================================
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edificio_id UUID REFERENCES edificios(id) ON DELETE CASCADE,
  espacio_id UUID REFERENCES espacios_comunes(id) ON DELETE CASCADE,
  departamento_id UUID REFERENCES departamentos(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  estado TEXT DEFAULT 'confirmada' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VISITAS (registro de visitas)
-- ============================================
CREATE TABLE visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento_id UUID REFERENCES departamentos(id) ON DELETE CASCADE,
  nombre_visitante TEXT NOT NULL,
  rut_visitante TEXT,
  patente_vehiculo TEXT,
  fecha_entrada TIMESTAMPTZ DEFAULT NOW(),
  fecha_salida TIMESTAMPTZ,
  autorizado_por UUID REFERENCES residentes(id),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================
CREATE INDEX idx_departamentos_edificio ON departamentos(edificio_id);
CREATE INDEX idx_residentes_departamento ON residentes(departamento_id);
CREATE INDEX idx_residentes_user ON residentes(user_id);
CREATE INDEX idx_gastos_comunes_edificio ON gastos_comunes(edificio_id);
CREATE INDEX idx_gastos_departamento_gasto ON gastos_departamento(gasto_comun_id);
CREATE INDEX idx_gastos_departamento_depto ON gastos_departamento(departamento_id);
CREATE INDEX idx_pagos_gasto_depto ON pagos(gasto_departamento_id);
CREATE INDEX idx_avisos_edificio ON avisos(edificio_id);
CREATE INDEX idx_reservas_edificio ON reservas(edificio_id);
CREATE INDEX idx_visitas_departamento ON visitas(departamento_id);

-- ============================================
-- FUNCIONES PARA UPDATED_AT AUTOMÁTICO
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_edificios_updated_at BEFORE UPDATE ON edificios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departamentos_updated_at BEFORE UPDATE ON departamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residentes_updated_at BEFORE UPDATE ON residentes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_comunes_updated_at BEFORE UPDATE ON gastos_comunes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_departamento_updated_at BEFORE UPDATE ON gastos_departamento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE edificios ENABLE ROW LEVEL SECURITY;
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE residentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_comunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_departamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE espacios_comunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

-- Políticas para ADMINS (acceso completo a su edificio)
CREATE POLICY "Admins can view their building" ON edificios
    FOR SELECT USING (
        id IN (
            SELECT edificio_id FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage departments" ON departamentos
    FOR ALL USING (
        edificio_id IN (
            SELECT edificio_id FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage residents" ON residentes
    FOR ALL USING (
        departamento_id IN (
            SELECT d.id FROM departamentos d
            JOIN user_roles ur ON ur.edificio_id = d.edificio_id
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Políticas para RESIDENTES (ver solo sus datos)
CREATE POLICY "Residents can view their department" ON departamentos
    FOR SELECT USING (
        id IN (
            SELECT departamento_id FROM residentes 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Residents can view their info" ON residentes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Residents can view their gastos" ON gastos_departamento
    FOR SELECT USING (
        departamento_id IN (
            SELECT departamento_id FROM residentes 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Residents can view their pagos" ON pagos
    FOR SELECT USING (
        gasto_departamento_id IN (
            SELECT gd.id FROM gastos_departamento gd
            JOIN residentes r ON r.departamento_id = gd.departamento_id
            WHERE r.user_id = auth.uid()
        )
    );

-- Políticas para AVISOS (todos pueden ver avisos de su edificio)
CREATE POLICY "Users can view building announcements" ON avisos
    FOR SELECT USING (
        edificio_id IN (
            SELECT edificio_id FROM user_roles 
            WHERE user_id = auth.uid()
        )
        OR
        edificio_id IN (
            SELECT d.edificio_id FROM departamentos d
            JOIN residentes r ON r.departamento_id = d.id
            WHERE r.user_id = auth.uid()
        )
    );