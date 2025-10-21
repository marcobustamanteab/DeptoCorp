-- ============================================
-- SISTEMA DE NOTIFICACIONES IN-APP
-- Archivo: supabase/migrations/20251020_notificaciones.sql
-- ============================================

-- Crear tabla de notificaciones
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_notificaciones_user_leida ON notificaciones(user_id, leida, created_at DESC);

-- Row Level Security
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notificaciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notificaciones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notificaciones FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notificaciones FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCIÓN HELPER PARA CREAR NOTIFICACIONES
-- ============================================
CREATE OR REPLACE FUNCTION crear_notificacion(
  p_user_id UUID,
  p_tipo TEXT,
  p_titulo TEXT,
  p_mensaje TEXT,
  p_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notificacion_id UUID;
BEGIN
  INSERT INTO notificaciones (user_id, tipo, titulo, mensaje, url, metadata)
  VALUES (p_user_id, p_tipo, p_titulo, p_mensaje, p_url, p_metadata)
  RETURNING id INTO v_notificacion_id;
  
  RETURN v_notificacion_id;
END;
$$;

-- ============================================
-- TRIGGERS PARA AUTO-GENERAR NOTIFICACIONES
-- ============================================

-- 1. Notificar cuando se aprueba una reserva
CREATE OR REPLACE FUNCTION notificar_reserva_aprobada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_espacio_nombre TEXT;
  v_fecha TEXT;
BEGIN
  IF NEW.estado = 'confirmada' AND OLD.estado = 'pendiente' THEN
    
    SELECT r.user_id INTO v_user_id
    FROM residentes r
    WHERE r.departamento_id = NEW.departamento_id
    LIMIT 1;
    
    SELECT nombre INTO v_espacio_nombre
    FROM espacios_comunes
    WHERE id = NEW.espacio_id;
    
    v_fecha := TO_CHAR(NEW.fecha_inicio, 'DD/MM/YYYY');
    
    IF v_user_id IS NOT NULL THEN
      PERFORM crear_notificacion(
        v_user_id,
        'reserva_aprobada',
        '✅ Reserva Aprobada',
        'Tu reserva de ' || v_espacio_nombre || ' para el ' || v_fecha || ' ha sido aprobada',
        '/reservas',
        jsonb_build_object('reserva_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_reserva_aprobada
AFTER UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION notificar_reserva_aprobada();

-- 2. Notificar cuando se rechaza una reserva
CREATE OR REPLACE FUNCTION notificar_reserva_rechazada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_espacio_nombre TEXT;
  v_fecha TEXT;
BEGIN
  IF NEW.estado = 'cancelada' AND OLD.estado = 'pendiente' THEN
    
    SELECT r.user_id INTO v_user_id
    FROM residentes r
    WHERE r.departamento_id = NEW.departamento_id
    LIMIT 1;
    
    SELECT nombre INTO v_espacio_nombre
    FROM espacios_comunes
    WHERE id = NEW.espacio_id;
    
    v_fecha := TO_CHAR(NEW.fecha_inicio, 'DD/MM/YYYY');
    
    IF v_user_id IS NOT NULL THEN
      PERFORM crear_notificacion(
        v_user_id,
        'reserva_rechazada',
        '❌ Reserva Rechazada',
        'Tu reserva de ' || v_espacio_nombre || ' para el ' || v_fecha || ' fue rechazada',
        '/reservas',
        jsonb_build_object('reserva_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_reserva_rechazada
AFTER UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION notificar_reserva_rechazada();

-- 3. Notificar al admin cuando hay nueva reserva pendiente
CREATE OR REPLACE FUNCTION notificar_admin_nueva_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_admin_user_id UUID;
  v_espacio_nombre TEXT;
  v_depto_numero TEXT;
  v_fecha TEXT;
BEGIN
  IF NEW.estado = 'pendiente' THEN
    
    SELECT ur.user_id INTO v_admin_user_id
    FROM user_roles ur
    WHERE ur.edificio_id = NEW.edificio_id 
      AND ur.role = 'admin'
    LIMIT 1;
    
    SELECT nombre INTO v_espacio_nombre
    FROM espacios_comunes
    WHERE id = NEW.espacio_id;
    
    SELECT numero INTO v_depto_numero
    FROM departamentos
    WHERE id = NEW.departamento_id;
    
    v_fecha := TO_CHAR(NEW.fecha_inicio, 'DD/MM/YYYY');
    
    IF v_admin_user_id IS NOT NULL THEN
      PERFORM crear_notificacion(
        v_admin_user_id,
        'reserva_pendiente',
        '📋 Nueva Reserva Pendiente',
        'Depto ' || v_depto_numero || ' solicita ' || v_espacio_nombre || ' para el ' || v_fecha,
        '/reservas',
        jsonb_build_object('reserva_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_admin_nueva_reserva
AFTER INSERT ON reservas
FOR EACH ROW
EXECUTE FUNCTION notificar_admin_nueva_reserva();

-- 4. Notificar cuando se confirma un comprobante
CREATE OR REPLACE FUNCTION notificar_comprobante_confirmado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_monto DECIMAL;
  v_mes TEXT;
BEGIN
  IF NEW.estado = 'confirmado' AND OLD.estado = 'pendiente' THEN
    
    SELECT r.user_id, gd.monto, 
           TO_CHAR(DATE(gc.anio || '-' || gc.mes || '-01'), 'TMMonth YYYY') as periodo
    INTO v_user_id, v_monto, v_mes
    FROM pagos p
    JOIN gastos_departamento gd ON p.gasto_departamento_id = gd.id
    JOIN gastos_comunes gc ON gd.gasto_comun_id = gc.id
    JOIN departamentos d ON gd.departamento_id = d.id
    JOIN residentes r ON r.departamento_id = d.id
    WHERE p.id = NEW.id
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
      PERFORM crear_notificacion(
        v_user_id,
        'pago_confirmado',
        '✅ Pago Confirmado',
        'Tu pago de $' || TO_CHAR(v_monto, 'FM999,999,999') || ' de ' || v_mes || ' fue confirmado',
        '/gastos',
        jsonb_build_object('pago_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_comprobante_confirmado
AFTER UPDATE ON pagos
FOR EACH ROW
EXECUTE FUNCTION notificar_comprobante_confirmado();

-- 5. Notificar cuando se rechaza un comprobante
CREATE OR REPLACE FUNCTION notificar_comprobante_rechazado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_monto DECIMAL;
  v_mes TEXT;
BEGIN
  IF NEW.estado = 'rechazado' AND OLD.estado = 'pendiente' THEN
    
    SELECT r.user_id, gd.monto, 
           TO_CHAR(DATE(gc.anio || '-' || gc.mes || '-01'), 'TMMonth YYYY') as periodo
    INTO v_user_id, v_monto, v_mes
    FROM pagos p
    JOIN gastos_departamento gd ON p.gasto_departamento_id = gd.id
    JOIN gastos_comunes gc ON gd.gasto_comun_id = gc.id
    JOIN departamentos d ON gd.departamento_id = d.id
    JOIN residentes r ON r.departamento_id = d.id
    WHERE p.id = NEW.id
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
      PERFORM crear_notificacion(
        v_user_id,
        'pago_rechazado',
        '❌ Comprobante Rechazado',
        'Tu comprobante de $' || TO_CHAR(v_monto, 'FM999,999,999') || ' de ' || v_mes || ' fue rechazado. Por favor sube uno nuevo.',
        '/gastos',
        jsonb_build_object('pago_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_comprobante_rechazado
AFTER UPDATE ON pagos
FOR EACH ROW
EXECUTE FUNCTION notificar_comprobante_rechazado();

-- 6. Notificar al admin cuando hay nuevo comprobante
CREATE OR REPLACE FUNCTION notificar_admin_nuevo_comprobante()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_admin_user_id UUID;
  v_depto_numero TEXT;
  v_monto DECIMAL;
BEGIN
  IF NEW.estado = 'pendiente' THEN
    
    SELECT ur.user_id, d.numero, gd.monto
    INTO v_admin_user_id, v_depto_numero, v_monto
    FROM gastos_departamento gd
    JOIN departamentos d ON gd.departamento_id = d.id
    JOIN gastos_comunes gc ON gd.gasto_comun_id = gc.id
    JOIN user_roles ur ON ur.edificio_id = gc.edificio_id
    WHERE gd.id = NEW.gasto_departamento_id
      AND ur.role = 'admin'
    LIMIT 1;
    
    IF v_admin_user_id IS NOT NULL THEN
      PERFORM crear_notificacion(
        v_admin_user_id,
        'comprobante_pendiente',
        '💵 Nuevo Comprobante',
        'Depto ' || v_depto_numero || ' subió un comprobante de $' || TO_CHAR(v_monto, 'FM999,999,999'),
        '/validar-comprobantes',
        jsonb_build_object('pago_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_admin_nuevo_comprobante
AFTER INSERT ON pagos
FOR EACH ROW
EXECUTE FUNCTION notificar_admin_nuevo_comprobante();