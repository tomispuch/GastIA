-- =====================================================
-- GastIA — Row Level Security (RLS) Policies
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =====================================================
-- Cada tabla solo permite que el usuario autenticado
-- acceda a sus propias filas (user_id = auth.uid())
-- =====================================================

-- GASTOS
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gastos_owner" ON gastos;
CREATE POLICY "gastos_owner" ON gastos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INGRESOS
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ingresos_owner" ON ingresos;
CREATE POLICY "ingresos_owner" ON ingresos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CUENTAS
ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cuentas_owner" ON cuentas;
CREATE POLICY "cuentas_owner" ON cuentas
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DEUDAS
ALTER TABLE deudas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deudas_owner" ON deudas;
CREATE POLICY "deudas_owner" ON deudas
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PRESUPUESTOS
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "presupuestos_owner" ON presupuestos;
CREATE POLICY "presupuestos_owner" ON presupuestos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TRANSFERENCIAS
ALTER TABLE transferencias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transferencias_owner" ON transferencias;
CREATE POLICY "transferencias_owner" ON transferencias
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- USUARIOS_CONFIG
ALTER TABLE usuarios_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usuarios_config_owner" ON usuarios_config;
CREATE POLICY "usuarios_config_owner" ON usuarios_config
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CATEGORIAS_CUSTOM
ALTER TABLE categorias_custom ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categorias_custom_owner" ON categorias_custom;
CREATE POLICY "categorias_custom_owner" ON categorias_custom
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- LOGROS_USUARIO
ALTER TABLE logros_usuario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "logros_usuario_owner" ON logros_usuario;
CREATE POLICY "logros_usuario_owner" ON logros_usuario
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RACHA_USUARIO
ALTER TABLE racha_usuario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "racha_usuario_owner" ON racha_usuario;
CREATE POLICY "racha_usuario_owner" ON racha_usuario
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
