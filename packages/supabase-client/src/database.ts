import { supabase } from './client'
import type { Database } from '../../shared/types/database.types'

// Types helpers
type Tables = Database['public']['Tables']
type Edificio = Tables['edificios']['Row']
type Departamento = Tables['departamentos']['Row']
type Residente = Tables['residentes']['Row']
type GastoComun = Tables['gastos_comunes']['Row']
type GastoDepartamento = Tables['gastos_departamento']['Row']
type Pago = Tables['pagos']['Row']
type Aviso = Tables['avisos']['Row']

// ============================================
// EDIFICIOS
// ============================================
export const edificiosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('edificios')
      .select('*')
      .order('nombre')
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('edificios')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(edificio: Omit<Edificio, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('edificios')
      .insert(edificio)
      .select()
      .single()
    return { data, error }
  },

  async update(id: string, edificio: Partial<Edificio>) {
    const { data, error } = await supabase
      .from('edificios')
      .update(edificio)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase.from('edificios').delete().eq('id', id)
    return { error }
  },
}

// ============================================
// DEPARTAMENTOS
// ============================================
export const departamentosService = {
  async getByEdificio(edificioId: string) {
    const { data, error } = await supabase
      .from('departamentos')
      .select(`
        *,
        residentes (*)
      `)
      .eq('edificio_id', edificioId)
      .order('numero')
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('departamentos')
      .select(`
        *,
        edificio:edificios(*),
        residentes(*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(departamento: Omit<Departamento, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('departamentos')
      .insert(departamento)
      .select()
      .single()
    return { data, error }
  },

  async update(id: string, departamento: Partial<Departamento>) {
    const { data, error } = await supabase
      .from('departamentos')
      .update(departamento)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase.from('departamentos').delete().eq('id', id)
    return { error }
  },
}

// ============================================
// RESIDENTES
// ============================================
export const residentesService = {
  async getByDepartamento(departamentoId: string) {
    const { data, error } = await supabase
      .from('residentes')
      .select('*')
      .eq('departamento_id', departamentoId)
    return { data, error }
  },

  async getByEdificio(edificioId: string) {
    const { data, error } = await supabase
      .from('residentes')
      .select(`
        *,
        departamento:departamentos(
          *,
          edificio:edificios(*)
        )
      `)
      .eq('departamento.edificio_id', edificioId)
    return { data, error }
  },

  async create(residente: Omit<Residente, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('residentes')
      .insert(residente)
      .select()
      .single()
    return { data, error }
  },

  async update(id: string, residente: Partial<Residente>) {
    const { data, error } = await supabase
      .from('residentes')
      .update(residente)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase.from('residentes').delete().eq('id', id)
    return { error }
  },
}

// ============================================
// GASTOS COMUNES
// ============================================
export const gastosService = {
  async getByEdificio(edificioId: string) {
    const { data, error } = await supabase
      .from('gastos_comunes')
      .select(`
        *,
        gastos_departamento(
          *,
          departamento:departamentos(numero)
        )
      `)
      .eq('edificio_id', edificioId)
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('gastos_comunes')
      .select(`
        *,
        gastos_departamento(
          *,
          departamento:departamentos(*),
          pagos(*)
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(gasto: Omit<GastoComun, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('gastos_comunes')
      .insert(gasto)
      .select()
      .single()
    return { data, error }
  },

  async update(id: string, gasto: Partial<GastoComun>) {
    const { data, error } = await supabase
      .from('gastos_comunes')
      .update(gasto)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },
}

// ============================================
// AVISOS
// ============================================
export const avisosService = {
  async getByEdificio(edificioId: string) {
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .eq('edificio_id', edificioId)
      .eq('activo', true)
      .order('fecha_publicacion', { ascending: false })
    return { data, error }
  },

  async create(aviso: Omit<Aviso, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('avisos')
      .insert(aviso)
      .select()
      .single()
    return { data, error }
  },

  async update(id: string, aviso: Partial<Aviso>) {
    const { data, error } = await supabase
      .from('avisos')
      .update(aviso)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase.from('avisos').delete().eq('id', id)
    return { error }
  },
}

// Exportar types
export type {
  Edificio,
  Departamento,
  Residente,
  GastoComun,
  GastoDepartamento,
  Pago,
  Aviso,
}